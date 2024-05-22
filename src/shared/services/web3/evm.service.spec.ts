/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { PrismaService } from '../prisma/prisma.service';
import { EvmService } from './evm.service';

describe('EthereumService', () => {
  let evmService: EvmService;

  const contractAbiMock =
    '[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"InvalidFeePercentage","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"oldFee","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newFee","type":"uint256"}],"name":"PlatformFeeChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address payable","name":"oldPlatformWallet","type":"address"},{"indexed":false,"internalType":"address payable","name":"newPlatformWallet","type":"address"}],"name":"PlatformWalletChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"contractAddress","type":"address"},{"indexed":false,"internalType":"address","name":"controller","type":"address"},{"indexed":false,"internalType":"address[]","name":"distributors","type":"address[]"},{"indexed":false,"internalType":"bytes32","name":"version","type":"bytes32"},{"indexed":false,"internalType":"bool","name":"isImmutableController","type":"bool"},{"indexed":false,"internalType":"bool","name":"isAutoNativeCurrencyDistribution","type":"bool"},{"indexed":false,"internalType":"uint256","name":"minAutoDistributeAmount","type":"uint256"},{"indexed":false,"internalType":"bytes32","name":"creationId","type":"bytes32"}],"name":"RSCValveCreated","type":"event"},{"inputs":[],"name":"contractImplementation","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"controller","type":"address"},{"internalType":"address[]","name":"distributors","type":"address[]"},{"internalType":"bool","name":"isImmutableController","type":"bool"},{"internalType":"bool","name":"isAutoNativeCurrencyDistribution","type":"bool"},{"internalType":"uint256","name":"minAutoDistributeAmount","type":"uint256"},{"internalType":"address payable[]","name":"initialRecipients","type":"address[]"},{"internalType":"uint256[]","name":"percentages","type":"uint256[]"},{"internalType":"bytes32","name":"creationId","type":"bytes32"}],"internalType":"struct XLARSCValveFactory.RSCCreateData","name":"_data","type":"tuple"}],"name":"createRSCValve","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"platformFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"platformWallet","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"controller","type":"address"},{"internalType":"address[]","name":"distributors","type":"address[]"},{"internalType":"bool","name":"isImmutableController","type":"bool"},{"internalType":"bool","name":"isAutoNativeCurrencyDistribution","type":"bool"},{"internalType":"uint256","name":"minAutoDistributeAmount","type":"uint256"},{"internalType":"address payable[]","name":"initialRecipients","type":"address[]"},{"internalType":"uint256[]","name":"percentages","type":"uint256[]"},{"internalType":"bytes32","name":"creationId","type":"bytes32"}],"internalType":"struct XLARSCValveFactory.RSCCreateData","name":"_data","type":"tuple"},{"internalType":"address","name":"_deployer","type":"address"}],"name":"predictDeterministicAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_fee","type":"uint256"}],"name":"setPlatformFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address payable","name":"_platformWallet","type":"address"}],"name":"setPlatformWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"version","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"}]';
  const logsMock = [
    {
      topics: [
        '0xa01b09fc44a34edac0ad1d4e96e7791b427cfdb772ade1da0dcead2eb18ff8c6',
      ],
      data: '0x00000000000000000000000007e2cf20b3aa330e5c4355a9d697c30417c286fe00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100312e3000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000091b77e5e5d9a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000c94da8449453eff24b02e090765f5d47d69a3197',
    },
  ];

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [EvmService],
      providers: [EvmService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    evmService = moduleRef.get(EvmService);
  });

  it('should be defined', () => {
    expect(evmService).toBeDefined();
  });

  describe('getRscContractAddress', () => {
    it('should return the correct RSC contract address', () => {
      const expectedResult = '0x07E2cF20b3aA330E5C4355a9d697c30417C286fE';
      expect(
        evmService.getRscContractAddress(contractAbiMock, logsMock),
      ).toEqual(expectedResult);
    });
  });

  describe('getRscContractCreationId', () => {
    it('should return the correct RSC contract creation ID', () => {
      const expectedResult =
        '0x0000000000000000000000000000000000000000000000000000000000000000';
      expect(
        evmService.getRscContractCreationId(contractAbiMock, logsMock),
      ).toEqual(expectedResult);
    });
  });
});
