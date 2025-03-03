
// Improved encryption utilities using the Web Crypto API
// This implements proper asymmetric/symmetric encryption for secure data storage

/**
 * Generates a secure public/private key pair for a user
 * @returns A promise that resolves to an object containing the key pair
 */
export const generateKeyPair = async (): Promise<{ publicKey: string; privateKey: string }> => {
  try {
    // Generate an RSA key pair
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
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
    
    // Encrypt the actual data with AES-GCM
    const dataBuffer = new TextEncoder().encode(data);
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      aesKey,
      dataBuffer
    );
    
    // Combine all encrypted components into one package
    const result = {
      encryptedDataKey: bufferToBase64(encryptedDataKey),
      iv: bufferToBase64(iv),
      encryptedData: bufferToBase64(encryptedData),
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
      encryptedData,
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
    
    // Decrypt the data key
    const encryptedDataKeyBuffer = base64ToBuffer(encryptedDataKey);
    const dataKeyBuffer = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      privateKey,
      encryptedDataKeyBuffer
    );
    
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
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(ivBuffer),
      },
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
