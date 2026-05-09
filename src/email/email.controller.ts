import { Controller, Post, Body } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('email')
export class EmailController {
  constructor(
    @InjectQueue('email-queue')
    private emailQueue: Queue,
  ) {}

  @Post('send')
  async send(@Body() body: { email: string }) {
    await this.emailQueue.add('send-email', {
      email: body.email,
    });

    return {
      message: 'Job added to queue',
    };
  }
}
