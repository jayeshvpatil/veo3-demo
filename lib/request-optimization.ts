interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  hits: number;
}

interface BatchRequest {
  id: string;
  request: any;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
}

export class RequestCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = 1000, defaultTTL = 5 * 60 * 1000) { // 5 minutes default
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  set(key: string, data: T, ttl = this.defaultTTL): void {
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
      hits: 0,
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update hit count and return data
    entry.hits++;
    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  getStats() {
    const entries = Array.from(this.cache.values());
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalHits: entries.reduce((sum, entry) => sum + entry.hits, 0),
      avgAge: entries.length > 0 
        ? entries.reduce((sum, entry) => sum + (Date.now() - entry.timestamp), 0) / entries.length 
        : 0,
    };
  }
}

export class RequestBatcher {
  private batches = new Map<string, BatchRequest[]>();
  private timers = new Map<string, NodeJS.Timeout>();
  private batchSize: number;
  private batchTimeout: number;

  constructor(batchSize = 5, batchTimeout = 1000) {
    this.batchSize = batchSize;
    this.batchTimeout = batchTimeout;
  }

  async addRequest<T>(
    batchKey: string,
    request: any,
    processor: (requests: any[]) => Promise<T[]>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const batchRequest: BatchRequest = {
        id: Math.random().toString(36).substring(7),
        request,
        resolve,
        reject,
        timestamp: Date.now(),
      };

      // Get or create batch
      if (!this.batches.has(batchKey)) {
        this.batches.set(batchKey, []);
      }

      const batch = this.batches.get(batchKey)!;
      batch.push(batchRequest);

      // Process immediately if batch is full
      if (batch.length >= this.batchSize) {
        this.processBatch(batchKey, processor);
        return;
      }

      // Set timer for batch timeout if not already set
      if (!this.timers.has(batchKey)) {
        const timer = setTimeout(() => {
          this.processBatch(batchKey, processor);
        }, this.batchTimeout);
        
        this.timers.set(batchKey, timer);
      }
    });
  }

  private async processBatch<T>(
    batchKey: string,
    processor: (requests: any[]) => Promise<T[]>
  ): Promise<void> {
    const batch = this.batches.get(batchKey);
    if (!batch || batch.length === 0) return;

    // Clear timer and batch
    const timer = this.timers.get(batchKey);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(batchKey);
    }
    this.batches.delete(batchKey);

    try {
      const requests = batch.map(b => b.request);
      const results = await processor(requests);

      // Resolve each request with its corresponding result
      batch.forEach((batchRequest, index) => {
        const result = results[index];
        if (result !== undefined) {
          batchRequest.resolve(result);
        } else {
          batchRequest.reject(new Error('No result for batch request'));
        }
      });

    } catch (error) {
      // Reject all requests in the batch
      batch.forEach(batchRequest => {
        batchRequest.reject(error);
      });
    }
  }

  getBatchStats() {
    return {
      activeBatches: this.batches.size,
      totalPendingRequests: Array.from(this.batches.values())
        .reduce((sum, batch) => sum + batch.length, 0),
      batchSizes: Array.from(this.batches.values()).map(batch => batch.length),
    };
  }
}

// Global instances for the application
export const videoAnalysisCache = new RequestCache(500, 10 * 60 * 1000); // 10 minutes for video analysis
export const promptOptimizationCache = new RequestCache(1000, 30 * 60 * 1000); // 30 minutes for prompt optimization
export const providerStatusCache = new RequestCache(100, 2 * 60 * 1000); // 2 minutes for provider status

export const videoBatcher = new RequestBatcher(3, 2000); // Batch up to 3 requests, 2 second timeout
export const analysisBatcher = new RequestBatcher(5, 1000); // Batch up to 5 analysis requests, 1 second timeout

// Utility functions for generating cache keys
export function generateCacheKey(data: any): string {
  if (typeof data === 'string') return data;
  return JSON.stringify(data, Object.keys(data).sort());
}

export function generatePromptCacheKey(prompt: string, preferences: any = {}): string {
  return `prompt:${prompt.substring(0, 100)}:${generateCacheKey(preferences)}`;
}

export function generateAnalysisCacheKey(videoData: any): string {
  return `analysis:${generateCacheKey(videoData)}`;
}

// Cache decorator for functions
export function withCache<T extends (...args: any[]) => Promise<any>>(
  cache: RequestCache,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl?: number
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: Parameters<T>) {
      const cacheKey = keyGenerator(...args);
      
      // Try to get from cache
      const cached = cache.get(cacheKey);
      if (cached !== null) {
        console.log(`🎯 Cache hit for ${propertyName}:`, cacheKey.substring(0, 50));
        return cached;
      }

      // Execute original method
      console.log(`🔄 Cache miss for ${propertyName}:`, cacheKey.substring(0, 50));
      const result = await method.apply(this, args);
      
      // Store in cache
      cache.set(cacheKey, result, ttl);
      
      return result;
    };

    return descriptor;
  };
}

// Batch decorator for functions
export function withBatching<T extends (...args: any[]) => Promise<any>>(
  batcher: RequestBatcher,
  batchKeyGenerator: (...args: Parameters<T>) => string,
  processor: (requests: any[]) => Promise<any[]>
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: Parameters<T>) {
      const batchKey = batchKeyGenerator(...args);
      
      return batcher.addRequest(batchKey, args, processor);
    };

    return descriptor;
  };
}