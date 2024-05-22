import { Test } from '@nestjs/testing';
import { UserServiceModule } from './user-service.module';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { PrismaModule } from '../prisma/prisma.module';

describe('UserServiceModule', () => {
  it('should compile the module', async () => {
    const userServiceModule: UserServiceModule = await Test.createTestingModule(
      {
        imports: [
          JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async () => ({
              secret: 'TESTSECRET',
              signOptions: { expiresIn: '1d' },
            }),
            inject: [ConfigService],
          }),
          UserServiceModule,
          PrismaModule,
        ],
        providers: [PrismaService],
      },
    )
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    expect(userServiceModule).toBeDefined();
  });
});
