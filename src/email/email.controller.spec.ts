import { Test, TestingModule } from '@nestjs/testing';
import { EmailController } from './email.controller';
import { getQueueToken } from '@nestjs/bullmq';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';

describe('EmailController', () => {
  let controller: EmailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailController],
      providers: [
        {
          provide: getQueueToken('email-queue'),
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(RateLimitGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = module.get<EmailController>(EmailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
