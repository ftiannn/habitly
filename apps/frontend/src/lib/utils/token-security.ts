/**
 * Token Security Utilities for localStorage protection
 * 
 * Note: This provides obfuscation for tokens in localStorage, making them
 * not immediately readable. While not cryptographically secure (since this
 * runs client-side), it adds a layer of protection against casual inspection.
 */

class TokenSecurity {
  private static readonly SALT = 'habitly_secure_2024';
  private static readonly KEY_ROTATION = [72, 65, 66, 73, 84, 76, 89]; // HABITLY in ASCII

  /**
   * Hash/obfuscate a token for localStorage storage
   */
  static hashToken(token: string): string {
    if (!token) return '';
  
    try {
      const timestamp = Date.now().toString(36);
      const saltedToken = `${timestamp}:${this.SALT}:${token}`;
      
      const encrypted = this.xorCipher(saltedToken, this.KEY_ROTATION);
      const result = btoa(encrypted);
      
      return result;
    } catch (error) {
      return token;
    }
  }

  /**
   * Unhash/deobfuscate a token from localStorage
   */
  static unhashToken(hashedToken: string): string {
    if (!hashedToken) return '';
  
    try {

      // Base64 decode
      const encrypted = atob(hashedToken);
      
      // Apply XOR cipher to decrypt
      const decrypted = this.xorCipher(encrypted, this.KEY_ROTATION);
      
      // Extract original token (format: timestamp:salt:token)
      const parts = decrypted.split(':');
      
      if (parts.length >= 3 && parts[1] === this.SALT) {
        const originalToken = parts.slice(2).join(':');
        return originalToken;
      }
      
      return hashedToken;
    } catch (error) {
      console.error('Token unhashing failed:', error);
      return hashedToken;
    }
  }

  /**
   * Simple XOR cipher with rotating key
   */
  private static xorCipher(text: string, key: number[]): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const keyCode = key[i % key.length];
      result += String.fromCharCode(charCode ^ keyCode);
    }
    return result;
  }

  /**
   * Check if a string appears to be a hashed token
   */
  static isHashedToken(token: string): boolean {
    try {
      // Hashed tokens should be base64 encoded
      const decoded = atob(token);
      return decoded.includes(this.SALT);
    } catch {
      return false;
    }
  }

  /**
   * Clean up old or invalid hashed tokens
   */
  static validateHashedToken(hashedToken: string): boolean {
    try {
      const decrypted = atob(hashedToken);
      const parts = decrypted.split(':');
      
      if (parts.length >= 3 && parts[1] === this.SALT) {
        // Check if timestamp is reasonable (within last 60 days)
        const timestamp = parseInt(parts[0], 36);
        const now = Date.now();
        const sixtyDaysAgo = now - (60 * 24 * 60 * 60 * 1000);
        
        return timestamp > sixtyDaysAgo && timestamp <= now;
      }
      
      return false;
    } catch {
      return false;
    }
  }
}

export default TokenSecurity;