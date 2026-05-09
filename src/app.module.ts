import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

import { EmailModule } from './email/email.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: 6379,
        password: process.env.REDIS_PASSWORD,

        tls: {},

        maxRetriesPerRequest: null,
      },
    }),

    CommonModule,
    EmailModule,
  ],
})
export class AppModule {}
