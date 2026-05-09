import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RateLimitService {
  private redis: Redis;
  private readonly logger = new Logger(RateLimitService.name);

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: 6379,
      password: process.env.REDIS_PASSWORD,
      tls: {},
      maxRetriesPerRequest: null,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        this.logger.warn(`Redis connection attempt ${times}, retrying in ${delay}ms`);
        return delay;
      },
      enableReadyCheck: false,
    });

    this.redis.on('error', (err) => {
      this.logger.error('Redis error:', err);
    });

    this.redis.on('connect', () => {
      this.logger.log('Redis connected');
    });

    this.redis.on('close', () => {
      this.logger.warn('Redis connection closed');
    });
  }

  async checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
    const key = `rate_limit:${ip}`;
    const window = 30; // 30 seconds
    const maxRequests = 5;

    try {
      const current = await this.redis.incr(key);
      this.logger.debug(`Request count for IP ${ip}: ${current}`);

      if (current === 1) {
        await this.redis.expire(key, window);
        this.logger.debug(`Set expiry for new key ${key}`);
      }

      const ttl = await this.redis.ttl(key);
      const remaining = Math.max(0, maxRequests - current);

      this.logger.debug(`Rate limit check - IP: ${ip}, current: ${current}, remaining: ${remaining}, TTL: ${ttl}s`);

      return {
        allowed: current <= maxRequests,
        remaining,
      };
    } catch (error) {
      this.logger.error(`Rate limit check failed for IP ${ip}:`, error);
      // On error, allow the request to prevent blocking legitimate traffic
      return {
        allowed: true,
        remaining: maxRequests,
      };
    }
  }
}
