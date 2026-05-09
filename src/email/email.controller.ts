import { Controller, Post, Get, Body, UseGuards, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';

@Controller('email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(
    @InjectQueue('email-queue')
    private emailQueue: Queue,
  ) {}

  @Post('send')
  @UseGuards(RateLimitGuard)
  async send(@Body() body: { email: string }) {
    this.logger.log(`Email send request received for: ${body.email}`);

    await this.emailQueue.add('send-email', {
      email: body.email,
    });

    this.logger.log(`Job added to queue for email: ${body.email}`);

    return {
      message: 'Job added to queue',
    };
  }

  @Get('test')
  @UseGuards(RateLimitGuard)
  async test() {
    this.logger.log('Rate limit test endpoint called');
    return {
      message: 'Rate limit test endpoint',
    };
  }
}
