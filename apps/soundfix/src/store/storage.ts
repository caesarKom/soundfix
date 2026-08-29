import {MMKV} from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'app-storage',
  encryptionKey: 'my-secret-key',
});

export const token_storage = new MMKV({
  id: 'user-storage',
  encryptionKey: 'RSA Key',
});

export const mmkvStorage = {
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  getItem: (key: string) => {
    const value = storage.getString(key);
    return value ?? null;
  },
  removeItem: (key: string) => {
    storage.delete(key);
  },
};