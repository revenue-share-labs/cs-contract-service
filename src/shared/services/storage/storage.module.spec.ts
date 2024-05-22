import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from './storage.module';

describe('StorageModule', () => {
  it('should compile the module', async () => {
    const storageModule: StorageModule = await Test.createTestingModule({
      imports: [StorageModule, PrismaModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    expect(storageModule).toBeDefined();
  });
});
