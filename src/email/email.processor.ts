import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('email-queue')
export class EmailProcessor extends WorkerHost {
  async process(job: Job<any>): Promise<any> {
    console.log('Processing job:', job.name);

    console.log('Sending email to:', job.data.email);

    await new Promise((resolve) => setTimeout(resolve, 10000));

    console.log('Email sent');
  }
}
