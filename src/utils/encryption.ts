
// NOTE: This is a simplified implementation for demo purposes
// In a real application, use proper crypto libraries and secure key management

/**
 * Generates a public/private key pair for a user
 * @returns A promise that resolves to an object containing the key pair
 */
export const generateKeyPair = async (): Promise<{ publicKey: string; privateKey: string }> => {
  // In a real app, this would use proper cryptographic functions
  // For this demo, we're just creating a unique string as a key
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  
  // Convert to base64 for storage
  const privateKey = btoa(String.fromCharCode.apply(null, [...randomBytes]));
  const publicKey = `pub-${privateKey.substring(0, 10)}`;
  
  return { publicKey, privateKey };
};

/**
 * Encrypts data with a key
 * @param data The data to encrypt
 * @param key The encryption key
 * @returns The encrypted data
 */
export const encryptData = async (data: string, key: string): Promise<string> => {
  // In a real app, this would use proper encryption
  // For demo purposes, we're just doing a simple encoding
  // DO NOT use this in production!
  
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  // Convert key to array of bytes to use for simple XOR
  const keyBytes = new TextEncoder().encode(key);
  
  // Simple XOR encryption (NOT SECURE - just for demo)
  const encrypted = new Uint8Array(dataBuffer.length);
  for (let i = 0; i < dataBuffer.length; i++) {
    encrypted[i] = dataBuffer[i] ^ keyBytes[i % keyBytes.length];
  }
  
  // Convert to base64 for storage
  return btoa(String.fromCharCode.apply(null, [...encrypted]));
};

/**
 * Decrypts data with a key
 * @param encryptedData The encrypted data
 * @param key The decryption key
 * @returns The decrypted data
 */
export const decryptData = async (encryptedData: string, key: string): Promise<string> => {
  // For demo purposes, basically the reverse of the encrypt function
  // In a real app, use proper decryption functions
  
  // Convert from base64
  const encryptedBytes = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  
  // Convert key to array of bytes
  const keyBytes = new TextEncoder().encode(key);
  
  // Simple XOR decryption (NOT SECURE - just for demo)
  const decrypted = new Uint8Array(encryptedBytes.length);
  for (let i = 0; i < encryptedBytes.length; i++) {
    decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  // Convert back to string
  return new TextDecoder().decode(decrypted);
};
