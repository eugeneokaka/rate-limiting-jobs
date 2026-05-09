import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Trust proxy for accurate IP detection behind load balancers/proxies
  (app as any).getHttpAdapter().getInstance().set('trust proxy', true);
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
