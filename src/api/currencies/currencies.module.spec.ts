import { Test } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { PrismaModule } from '../../shared/services/prisma/prisma.module';
import { PrismaService } from '../../shared/services/prisma/prisma.service';
import { CurrenciesModule } from './currencies.module';

describe('CurrenciesModule', () => {
  it('should compile the module', async () => {
    const currenciesModule: CurrenciesModule = await Test.createTestingModule({
      imports: [CurrenciesModule, PrismaModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    expect(currenciesModule).toBeDefined();
  });
});
