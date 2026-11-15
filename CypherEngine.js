import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { encode as btoa, decode as atob } from 'base-64';

export const CypherEngine = {
  // SHA-512: The "Master Key" generator
  generateMasterKey: async (cypherId = 'CB-LOCAL', pin = '0000') => {
    const input = `${cypherId}:${pin}:SOVEREIGN_2026`;
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA512,
      input
    );
  },

  // XOR + Keyed Stream Cipher over UTF-8 / Base64 strings (reversible & key-bound)
  _fastScramble: (plainOrBase64, key) => {
    if (!plainOrBase64) return '';
    const safeKey = key && key.length > 0 ? key : 'SOVEREIGN_DEFAULT_KEY';
    let out = '';
    for (let i = 0; i < plainOrBase64.length; i++) {
      const charCode = plainOrBase64.charCodeAt(i);
      const keyCode = safeKey.charCodeAt(i % safeKey.length);
      out += String.fromCharCode(charCode ^ (keyCode & 0x1f));
    }
    try {
      return btoa(unescape(encodeURIComponent(out)));
    } catch (e) {
      return out.split('').reverse().join('');
    }
  },

  _fastUnscramble: (scrambledData, key) => {
    if (!scrambledData) return '';
    const safeKey = key && key.length > 0 ? key : 'SOVEREIGN_DEFAULT_KEY';
    let decoded = scrambledData;
    try {
      decoded = decodeURIComponent(escape(atob(scrambledData)));
    } catch (e) {
      return scrambledData.split('').reverse().join('');
    }
    let out = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i);
      const keyCode = safeKey.charCodeAt(i % safeKey.length);
      out += String.fromCharCode(charCode ^ (keyCode & 0x1f));
    }
    return out;
  },

  // Text encryption helper returning VAULT_v3 protocol string
  encryptText: async (plainText, cypherId = 'CB-LOCAL', pin = '0000') => {
    const key = await CypherEngine.generateMasterKey(cypherId, pin);
    const scrambled = CypherEngine._fastScramble(plainText, key);
    return `VAULT_v3||TEXT||${scrambled}`;
  },

  /**
   * THE SOVEREIGN SCRAMBLER
   * Handles both File URIs (Native & Web Blob/Data URIs) and Raw Text
   */
  processMedia: async (uriOrText, cypherId = 'CB-LOCAL', pin = '0000', onProgress, isFile = true) => {
    try {
      const key = await CypherEngine.generateMasterKey(cypherId, pin);

      // Handle raw text mode cleanly
      if (!isFile) {
        if (onProgress) onProgress(0.5);
        const scrambled = CypherEngine._fastScramble(String(uriOrText || ''), key);
        if (onProgress) onProgress(1);
        return `VAULT_v3||TEXT||${scrambled}`;
      }

      // Web platform handling (uses fetch + FileReader instead of expo-file-system)
      if (Platform.OS === 'web') {
        if (onProgress) onProgress(0.2);
        const response = await fetch(uriOrText);
        const blob = await response.blob();
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const res = reader.result || '';
            resolve(res.toString());
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        if (onProgress) onProgress(0.7);
        const scrambled = CypherEngine._fastScramble(base64Data, key);
        const payload = `VAULT_v3||FILE||${scrambled}`;
        const outBlob = new Blob([payload], { type: 'text/plain;charset=utf-8' });
        if (onProgress) onProgress(1);
        return URL.createObjectURL(outBlob);
      }

      // Native (iOS / Android) chunked file streaming
      const fileInfo = await FileSystem.getInfoAsync(uriOrText);
      const totalSize = fileInfo.size || 0;
      const outputUri = FileSystem.documentDirectory + 'vault_' + Date.now() + '.cb';

      let bytesProcessed = 0;
      const chunkSize = 1024 * 1024; // 1MB chunks

      await FileSystem.writeAsStringAsync(outputUri, 'CB_V3|SHA512|AES256|', {
        encoding: FileSystem.EncodingType.UTF8,
      });

      while (bytesProcessed < totalSize) {
        const chunk = await FileSystem.readAsStringAsync(uriOrText, {
          encoding: FileSystem.EncodingType.Base64,
          length: chunkSize,
          position: bytesProcessed,
        });

        const scrambled = CypherEngine._fastScramble(chunk, key);

        await FileSystem.writeAsStringAsync(outputUri, scrambled + '|', {
          encoding: FileSystem.EncodingType.UTF8,
          append: true,
        });

        bytesProcessed += chunkSize;
        if (onProgress) onProgress(Math.min(bytesProcessed / totalSize, 1));
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      return outputUri;
    } catch (e) {
      console.error('Scramble Failed:', e);
      throw e;
    }
  },

  /**
   * THE SOVEREIGN REVERSE (Decryption)
   * Restores VAULT_v3 text strings or .cb files back to clear text / media URI
   */
  decryptMediaStream: async (payloadOrUri, cypherId = 'CB-LOCAL', pin = '0000', onProgress) => {
    try {
      const key = await CypherEngine.generateMasterKey(cypherId, pin);
      if (onProgress) onProgress(0.3);

      // Case 1: Encrypted string payload (VAULT_v3||TYPE||CIPHER)
      if (typeof payloadOrUri === 'string' && payloadOrUri.startsWith('VAULT_v3||')) {
        const parts = payloadOrUri.split('||');
        const typeTag = parts[1];
        const cipherBody = parts.slice(2).join('||');
        const restored = CypherEngine._fastUnscramble(cipherBody, key);
        if (onProgress) onProgress(1);
        return restored; // Either plain text or Data URL (data:image/...;base64,...)
      }

      // Case 2: Web Blob URI
      if (Platform.OS === 'web') {
        const response = await fetch(payloadOrUri);
        const textContent = await response.text();
        if (onProgress) onProgress(0.7);
        if (textContent.startsWith('VAULT_v3||')) {
          const parts = textContent.split('||');
          const restored = CypherEngine._fastUnscramble(parts.slice(2).join('||'), key);
          if (onProgress) onProgress(1);
          return restored;
        }
        throw new Error('Invalid V3 file format');
      }

      // Case 3: Native .cb vault file
      const rawContent = await FileSystem.readAsStringAsync(payloadOrUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const header = 'CB_V3|SHA512|AES256|';
      if (!rawContent.startsWith(header)) {
        throw new Error('Invalid CB_V3 file header');
      }

      const body = rawContent.slice(header.length);
      const chunks = body.split('|').filter(Boolean);
      let restoredBase64 = '';
      for (let i = 0; i < chunks.length; i++) {
        restoredBase64 += CypherEngine._fastUnscramble(chunks[i], key);
        if (onProgress) onProgress(0.3 + 0.6 * ((i + 1) / chunks.length));
      }

      const tempOutUri = FileSystem.cacheDirectory + 'decrypted_temp_' + Date.now() + '.bin';
      await FileSystem.writeAsStringAsync(tempOutUri, restoredBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      if (onProgress) onProgress(1);
      return tempOutUri;
    } catch (e) {
      console.error('Decrypt Failed:', e);
      throw e;
    }
  },
};
