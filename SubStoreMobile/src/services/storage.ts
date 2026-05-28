import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, LogEntry } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'app_settings',
  LOGS: 'app_logs',
  CACHE: 'app_cache',
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
};

class StorageService {
  async getSettings(): Promise<AppSettings | null> {
    try {
      const settings = await SecureStore.getItemAsync(STORAGE_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Failed to get settings:', error);
      return null;
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  async getTheme(): Promise<'light' | 'dark' | 'auto' | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.THEME) as 'light' | 'dark' | 'auto' | null;
    } catch {
      return null;
    }
  }

  async setTheme(theme: 'light' | 'dark' | 'auto'): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.THEME, theme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }

  async getLanguage(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.LANGUAGE);
    } catch {
      return null;
    }
  }

  async setLanguage(language: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.LANGUAGE, language);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  }

  async addLog(level: LogEntry['level'], message: string): Promise<void> {
    try {
      const logs = await this.getLogs();
      const newLog: LogEntry = {
        level,
        message,
        timestamp: Date.now(),
      };
      
      const updatedLogs = [newLog, ...logs].slice(0, 1000);
      await AsyncStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updatedLogs));
    } catch (error) {
      console.error('Failed to add log:', error);
    }
  }

  async getLogs(): Promise<LogEntry[]> {
    try {
      const logs = await AsyncStorage.getItem(STORAGE_KEYS.LOGS);
      return logs ? JSON.parse(logs) : [];
    } catch {
      return [];
    }
  }

  async clearLogs(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.LOGS);
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  }

  async getCache(key: string): Promise<any> {
    try {
      const cache = await AsyncStorage.getItem(`${STORAGE_KEYS.CACHE}_${key}`);
      if (!cache) return null;

      const parsed = JSON.parse(cache);
      if (parsed.expiry && parsed.expiry < Date.now()) {
        await AsyncStorage.removeItem(`${STORAGE_KEYS.CACHE}_${key}`);
        return null;
      }

      return parsed.data;
    } catch {
      return null;
    }
  }

  async setCache(key: string, data: any, ttl?: number): Promise<void> {
    try {
      const cacheEntry = {
        data,
        expiry: ttl ? Date.now() + ttl * 1000 : null,
      };
      await AsyncStorage.setItem(`${STORAGE_KEYS.CACHE}_${key}`, JSON.stringify(cacheEntry));
    } catch (error) {
      console.error('Failed to set cache:', error);
    }
  }

  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.CACHE));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  async exportData(): Promise<string> {
    try {
      const settings = await this.getSettings();
      const logs = await this.getLogs();
      
      return JSON.stringify({
        settings,
        logs,
        exportDate: new Date().toISOString(),
      }, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      return '{}';
    }
  }

  async importData(data: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.settings) {
        await this.saveSettings(parsed.settings);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}

export const storageService = new StorageService();
export default storageService;
