/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from './tasks.service';
import { AuthStorageService } from '../storage/auth-storage.service';
import { HttpService } from '@nestjs/axios';

describe('TasksService', () => {
  let tasksService: TasksService;
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
      controllers: [TasksService],
      providers: [
        TasksService,
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

    tasksService = moduleRef.get(TasksService);
    authStorageService = moduleRef.get(AuthStorageService);
  });

  it('should be defined', () => {
    expect(tasksService).toBeDefined();
  });

  describe('handleCron', () => {
    it('should handle get service token', async () => {
      jest
        .spyOn(httpService.axiosRef, 'get')
        .mockImplementationOnce(() =>
          Promise.resolve({ data: { token: '123' } }),
        );
      await tasksService.handleCron();
      expect(authStorageService.serviceJwt).toEqual('123');
    });
  });
});
