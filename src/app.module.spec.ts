import { Test } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { AppModule } from './app.module';
import { PrismaModule } from './shared/services/prisma/prisma.module';
import { PrismaService } from './shared/services/prisma/prisma.service';

describe('AppModule', () => {
  process.env.CORS_METHODS = 'GET,POST';
  process.env.CORS_ORIGINS = 'http://localhost:3000';
  process.env.CORS_CREDENTIALS = 'true';
  process.env.NODE_ENV = 'test';
  process.env.INTERNAL_JWT_SECRET = 'test';
  process.env.KAFKA_BROKERS = 'localhost:9092';
  process.env.KAFKA_SSL_ENABLED = 'true';
  process.env.RELAY_KEY_MUMBAI = 'test';
  process.env.RELAY_SECRET_MUMBAI = 'test';
  it('should compile the module', async () => {
    const appModule: AppModule = await Test.createTestingModule({
      imports: [AppModule, PrismaModule],
      providers: [],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    expect(appModule).toBeDefined();
  });
});
