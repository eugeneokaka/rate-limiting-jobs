import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';

@Processor('email-queue')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  async process(job: Job<any>): Promise<any> {
    this.logger.log(`Processing job: ${job.name} with ID: ${job.id}`);

    this.logger.log(`Sending email to: ${job.data.email}`);

    await new Promise((resolve) => setTimeout(resolve, 10000));

    this.logger.log(`Email sent successfully to: ${job.data.email}`);
  }
}
