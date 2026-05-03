const ENCRYPTION_KEY = import.meta.env.VITE_STORAGE_ENCRYPT_KEY || 'falcon-pms-secure-key-2024';

const stringToArrayBuffer = (str) => {
  const encoder = new TextEncoder();
  return encoder.encode(str);
};

const arrayBufferToString = (buffer) => {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
};

const getEncryptionKey = async () => {
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    stringToArrayBuffer(ENCRYPTION_KEY),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  const salt = stringToArrayBuffer('falcon-salt');
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

export const encrypt = async (data) => {
  try {
    const key = await getEncryptionKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      stringToArrayBuffer(data)
    );
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error('Encryption error:', error);
    return data;
  }
};

export const decrypt = async (encryptedData) => {
  try {
    const key = await getEncryptionKey();
    const combined = Uint8Array.from(atob(encryptedData), (c) => c.charCodeAt(0));

    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    return arrayBufferToString(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedData;
  }
};
