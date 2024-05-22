import { Test } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { PrismaModule } from '../../services/prisma/prisma.module';
import { PrismaService } from '../../services/prisma/prisma.service';
import { AuthModule } from './auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserServiceModule } from '../../services/user-service/user-service.module';

describe('AuthModule', () => {
  process.env.INTERNAL_JWT_SECRET = 'test';
  it('should compile the module', async () => {
    const authModule: AuthModule = await Test.createTestingModule({
      imports: [AuthModule, PrismaModule, ConfigModule, UserServiceModule],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              // this is being super extra, in the case that you need multiple keys with the `get` method
              if (key === 'INTERNAL_JWT_SECRET') {
                return 'TEST';
              }
              return null;
            }),
          },
        },
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    expect(authModule).toBeDefined();
  });
});
