/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthStorageService } from './auth-storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';

describe('AuthStorageService', () => {
  let authStorageService: AuthStorageService;
  const httpService = mockDeep<HttpService>();

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async () => ({
            secret: 'TESTSECRET',
            signOptions: { expiresIn: '1d' },
          }),
          inject: [ConfigService],
        }),
      ],
      controllers: [AuthStorageService],
      providers: [
        AuthStorageService,
        PrismaService,
        ConfigService,
        {
          provide: HttpService,
          useValue: httpService,
        },
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    authStorageService = moduleRef.get(AuthStorageService);
  });

  it('should be defined', () => {
    expect(authStorageService).toBeDefined();
  });

  describe('getServiceJwt', () => {
    it('should set service token', async () => {
      jest
        .spyOn(httpService.axiosRef, 'get')
        .mockImplementationOnce(() =>
          Promise.resolve({ data: { token: '123' } }),
        );
      await authStorageService.getServiceJwt();
      expect(authStorageService.serviceJwt).toEqual('123');
    });
  });
});
