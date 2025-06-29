// Universal storage solution for web and React Native
import { Platform } from 'react-native';

interface StorageInterface {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  multiRemove(keys: string[]): Promise<void>;
  clear(): Promise<void>;
}

class WebStorage implements StorageInterface {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage not available:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('localStorage setItem failed:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('localStorage removeItem failed:', error);
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('localStorage multiRemove failed:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('localStorage clear failed:', error);
    }
  }
}

class ReactNativeStorage implements StorageInterface {
  private AsyncStorage: any;

  constructor() {
    // Dynamically import AsyncStorage only on React Native
    try {
      this.AsyncStorage = require('@react-native-async-storage/async-storage').default;
    } catch (error) {
      console.warn('AsyncStorage not available:', error);
      this.AsyncStorage = null;
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (!this.AsyncStorage) return null;
    try {
      return await this.AsyncStorage.getItem(key);
    } catch (error) {
      console.warn('AsyncStorage getItem failed:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!this.AsyncStorage) return;
    try {
      await this.AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn('AsyncStorage setItem failed:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    if (!this.AsyncStorage) return;
    try {
      await this.AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn('AsyncStorage removeItem failed:', error);
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    if (!this.AsyncStorage) return;
    try {
      await Promise.all(keys.map(key => this.AsyncStorage.removeItem(key)));
    } catch (error) {
      console.warn('AsyncStorage multiRemove failed:', error);
    }
  }

  async clear(): Promise<void> {
    if (!this.AsyncStorage) return;
    try {
      await this.AsyncStorage.clear();
    } catch (error) {
      console.warn('AsyncStorage clear failed:', error);
    }
  }
}

// Export universal storage instance
export const universalStorage: StorageInterface = Platform.OS === 'web' 
  ? new WebStorage() 
  : new ReactNativeStorage();

export default universalStorage; 