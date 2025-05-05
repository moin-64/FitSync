
// Improved encryption utilities using the Web Crypto API
// This implements proper asymmetric/symmetric encryption for secure data storage

/**
 * Generates a secure public/private key pair for a user
 * @returns A promise that resolves to an object containing the key pair
 */
export const generateKeyPair = async (): Promise<{ publicKey: string; privateKey: string }> => {
  try {
    // Generate an RSA key pair with stronger key length (3072 bits instead of 2048)
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 3072, // Upgraded from 2048 for better security
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true, // extractable
      ["encrypt", "decrypt"]
    );

    // Export the public key
    const publicKeyBuffer = await window.crypto.subtle.exportKey(
      "spki",
      keyPair.publicKey
    );
    
    // Export the private key
    const privateKeyBuffer = await window.crypto.subtle.exportKey(
      "pkcs8",
      keyPair.privateKey
    );
    
    // Convert keys to base64 strings for storage
    const publicKey = bufferToBase64(publicKeyBuffer);
    const privateKey = bufferToBase64(privateKeyBuffer);
    
    return { publicKey, privateKey };
  } catch (error) {
    console.error("Error generating key pair:", error);
    throw new Error("Failed to generate encryption keys");
  }
};

/**
 * Helper function to convert ArrayBuffer to Base64 string
 */
const bufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

/**
 * Helper function to convert Base64 string to ArrayBuffer
 */
const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * Generates a symmetric key for data encryption
 * @returns A promise that resolves to the symmetric key as a string
 */
export const generateDataKey = async (): Promise<string> => {
  // Generate a random AES-GCM key
  const key = await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true, // extractable
    ["encrypt", "decrypt"]
  );
  
  // Export the key
  const exportedKey = await window.crypto.subtle.exportKey("raw", key);
  return bufferToBase64(exportedKey);
};

/**
 * Securely hashes a password for secure storage or validation
 * @param password The password to hash
 * @returns A promise that resolves to the hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  // Convert password string to buffer
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  
  // Hash the password using SHA-256
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  
  // Convert to base64 string
  return bufferToBase64(hashBuffer);
};

/**
 * Encrypts user data with the provided public key
 * @param data The data to encrypt
 * @param publicKeyString The public key as a base64 string
 * @returns The encrypted data object with the encrypted data and IV
 */
export const encryptData = async (data: string, publicKeyString: string): Promise<string> => {
  try {
    // Generate a data key for symmetric encryption
    const dataKey = await generateDataKey();
    
    // Import the public key
    const publicKeyBuffer = base64ToBuffer(publicKeyString);
    const publicKey = await window.crypto.subtle.importKey(
      "spki",
      publicKeyBuffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false, // not extractable
      ["encrypt"]
    );
    
    // Encrypt the data key with the public key
    const dataKeyBuffer = base64ToBuffer(dataKey);
    const encryptedDataKey = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKey,
      dataKeyBuffer
    );
    
    // Generate IV for AES-GCM
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    // Import the data key for AES encryption
    const aesKey = await window.crypto.subtle.importKey(
      "raw",
      dataKeyBuffer,
      {
        name: "AES-GCM",
        length: 256,
      },
      false, // not extractable
      ["encrypt"]
    );
    
    // Add salt for additional security
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    
    // Encrypt the actual data with AES-GCM
    const dataBuffer = new TextEncoder().encode(data);
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
        additionalData: salt // Add salt as additional authenticated data
      },
      aesKey,
      dataBuffer
    );
    
    // Combine all encrypted components into one package
    const result = {
      encryptedDataKey: bufferToBase64(encryptedDataKey),
      iv: bufferToBase64(iv),
      salt: bufferToBase64(salt),
      encryptedData: bufferToBase64(encryptedData),
      version: '1.2', // Updated version tracking
    };
    
    // Return as JSON string
    return JSON.stringify(result);
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
};

/**
 * Decrypts data with the provided private key
 * @param encryptedPackage The encrypted data package
 * @param privateKeyString The private key as a base64 string
 * @returns The decrypted data
 */
export const decryptData = async (encryptedPackage: string, privateKeyString: string): Promise<string> => {
  try {
    // Parse the encrypted package
    const {
      encryptedDataKey,
      iv,
      salt,
      encryptedData,
      version
    } = JSON.parse(encryptedPackage);
    
    // Import the private key
    const privateKeyBuffer = base64ToBuffer(privateKeyString);
    const privateKey = await window.crypto.subtle.importKey(
      "pkcs8",
      privateKeyBuffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false, // not extractable
      ["decrypt"]
    );
    
    // Decrypt the data key with retries and improved error handling
    let dataKeyBuffer;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const encryptedDataKeyBuffer = base64ToBuffer(encryptedDataKey);
        dataKeyBuffer = await window.crypto.subtle.decrypt(
          {
            name: "RSA-OAEP",
          },
          privateKey,
          encryptedDataKeyBuffer
        );
        break; // Success, exit the retry loop
      } catch (decryptError) {
        retryCount++;
        console.warn(`Decryption attempt ${retryCount} failed, retrying...`);
        if (retryCount >= maxRetries) throw decryptError;
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay before retry
      }
    }
    
    // Import the data key for AES decryption
    const aesKey = await window.crypto.subtle.importKey(
      "raw",
      dataKeyBuffer,
      {
        name: "AES-GCM",
        length: 256,
      },
      false, // not extractable
      ["decrypt"]
    );
    
    // Decrypt the data
    const ivBuffer = base64ToBuffer(iv);
    const encryptedDataBuffer = base64ToBuffer(encryptedData);
    
    // Handle both old and new encryption formats
    const decryptParams: any = {
      name: "AES-GCM",
      iv: new Uint8Array(ivBuffer),
    };
    
    // Add additionalData for newer versions
    if (version >= '1.2' && salt) {
      const saltBuffer = base64ToBuffer(salt);
      decryptParams.additionalData = saltBuffer;
    }
    
    const decryptedData = await window.crypto.subtle.decrypt(
      decryptParams,
      aesKey,
      encryptedDataBuffer
    );
    
    // Convert the decrypted data to string
    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
};

/**
 * Generates a secure random token of specified length
 * @param length The length of the token in bytes
 * @returns A secure random token as a base64 string
 */
export const generateSecureToken = (length: number = 32): string => {
  const randomValues = window.crypto.getRandomValues(new Uint8Array(length));
  return bufferToBase64(randomValues);
};

/**
 * Compare two strings in constant time to prevent timing attacks
 * @param a First string
 * @param b Second string
 * @returns Whether the strings are equal
 */
export const constantTimeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
};
