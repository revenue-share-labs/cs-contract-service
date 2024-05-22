/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Test } from '@nestjs/testing';
import { ContractsService } from './contracts.service';
import { PrismaService } from '../../shared/services/prisma/prisma.service';
import {
  UserCreationStrategy,
  UserDto,
  UserRole,
} from '../../shared/services/user-service/dto';
import {
  Chain,
  Contract,
  ContractDeployment,
  ContractDeploymentStatus,
  ContractDeploymentStrategy,
  ContractParticipant,
  ContractParticipantIdentifierType,
  ContractStatus,
  ContractType,
  ContractVisibility,
  PrismaClient,
} from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import {
  DateEpochEnum,
  ParticipantStatus,
  RecipientsStatus,
  SearchContractsDto,
  SearchContractsQueryDto,
  ValveV1ContractPreparedDto,
  ValveV1ContractPreparedWrappedDto,
  ValveV1DistributionType,
} from './dto';
import { SortOrder } from '../generic/dto';
import { ForbiddenException } from '@nestjs/common';
import { WalletProvider } from '../../shared/services/user-service/dto/user-wallet.dto';
import { ConfigService } from '@nestjs/config';
import { MumbaiDefenderService } from '../../shared/services/defender/mumbai-defender.service';

describe('ContractsService', () => {
  process.env.RELAY_KEY_MUMBAI = 'test';
  process.env.RELAY_SECRET_MUMBAI = 'test';
  let contractsService: ContractsService;
  let prismaService: DeepMockProxy<PrismaClient>;
  let mumbaiDefenderService: DeepMockProxy<MumbaiDefenderService>;

  const mockDate = new Date();
  const mockQuery: SearchContractsQueryDto = {
    offset: 0,
    limit: 20,
    status: [ContractStatus.DRAFT, ContractStatus.PUBLISHED],
  };
  const mockSearchContractsDto: SearchContractsDto = {
    author: '63f8c1012381e7c4dd193b52',
    title: 'Sample Contract',
    titleSortOrder: SortOrder.desc,
    chain: [Chain.POLYGON_MUMBAI],
    dateSortOrder: SortOrder.asc,
    epoch: DateEpochEnum.UPDATED,
    type: [ContractType.VALVE],
    visibility: [ContractVisibility.COMMUNITY, ContractVisibility.PRIVATE],
    recipientsStatus: [RecipientsStatus.EDITABLE, RecipientsStatus.LOCKED],
    participantStatus: [ParticipantStatus.OWNER, ParticipantStatus.RECIPIENT],
  };
  const mockUser: UserDto = {
    roles: [UserRole.CUSTOMER],
    wallets: [{ address: '0x1', provider: WalletProvider.META_MASK }],
    id: 'id',
    activeWallet: { address: '0x1', provider: WalletProvider.META_MASK },
    createdBy: UserCreationStrategy.ADDRESS,
  };
  const mockValveV1ContractPreparedDto: ValveV1ContractPreparedDto = {
    title: 'Example Contract',
    version: '1.0',
    type: ContractType.VALVE,
    chain: Chain.POLYGON_MUMBAI,
    visibility: ContractVisibility.PRIVATE,
    status: ContractStatus.DRAFT,
    recipients: [
      {
        name: 'Bob',
        address: '0x7fdb908AA02D3a1f8b7f9D882EA67B68Ab355dc1',
        revenue: 50,
      },
      {
        name: 'Bob',
        address: '0x7fdb908AA02D3a1f8b7f9D882EA67B68Ab355dc1',
        revenue: 50,
      },
    ],
    distribution: ValveV1DistributionType.AUTO,
    autoNativeCurrencyDistribution: true,
    minAutoDistributionAmount: 100,
  };
  const mockContract: Contract & {
    participants: ContractParticipant[];
  } = {
    id: 'abc123',
    author: 'id',
    description: 'Donald Trump',
    owner: '0x1',
    title: 'My Contract',
    version: '1.0',
    address: '0x7fdb908AA02D3a1f8b7f9D882EA67B68Ab355dc1',
    legalAgreementUrl: 'https://exmaple.com',
    visualizationUrl: 'https://exmaple.com',
    chain: Chain.POLYGON_MUMBAI,
    type: ContractType.VALVE,
    visibility: ContractVisibility.PRIVATE,
    status: ContractStatus.DRAFT,
    metadata: {
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
    },
    createdAt: mockDate,
    updatedAt: mockDate,
    publishedAt: mockDate,
    v: 0,
    participants: [
      {
        id: 'abc435',
        identifier: 'id',
        identifierType: ContractParticipantIdentifierType.ID,
        role: 'AUTHOR',
        contractId: 'abc123',
        createdAt: mockDate,
        updatedAt: mockDate,
      },
      {
        id: 'abc43545',
        identifier: '0x1',
        identifierType: ContractParticipantIdentifierType.ADDRESS,
        role: 'OWNER',
        contractId: 'abc123',
        createdAt: mockDate,
        updatedAt: mockDate,
      },
    ],
  };
  const mockContractDeployment: ContractDeployment = {
    id: 'id',
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
    createdAt: mockDate,
    updatedAt: mockDate,
    v: 0,
  };
  const mockContractDeploymentWithTxData: ContractDeployment = {
    id: 'id',
    strategy: ContractDeploymentStrategy.PLATFORM,
    status: ContractDeploymentStatus.CREATED,
    transaction: null,
    contractId: 'abc123',
    contractDeployedAvroRecordId: 'asd',
    contractDeployFailedAvroRecordId: 'asd',
    defenderTransactionId: '0x0',
    txData: {
      controller: '0x0',
      distributors: ['0x0'],
      isImmutableRecipients: false,
      isAutoNativeCurrencyDistribution: true,
      minAutoDistributeAmount: '0',
      initialRecipients: ['0x0'],
      percentages: ['10000000'],
      creationId: JSON.stringify(new Uint8Array()),
    },
    unsignedTx: {},
    address: '0x0',
    createdAt: mockDate,
    updatedAt: mockDate,
    v: 0,
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ContractsService],
      providers: [
        ContractsService,
        PrismaService,
        MumbaiDefenderService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              switch (key) {
                case 'defender':
                  return {
                    relayKeyPolygon: 'API_KEY_POLYGON',
                    relaySecretPolygon: 'API_SECRET_POLYGON',
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
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .overrideProvider(MumbaiDefenderService)
      .useValue(mockDeep<MumbaiDefenderService>())
      .compile();

    contractsService = moduleRef.get(ContractsService);
    prismaService = moduleRef.get(PrismaService);
    mumbaiDefenderService = moduleRef.get(MumbaiDefenderService);
  });

  it('should be defined', () => {
    expect(contractsService).toBeDefined();
  });

  describe('search', () => {
    it('should build valid aggregation query', async () => {
      const expectedAggregateRawFirstCall = {
        pipeline: [
          {
            $match: {
              author: '63f8c1012381e7c4dd193b52',
              'metadata.isRecipientsLocked': { $in: [false, null, true] },
              status: { $in: ['DRAFT', 'PUBLISHED'] },
              title: { $options: 'i', $regex: 'Sample Contract' },
              type: { $in: ['VALVE'] },
            },
          },
          {
            $lookup: {
              as: 'participant',
              foreignField: 'contractId',
              from: 'ContractParticipant',
              localField: '_id',
            },
          },
          { $unwind: '$participant' },
          {
            $match: {
              $or: [
                {
                  'participant.identifier': { $in: ['id', '0x1'] },
                  'participant.role': { $in: ['OWNER', 'RECIPIENT'] },
                  visibility: 'COMMUNITY',
                },
                {
                  'participant.identifier': { $in: ['id', '0x1'] },
                  'participant.role': { $in: ['OWNER', 'RECIPIENT'] },
                  visibility: 'PRIVATE',
                },
              ],
            },
          },
          {
            $group: {
              _id: '$_id',
              doc: { $first: '$$ROOT' },
              participants: { $push: '$participant' },
            },
          },
          {
            $addFields: {
              'doc.participants': '$participants',
            },
          },
          { $replaceRoot: { newRoot: '$doc' } },
          { $group: { _id: null, count: { $sum: 1 } } },
        ],
      };
      const expectedAggregateRawSecondCall = {
        pipeline: [
          {
            $match: {
              author: '63f8c1012381e7c4dd193b52',
              'metadata.isRecipientsLocked': { $in: [false, null, true] },
              status: { $in: ['DRAFT', 'PUBLISHED'] },
              title: { $options: 'i', $regex: 'Sample Contract' },
              type: { $in: ['VALVE'] },
            },
          },
          {
            $lookup: {
              as: 'participant',
              foreignField: 'contractId',
              from: 'ContractParticipant',
              localField: '_id',
            },
          },
          { $unwind: '$participant' },
          {
            $match: {
              $or: [
                {
                  'participant.identifier': { $in: ['id', '0x1'] },
                  'participant.role': { $in: ['OWNER', 'RECIPIENT'] },
                  visibility: 'COMMUNITY',
                },
                {
                  'participant.identifier': { $in: ['id', '0x1'] },
                  'participant.role': { $in: ['OWNER', 'RECIPIENT'] },
                  visibility: 'PRIVATE',
                },
              ],
            },
          },
          {
            $group: {
              _id: '$_id',
              doc: { $first: '$$ROOT' },
              participants: { $push: '$participant' },
            },
          },
          {
            $addFields: {
              'doc.participants': '$participants',
            },
          },
          { $replaceRoot: { newRoot: '$doc' } },
          { $sort: { updatedAt: 1 } },
          { $skip: 0 },
          { $limit: 20 },
        ],
      };
      //@ts-ignore
      const spyAggregateRaw = jest.spyOn(
        prismaService.contract,
        'aggregateRaw',
      );

      await contractsService.search(
        mockQuery,
        mockSearchContractsDto,
        mockUser,
      );

      expect(spyAggregateRaw).toBeCalledTimes(2);
      expect(spyAggregateRaw.mock.calls[0][0]).toEqual(
        expectedAggregateRawFirstCall,
      );
      expect(spyAggregateRaw.mock.calls[1][0]).toEqual(
        expectedAggregateRawSecondCall,
      );
    });
  });

  describe('findOne', () => {
    it('should build valid findUniqueOrThrow query', async () => {
      const expectedFindUniqueOrThrowCall = {
        include: { participants: true },
        where: { id: 'id' },
      };

      //@ts-ignore
      const spyFindUniqueOrThrow = jest.spyOn(
        prismaService.contract,
        'findUniqueOrThrow',
      );
      //@ts-ignore
      prismaService.contract.findUniqueOrThrow.mockResolvedValue(mockContract);

      await contractsService.findOne('id', mockUser);

      expect(spyFindUniqueOrThrow).toBeCalledTimes(1);
      expect(spyFindUniqueOrThrow.mock.calls[0][0]).toEqual(
        expectedFindUniqueOrThrowCall,
      );
    });
  });

  describe('update', () => {
    it('should build valid data and pass it to update', async () => {
      const expectedUpdateCall = {
        data: {
          author: 'id',
          chain: 'POLYGON_MUMBAI',
          metadata: {
            autoNativeCurrencyDistribution: true,
            distribution: 'AUTO',
            minAutoDistributionAmount: 100,
            recipients: [
              {
                address: '0x7fdb908AA02D3a1f8b7f9D882EA67B68Ab355dc1',
                name: 'Bob',
                revenue: 50,
              },
              {
                address: '0x7fdb908AA02D3a1f8b7f9D882EA67B68Ab355dc1',
                name: 'Bob',
                revenue: 50,
              },
            ],
          },
          owner: '0x1',
          address: null,
          status: 'DRAFT',
          title: 'Example Contract',
          type: 'VALVE',
          v: { increment: 1 },
          version: '1.0',
          visibility: 'PRIVATE',
          publishedAt: null,
        },
        where: { id: '1', v: 0 },
      };

      //@ts-ignore
      prismaService.contract.findUniqueOrThrow.mockResolvedValue(mockContract);
      //@ts-ignore
      prismaService.contract.update.mockResolvedValue(mockContract);
      prismaService.$transaction.mockImplementation((callback) =>
        //@ts-ignore
        callback(prismaService),
      );

      //@ts-ignore
      const spyUpdate = jest.spyOn(prismaService.contract, 'update');

      await contractsService.update(
        '1',
        new ValveV1ContractPreparedWrappedDto(mockValveV1ContractPreparedDto),
        mockUser,
      );

      expect(spyUpdate).toBeCalledTimes(1);
      expect(spyUpdate.mock.calls[0][0]).toEqual(expectedUpdateCall);
    });

    it('should not change author, owner when update', async () => {
      const mockUser: UserDto = {
        roles: [UserRole.CUSTOMER],
        wallets: [{ address: '0x1', provider: WalletProvider.META_MASK }],
        id: 'id2345',
        activeWallet: { address: '0x1', provider: WalletProvider.META_MASK },
        createdBy: UserCreationStrategy.ADDRESS,
      };

      const expectedUpdateCall = {
        data: {
          author: 'id',
          chain: 'POLYGON_MUMBAI',
          metadata: {
            autoNativeCurrencyDistribution: true,
            distribution: 'AUTO',
            minAutoDistributionAmount: 100,
            recipients: [
              {
                address: '0x7fdb908AA02D3a1f8b7f9D882EA67B68Ab355dc1',
                name: 'Bob',
                revenue: 50,
              },
              {
                address: '0x7fdb908AA02D3a1f8b7f9D882EA67B68Ab355dc1',
                name: 'Bob',
                revenue: 50,
              },
            ],
          },
          owner: '0x1',
          status: 'DRAFT',
          address: null,
          title: 'Example Contract',
          type: 'VALVE',
          v: { increment: 1 },
          version: '1.0',
          visibility: 'PRIVATE',
          publishedAt: null,
        },
        where: { id: '1', v: 0 },
      };

      //@ts-ignore
      prismaService.contract.findUniqueOrThrow.mockResolvedValue(mockContract);
      //@ts-ignore
      prismaService.contract.update.mockResolvedValue(mockContract);
      prismaService.$transaction.mockImplementation((callback) =>
        //@ts-ignore
        callback(prismaService),
      );

      //@ts-ignore
      const spyUpdate = jest.spyOn(prismaService.contract, 'update');

      await contractsService.update(
        '1',
        new ValveV1ContractPreparedWrappedDto(mockValveV1ContractPreparedDto),
        mockUser,
      );

      expect(spyUpdate).toBeCalledTimes(1);
      expect(spyUpdate.mock.calls[0][0]).toEqual(expectedUpdateCall);
    });

    it('should throw ForbiddenException when not enough permissions', async () => {
      const mockUser: UserDto = {
        roles: [UserRole.CUSTOMER],
        wallets: [{ address: '0x2', provider: WalletProvider.META_MASK }],
        id: 'id2',
        activeWallet: { address: '0x2', provider: WalletProvider.META_MASK },
        createdBy: UserCreationStrategy.ADDRESS,
      };

      //@ts-ignore
      prismaService.contract.findUniqueOrThrow.mockResolvedValue(mockContract);
      //@ts-ignore
      prismaService.contract.update.mockResolvedValue(mockContract);
      prismaService.$transaction.mockImplementation((callback) =>
        //@ts-ignore
        callback(prismaService),
      );

      const spyUpdate = jest.spyOn(prismaService.contract, 'update');

      try {
        await contractsService.update(
          '1',
          new ValveV1ContractPreparedWrappedDto(mockValveV1ContractPreparedDto),
          mockUser,
        );
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }

      expect(spyUpdate).toBeCalledTimes(0);
    });
  });

  describe('createContractDeploymentWithPlatformStrategy', () => {
    it('should deploy valid data and pass it to createContractDeploymentWithPlatformStrategy', async () => {
      const expectedContractUpdateCall = {
        data: {
          status: ContractStatus.PENDING,
          v: { increment: 1 },
        },
        where: { id: '1', v: 0 },
      };
      const expectedContractDeploymentCreateCall = {
        data: {
          contract: { connect: { id: '1' } },
          txData: {},
          unsignedTx: {},
          status: ContractDeploymentStatus.CREATED,
          strategy: ContractDeploymentStrategy.PLATFORM,
        },
      };

      //@ts-ignore
      prismaService.contract.findUniqueOrThrow.mockResolvedValue(mockContract);
      //@ts-ignore
      prismaService.contract.update.mockResolvedValue(mockContract);
      //@ts-ignore
      prismaService.contractDeployment.create.mockResolvedValue(
        mockContractDeployment,
      );
      prismaService.$transaction.mockImplementation((callback) =>
        //@ts-ignore
        callback(prismaService),
      );
      prismaService.contractDeployment.update.mockResolvedValue(
        mockContractDeploymentWithTxData,
      );

      mumbaiDefenderService.prepareValveTxData.mockReturnValue(
        mockContractDeploymentWithTxData,
      );
      mumbaiDefenderService.calculateContractAddress.mockResolvedValue('0x0');

      mumbaiDefenderService.createUnsignedTx.mockResolvedValue({
        to: '0x0',
        value: 0,
        data: '0x0',
        speed: 'fast',
        gasLimit: '100000',
      });

      //@ts-ignore
      const spyContractUpdate = jest.spyOn(prismaService.contract, 'update');
      //@ts-ignore
      const spyContractDeploymentCreate = jest.spyOn(
        prismaService.contractDeployment,
        'create',
      );
      const spyContractDeploymentUpdate = jest.spyOn(
        prismaService.contractDeployment,
        'update',
      );
      await contractsService.createContractDeploymentWithPlatformStrategy(
        '1',
        mockUser,
      );

      expect(spyContractUpdate).toBeCalledTimes(1);
      expect(spyContractUpdate.mock.calls[0][0]).toStrictEqual(
        expectedContractUpdateCall,
      );
      expect(spyContractDeploymentCreate).toBeCalledTimes(1);
      expect(spyContractDeploymentCreate.mock.calls[0][0]).toStrictEqual(
        expectedContractDeploymentCreateCall,
      );
      expect(spyContractDeploymentUpdate).toBeCalledTimes(2);
      expect(spyContractDeploymentCreate.mock.calls[0][0]).toStrictEqual(
        expectedContractDeploymentCreateCall,
      );
    });
  });

  describe('getActiveContractDeployment', () => {
    it('should build valid findFirst query', async () => {
      const expectedFindFirstCall = {
        where: {
          contractId: 'id',
          status: {
            in: [
              ContractDeploymentStatus.CREATED,
              ContractDeploymentStatus.DEPLOYING,
            ],
          },
        },
      };

      //@ts-ignore
      const spyFindFirst = jest.spyOn(
        prismaService.contractDeployment,
        'findFirst',
      );
      //@ts-ignore
      prismaService.contract.findUniqueOrThrow.mockResolvedValue(mockContract);
      //@ts-ignore
      prismaService.contractDeployment.findFirst.mockResolvedValue(
        mockContractDeployment,
      );

      await contractsService.getActiveContractDeployment('id', mockUser);

      expect(spyFindFirst).toBeCalledTimes(1);
      expect(spyFindFirst.mock.calls[0][0]).toEqual(expectedFindFirstCall);
    });
  });
});
