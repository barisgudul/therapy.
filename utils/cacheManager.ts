import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, CacheItem<any>>;
  private readonly DEFAULT_EXPIRY = 1000 * 60 * 60; // 1 saat

  private constructor() {
    this.cache = new Map();
    this.loadCache();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private async loadCache() {
    try {
      const cachedData = await AsyncStorage.getItem('app_cache');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        this.cache = new Map(Object.entries(parsed));
        this.cleanExpired();
      }
    } catch (error) {
      console.error('Cache yüklenirken hata:', error);
    }
  }

  private async saveCache() {
    try {
      const cacheObject = Object.fromEntries(this.cache);
      await AsyncStorage.setItem('app_cache', JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Cache kaydedilirken hata:', error);
    }
  }

  private cleanExpired() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.timestamp + item.expiry) {
        this.cache.delete(key);
      }
    }
    this.saveCache();
  }

  async set<T>(key: string, data: T, expiry: number = this.DEFAULT_EXPIRY): Promise<void> {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry,
    });
    await this.saveCache();
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now > item.timestamp + item.expiry) {
      this.cache.delete(key);
      await this.saveCache();
      return null;
    }

    return item.data as T;
  }

  async remove(key: string): Promise<void> {
    this.cache.delete(key);
    await this.saveCache();
  }

  async clear(): Promise<void> {
    this.cache.clear();
    await this.saveCache();
  }
}

export const cacheManager = CacheManager.getInstance(); 