// Rate Limiting Helper for Client-Side
export class RateLimiter {
  private static instance: RateLimiter;
  private requestTimes: number[] = [];
  private readonly maxRequests: number;
  private readonly timeWindow: number; // in milliseconds

  constructor(maxRequests = 5, timeWindowMinutes = 1) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMinutes * 60 * 1000;
  }

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    
    // Remove old requests outside the time window
    this.requestTimes = this.requestTimes.filter(
      time => now - time < this.timeWindow
    );

    return this.requestTimes.length < this.maxRequests;
  }

  recordRequest(): void {
    this.requestTimes.push(Date.now());
  }

  getTimeUntilNextRequest(): number {
    if (this.canMakeRequest()) return 0;
    
    const oldestRequest = Math.min(...this.requestTimes);
    return (oldestRequest + this.timeWindow) - Date.now();
  }

  getRequestsRemaining(): number {
    const now = Date.now();
    this.requestTimes = this.requestTimes.filter(
      time => now - time < this.timeWindow
    );
    return Math.max(0, this.maxRequests - this.requestTimes.length);
  }
}

// Usage Hook
export function useRateLimit() {
  const rateLimiter = RateLimiter.getInstance();
  
  return {
    canMakeRequest: () => rateLimiter.canMakeRequest(),
    recordRequest: () => rateLimiter.recordRequest(),
    timeUntilNext: () => rateLimiter.getTimeUntilNextRequest(),
    requestsRemaining: () => rateLimiter.getRequestsRemaining(),
  };
}