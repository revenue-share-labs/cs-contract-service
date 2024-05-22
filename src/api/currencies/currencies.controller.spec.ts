import { CurrenciesService } from './currencies.service';
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { PrismaService } from '../../shared/services/prisma/prisma.service';
import { Test } from '@nestjs/testing';
import { CurrenciesController } from './currencies.controller';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('CurrenciesController', () => {
  let currenciesController: CurrenciesController;
  let prismaService: DeepMockProxy<PrismaClient>;

  const mockDate = new Date();
  const mockCurrency = {
    id: 'id',
    title: 'title',
    locations: [],
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CurrenciesController],
      providers: [CurrenciesService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    currenciesController = moduleRef.get(CurrenciesController);
    prismaService = moduleRef.get(PrismaService);
  });

  it('should be defined', () => {
    expect(currenciesController).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a currency when valid id is passed', async () => {
      //@ts-ignore
      prismaService.currency.findFirstOrThrow.mockResolvedValue(mockCurrency);
      expect(await currenciesController.findOne('1')).toEqual(mockCurrency);
    });

    it('should return an NotFoundException when invalid id is passed', async () => {
      const mockError = new Error();

      //@ts-ignore
      prismaService.currency.findFirstOrThrow.mockRejectedValue(mockError);

      try {
        await currenciesController.findOne('1');
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
