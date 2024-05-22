/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  ValveV1ContractCreatedDto,
  ValveV1DistributionType,
} from '../../../api/contracts/dto';
import {
  Chain,
  ContractDeployment,
  ContractDeploymentStatus,
  ContractDeploymentStrategy,
  ContractStatus,
  ContractType,
  ContractVisibility,
} from '@prisma/client';
import { MumbaiDefenderService } from './mumbai-defender.service';

describe('MumbaiDefenderService', () => {
  let mumbaiDefenderService: MumbaiDefenderService;

  const mockValveV1ContractPreparedDto: ValveV1ContractCreatedDto = {
    id: '1251144123512314141231',
    author: 'author',
    createdAt: new Date(),
    updatedAt: new Date(),
    title: 'Example Contract',
    version: '1.0',
    type: ContractType.VALVE,
    chain: Chain.ETHEREUM,
    visibility: ContractVisibility.PRIVATE,
    status: ContractStatus.DRAFT,
    recipients: [
      {
        name: 'Bob',
        address: '0x1234567890abcdef',
        revenue: 50,
      },
      {
        name: 'Bob',
        address: '0x0987654321fedcba',
        revenue: 50,
      },
    ],
    distribution: ValveV1DistributionType.AUTO,
    autoNativeCurrencyDistribution: true,
    minAutoDistributionAmount: 100,
  };

  const mockContractDeployment: ContractDeployment = {
    id: '1251144123512314141231',
    strategy: ContractDeploymentStrategy.PLATFORM,
    status: ContractDeploymentStatus.CREATED,
    transaction: null,
    contractId: 'abc123',
    contractDeployedAvroRecordId: 'asd',
    contractDeployFailedAvroRecordId: 'asd',
    defenderTransactionId: '0x0',
    txData: {},
    unsignedTx: {},
    address: '0x0',
    createdAt: new Date(),
    updatedAt: new Date(),
    v: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MumbaiDefenderService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              switch (key) {
                case 'defender':
                  return {
                    relayKeyMumbai: 'API_KEY_MUMBAI',
                    relaySecretMumbai: 'API_SECRET_MUMBAI',
                  };
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    mumbaiDefenderService = module.get<MumbaiDefenderService>(
      MumbaiDefenderService,
    );
  });

  it('should be defined', () => {
    expect(mumbaiDefenderService).toBeDefined();
  });

  describe('prepareValveTxData', () => {
    it('should return contract deployment with txData', () => {
      const contractDeployment = mumbaiDefenderService.prepareValveTxData(
        mockContractDeployment,
        mockValveV1ContractPreparedDto,
      );
      expect(contractDeployment.txData['minAutoDistributeAmount']).toEqual(
        '100000000000000000000',
      );
      expect(contractDeployment.txData['initialRecipients']).toEqual([
        '0x1234567890abcdef',
        '0x0987654321fedcba',
      ]);
      expect(contractDeployment.txData['percentages']).toEqual([
        '5000000',
        '5000000',
      ]);
    });
  });
});
