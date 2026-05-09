import { Module, Global } from '@nestjs/common';
import { RateLimitService } from './services/rate-limit.service';
import { RateLimitGuard } from './guards/rate-limit.guard';

@Global()
@Module({
  providers: [RateLimitService, RateLimitGuard],
  exports: [RateLimitService, RateLimitGuard],
})
export class CommonModule {}
