import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { RateLimitService } from '../services/rate-limit.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  constructor(private readonly rateLimitService: RateLimitService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Get IP address from request
    const ip = this.getClientIp(request);
    
    this.logger.log(`Rate limit check for IP: ${ip}`);
    
    // Check rate limit
    const result = await this.rateLimitService.checkRateLimit(ip);
    
    if (!result.allowed) {
      this.logger.warn(`Rate limit exceeded for IP: ${ip}`);
      throw new HttpException(
        {
          status: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    this.logger.log(`Rate limit check passed for IP: ${ip}, remaining: ${result.remaining}`);

    // Add rate limit headers
    request.res.setHeader('X-RateLimit-Limit', '5');
    request.res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
    request.res.setHeader('X-RateLimit-Reset', '30');

    return true;
  }

  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip ||
      '0.0.0.0'
    );
  }
}
