
import CryptoJS from 'crypto-js';

export class EncryptionService {
  private static instance: EncryptionService;
  private readonly secretKey: string;

  constructor() {
    // In production, this would be a proper secret from environment variables
    this.secretKey = process.env.ENCRYPTION_SECRET_KEY || 'your-secret-key-here';
  }

  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  // Encrypt sensitive data
  encrypt(plaintext: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(plaintext, this.secretKey).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt sensitive data
  decrypt(ciphertext: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(ciphertext, this.secretKey);
      const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!plaintext) {
        throw new Error('Invalid ciphertext or key');
      }
      
      return plaintext;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  // Hash passwords securely
  hashPassword(password: string): string {
    try {
      // Generate salt
      const salt = CryptoJS.lib.WordArray.random(128/8);
      
      // Hash with PBKDF2
      const hash = CryptoJS.PBKDF2(password, salt, {
        keySize: 256/32,
        iterations: 10000
      });

      // Combine salt and hash
      const combined = salt.concat(hash);
      return combined.toString(CryptoJS.enc.Base64);
    } catch (error) {
      console.error('Password hashing failed:', error);
      throw new Error('Failed to hash password');
    }
  }

  // Verify password against hash
  verifyPassword(password: string, hashedPassword: string): boolean {
    try {
      // Parse the stored hash
      const combined = CryptoJS.enc.Base64.parse(hashedPassword);
      
      // Extract salt (first 16 bytes) and hash (remaining bytes)
      const salt = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4));
      const hash = CryptoJS.lib.WordArray.create(combined.words.slice(4));

      // Hash the input password with the same salt
      const inputHash = CryptoJS.PBKDF2(password, salt, {
        keySize: 256/32,
        iterations: 10000
      });

      // Compare hashes
      return inputHash.toString() === hash.toString();
    } catch (error) {
      console.error('Password verification failed:', error);
      return false;
    }
  }

  // Generate secure random tokens
  generateToken(length: number = 32): string {
    try {
      const randomBytes = CryptoJS.lib.WordArray.random(length);
      return randomBytes.toString(CryptoJS.enc.Hex);
    } catch (error) {
      console.error('Token generation failed:', error);
      throw new Error('Failed to generate secure token');
    }
  }

  // Encrypt file content
  encryptFile(fileContent: string, fileName: string): { encryptedContent: string; metadata: any } {
    try {
      const timestamp = new Date().toISOString();
      const metadata = {
        originalName: fileName,
        encryptedAt: timestamp,
        algorithm: 'AES-256'
      };

      const dataToEncrypt = JSON.stringify({
        content: fileContent,
        metadata
      });

      const encrypted = this.encrypt(dataToEncrypt);
      
      return {
        encryptedContent: encrypted,
        metadata
      };
    } catch (error) {
      console.error('File encryption failed:', error);
      throw new Error('Failed to encrypt file');
    }
  }

  // Decrypt file content
  decryptFile(encryptedContent: string): { content: string; metadata: any } {
    try {
      const decrypted = this.decrypt(encryptedContent);
      const parsed = JSON.parse(decrypted);
      
      return {
        content: parsed.content,
        metadata: parsed.metadata
      };
    } catch (error) {
      console.error('File decryption failed:', error);
      throw new Error('Failed to decrypt file');
    }
  }

  // Create HMAC for data integrity
  createHMAC(data: string): string {
    try {
      const hmac = CryptoJS.HmacSHA256(data, this.secretKey);
      return hmac.toString(CryptoJS.enc.Hex);
    } catch (error) {
      console.error('HMAC creation failed:', error);
      throw new Error('Failed to create HMAC');
    }
  }

  // Verify HMAC for data integrity
  verifyHMAC(data: string, expectedHMAC: string): boolean {
    try {
      const calculatedHMAC = this.createHMAC(data);
      return calculatedHMAC === expectedHMAC;
    } catch (error) {
      console.error('HMAC verification failed:', error);
      return false;
    }
  }

  // Encrypt sensitive user data for storage
  encryptUserData(userData: any): string {
    try {
      const jsonData = JSON.stringify(userData);
      return this.encrypt(jsonData);
    } catch (error) {
      console.error('User data encryption failed:', error);
      throw new Error('Failed to encrypt user data');
    }
  }

  // Decrypt sensitive user data from storage
  decryptUserData(encryptedData: string): any {
    try {
      const decrypted = this.decrypt(encryptedData);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('User data decryption failed:', error);
      throw new Error('Failed to decrypt user data');
    }
  }
}

export const encryptionService = EncryptionService.getInstance();
