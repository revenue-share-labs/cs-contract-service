import { Test } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../shared/services/prisma/prisma.service';
import { ContractsModule } from './contracts.module';
import { ConfigService } from '@nestjs/config';

describe('ContractsModule', () => {
  it('should compile the module', async () => {
    const contractsModule: ContractsModule = await Test.createTestingModule({
      providers: [
        { provide: PrismaService, useValue: mockDeep<PrismaClient>() },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    expect(contractsModule).toBeDefined();
  });
});
