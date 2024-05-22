import { ClientKafka } from '@nestjs/microservices';
/* eslint-disable @typescript-eslint/ban-ts-comment */
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
import { ContractsConsumer } from './contracts.consumer';
import { PrismaService } from '../../prisma/prisma.service';
import { Test } from '@nestjs/testing';
import {
  OnchainContractCreateTransactionRecordChain,
  OnchainContractCreateTransactionRecordStatus,
  OnchainTransactionCreateRecord,
} from './records/onchain-transaction-create.record';
import { EvmService } from '../../web3/evm.service';
import { ContractDeployedSerializer } from '../../avro/contract-deployed.serializer';
import { ContractDeployFailedSerializer } from '../../avro/contract-deploy-failed.serializer';
import {
  DefenderTransactionRecord,
  DefenderTransactionStatus,
} from './records/defender-transaction.record';

describe('ContractsConsumer', () => {
  let contractsConsumer: ContractsConsumer;
  let prismaService: DeepMockProxy<PrismaClient>;
  let kafkaClient: DeepMockProxy<ClientKafka>;
  let evmService: DeepMockProxy<EvmService>;

  const mockDate = new Date();
  const mockContract: Contract & {
    participants: ContractParticipant[];
  } = {
    id: 'abc123',
    author: 'id',
    owner: '0xC94Da8449453EfF24b02e090765f5D47D69a3197',
    title: 'My Contract',
    description: 'Donald Trump',
    version: '1.0',
    address: '0x7fdb908AA02D3a1f8b7f9D882EA67B68Ab355dc1',
    legalAgreementUrl: 'https://exmaple.com',
    visualizationUrl: 'https://exmaple.com',
    chain: Chain.ETHEREUM,
    type: ContractType.VALVE,
    visibility: ContractVisibility.PRIVATE,
    status: ContractStatus.DRAFT,
    metadata: {},
    v: 0,
    createdAt: mockDate,
    updatedAt: mockDate,
    publishedAt: null,
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
    ],
  };
  const mockContractDeployment: ContractDeployment & {
    contract: Contract;
  } = {
    id: 'id',
    strategy: ContractDeploymentStrategy.CLIENT,
    status: ContractDeploymentStatus.DEPLOYING,
    transaction: null,
    contractId: 'abc123',
    contract: mockContract,
    createdAt: mockDate,
    updatedAt: mockDate,
    address: '0x0',
    defenderTransactionId: '',
    txData: {},
    unsignedTx: {},
    contractDeployedAvroRecordId: 'asd',
    contractDeployFailedAvroRecordId: 'asd',
    v: 0,
  };

  const contractAbi =
    '[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"InvalidFeePercentage","type":"error"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"oldFee","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newFee","type":"uint256"}],"name":"PlatformFeeChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address payable","name":"oldPlatformWallet","type":"address"},{"indexed":false,"internalType":"address payable","name":"newPlatformWallet","type":"address"}],"name":"PlatformWalletChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"contractAddress","type":"address"},{"indexed":false,"internalType":"address","name":"controller","type":"address"},{"indexed":false,"internalType":"address[]","name":"distributors","type":"address[]"},{"indexed":false,"internalType":"bytes32","name":"version","type":"bytes32"},{"indexed":false,"internalType":"bool","name":"isImmutableController","type":"bool"},{"indexed":false,"internalType":"bool","name":"isAutoNativeCurrencyDistribution","type":"bool"},{"indexed":false,"internalType":"uint256","name":"minAutoDistributeAmount","type":"uint256"},{"indexed":false,"internalType":"bytes32","name":"creationId","type":"bytes32"}],"name":"RSCValveCreated","type":"event"},{"inputs":[],"name":"contractImplementation","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"controller","type":"address"},{"internalType":"address[]","name":"distributors","type":"address[]"},{"internalType":"bool","name":"isImmutableController","type":"bool"},{"internalType":"bool","name":"isAutoNativeCurrencyDistribution","type":"bool"},{"internalType":"uint256","name":"minAutoDistributeAmount","type":"uint256"},{"internalType":"address payable[]","name":"initialRecipients","type":"address[]"},{"internalType":"uint256[]","name":"percentages","type":"uint256[]"},{"internalType":"bytes32","name":"creationId","type":"bytes32"}],"internalType":"struct XLARSCValveFactory.RSCCreateData","name":"_data","type":"tuple"}],"name":"createRSCValve","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"platformFee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"platformWallet","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"components":[{"internalType":"address","name":"controller","type":"address"},{"internalType":"address[]","name":"distributors","type":"address[]"},{"internalType":"bool","name":"isImmutableController","type":"bool"},{"internalType":"bool","name":"isAutoNativeCurrencyDistribution","type":"bool"},{"internalType":"uint256","name":"minAutoDistributeAmount","type":"uint256"},{"internalType":"address payable[]","name":"initialRecipients","type":"address[]"},{"internalType":"uint256[]","name":"percentages","type":"uint256[]"},{"internalType":"bytes32","name":"creationId","type":"bytes32"}],"internalType":"struct XLARSCValveFactory.RSCCreateData","name":"_data","type":"tuple"},{"internalType":"address","name":"_deployer","type":"address"}],"name":"predictDeterministicAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_fee","type":"uint256"}],"name":"setPlatformFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address payable","name":"_platformWallet","type":"address"}],"name":"setPlatformWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"version","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"}]';

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ContractsConsumer],
      providers: [
        {
          provide: 'CONTRACTS_KAFKA_CLIENT',
          useClass: ClientKafka,
        },
        PrismaService,
        EvmService,
        ContractDeployedSerializer,
        ContractDeployFailedSerializer,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .overrideProvider('CONTRACTS_KAFKA_CLIENT')
      .useValue(mockDeep<ClientKafka>())
      .overrideProvider(EvmService)
      .useValue(mockDeep<EvmService>())
      .overrideProvider(ContractDeployedSerializer)
      .useValue(mockDeep<ContractDeployedSerializer>())
      .overrideProvider(ContractDeployFailedSerializer)
      .useValue(mockDeep<ContractDeployFailedSerializer>())
      .compile();

    contractsConsumer = moduleRef.get(ContractsConsumer);
    prismaService = moduleRef.get(PrismaService);
    evmService = moduleRef.get(EvmService);
    kafkaClient = moduleRef.get('CONTRACTS_KAFKA_CLIENT');
  });

  it('should be defined', () => {
    expect(contractsConsumer).toBeDefined();
  });

  it('should subscribeToResponseOf topic', () => {
    const spySubscribeToResponseOf = jest.spyOn(
      kafkaClient,
      'subscribeToResponseOf',
    );

    contractsConsumer.onModuleInit();

    expect(spySubscribeToResponseOf).toBeCalledTimes(2);
    expect(spySubscribeToResponseOf.mock.calls[0][0]).toEqual(
      'web3-monitoring.TransactionCreateAvroRecord',
    );
    expect(spySubscribeToResponseOf.mock.calls[1][0]).toEqual(
      'web3-monitoring.RelayerTransactionAvroRecord',
    );
  });

  describe('handleBlockchainMonitoringContractDeploymentEvents', () => {
    async function handleBlockchainMonitoringContractDeploymentEvents(
      recordStatus: OnchainContractCreateTransactionRecordStatus,
      expectedContractStatus: ContractStatus,
      expectedContractDeploymentStatus: ContractDeploymentStatus,
      expectedContractAddress: string,
      expectedDate: jest.Expect,
    ): Promise<void> {
      const record: OnchainTransactionCreateRecord = {
        hash: '0x9281',
        from: '0xC94Da8449453EfF24b02e090765f5D47D69a3197',
        chain: OnchainContractCreateTransactionRecordChain.ETHEREUM,
        factory: 'VALVE',
        factoryVersion: '1.0',
        factoryAbi: contractAbi,
        value: 1,
        status: recordStatus,
        data: '0x02afbfe10000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000091b77e5e5d9a00000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000c94da8449453eff24b02e090765f5d47d69a31970000000000000000000000000000000000000000000000000000000000000001000000000000000000000000c94da8449453eff24b02e090765f5d47d69a319700000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000989680',
        logs: [
          {
            topics: [
              '0xa01b09fc44a34edac0ad1d4e96e7791b427cfdb772ade1da0dcead2eb18ff8c6',
            ],
            data: '0x00000000000000000000000007e2cf20b3aa330e5c4355a9d697c30417c286fe00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100312e3000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000091b77e5e5d9a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000c94da8449453eff24b02e090765f5d47d69a3197',
          },
        ],
      };

      const expectedFindUniqueCall = {
        where: {
          id: 'id',
        },
        include: {
          contract: true,
        },
      };
      const expectedContractUpdateCall = {
        data: {
          address: expectedContractAddress,
          status: expectedContractStatus,
          publishedAt: expectedDate,
          v: { increment: 1 },
        },
        where: { id: 'abc123', v: 0 },
      };
      const expectedContractDeploymentUpdateCall =
        recordStatus === OnchainContractCreateTransactionRecordStatus.MINED
          ? {
              data: {
                transaction: '0x9281',
                status: expectedContractDeploymentStatus,
                contractDeployedAvroRecord: {
                  create: {
                    record: undefined,
                  },
                },
                v: { increment: 1 },
              },
              where: { id: 'id', v: 0 },
            }
          : recordStatus ===
              OnchainContractCreateTransactionRecordStatus.FAILED ||
            recordStatus ===
              OnchainContractCreateTransactionRecordStatus.CANCELED
          ? {
              data: {
                transaction: '0x9281',
                status: expectedContractDeploymentStatus,
                contractDeployFailedAvroRecord: {
                  create: {
                    record: undefined,
                  },
                },
                v: { increment: 1 },
              },
              where: { id: 'id', v: 0 },
            }
          : {
              data: {
                transaction: '0x9281',
                status: expectedContractDeploymentStatus,
                v: { increment: 1 },
              },
              where: { id: 'id', v: 0 },
            };

      evmService.getRscContractCreationId.mockReturnValue('id');
      evmService.getRscContractAddress.mockReturnValue(
        '0x07E2cF20b3aA330E5C4355a9d697c30417C286fE',
      );

      //@ts-ignore
      prismaService.contractDeployment.findUnique.mockResolvedValue(
        mockContractDeployment,
      );
      prismaService.$transaction.mockImplementation((callback) =>
        //@ts-ignore
        callback(prismaService),
      );

      //@ts-ignore
      const spyFindUnique = jest.spyOn(
        prismaService.contractDeployment,
        'findUnique',
      );
      //@ts-ignore
      const spyContractUpdate = jest.spyOn(prismaService.contract, 'update');
      //@ts-ignore
      const spyContractDeploymentUpdate = jest.spyOn(
        prismaService.contractDeployment,
        'update',
      );

      await contractsConsumer.handleBlockchainMonitoringContractDeploymentEvents(
        record,
      );

      expect(spyFindUnique.mock.calls[0][0]).toEqual(expectedFindUniqueCall);
      expect(spyContractUpdate.mock.calls[0][0]).toEqual(
        expectedContractUpdateCall,
      );
      expect(spyContractDeploymentUpdate.mock.calls[0][0]).toEqual(
        expectedContractDeploymentUpdateCall,
      );
    }

    it('should handleBlockchainMonitoringContractDeploymentEvents with status MINED', async () => {
      await handleBlockchainMonitoringContractDeploymentEvents(
        OnchainContractCreateTransactionRecordStatus.MINED,
        ContractStatus.PUBLISHED,
        ContractDeploymentStatus.COMPLETED,
        '0x07E2cF20b3aA330E5C4355a9d697c30417C286fE',
        expect.any(Date),
      );
    });

    it('should handleBlockchainMonitoringContractDeploymentEvents with status CANCELED', async () => {
      await handleBlockchainMonitoringContractDeploymentEvents(
        OnchainContractCreateTransactionRecordStatus.CANCELED,
        ContractStatus.DRAFT,
        ContractDeploymentStatus.FAILED,
        null,
        null,
      );
    });

    it('should handleBlockchainMonitoringContractDeploymentEvents with status FAILED', async () => {
      await handleBlockchainMonitoringContractDeploymentEvents(
        OnchainContractCreateTransactionRecordStatus.FAILED,
        ContractStatus.DRAFT,
        ContractDeploymentStatus.FAILED,
        null,
        null,
      );
    });

    it('should handleBlockchainMonitoringContractDeploymentEvents with status PENDING', async () => {
      await handleBlockchainMonitoringContractDeploymentEvents(
        OnchainContractCreateTransactionRecordStatus.PENDING,
        ContractStatus.PENDING,
        ContractDeploymentStatus.DEPLOYING,
        null,
        null,
      );
    });

    it('should not update when invalid creationId', async () => {
      const record: OnchainTransactionCreateRecord = {
        hash: '0x9281',
        from: '0xC94Da8449453EfF24b02e090765f5D47D69a3197',
        chain: OnchainContractCreateTransactionRecordChain.ETHEREUM,
        factory: 'VALVE',
        factoryVersion: '1.0',
        factoryAbi: contractAbi,
        value: 1,
        status: OnchainContractCreateTransactionRecordStatus.MINED,
        data: '0x02afbfe10000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000091b77e5e5d9a00000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000c94da8449453eff24b02e090765f5d47d69a31970000000000000000000000000000000000000000000000000000000000000001000000000000000000000000c94da8449453eff24b02e090765f5d47d69a319700000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000989680',
        logs: [
          {
            topics: [
              '0xa01b09fc44a34edac0ad1d4e96e7791b427cfdb772ade1da0dcead2eb18ff8c6',
            ],
            data: '0x00000000000000000000000007e2cf20b3aa330e5c4355a9d697c30417c286fe00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100312e3000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000091b77e5e5d9a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000c94da8449453eff24b02e090765f5d47d69a3197',
          },
        ],
      };

      evmService.getRscContractCreationId.mockReturnValue('id');
      evmService.getRscContractAddress.mockReturnValue(
        '0x07E2cF20b3aA330E5C4355a9d697c30417C286fE',
      );

      //@ts-ignore
      prismaService.contractDeployment.findFirst.mockResolvedValue(null);

      //@ts-ignore
      const spyContractUpdate = jest.spyOn(prismaService.contract, 'update');
      //@ts-ignore
      const spyContractDeploymentUpdate = jest.spyOn(
        prismaService.contractDeployment,
        'update',
      );

      await contractsConsumer.handleBlockchainMonitoringContractDeploymentEvents(
        record,
      );

      expect(spyContractUpdate).toBeCalledTimes(0);
      expect(spyContractDeploymentUpdate).toBeCalledTimes(0);
    });

    it('should not update when sender of transaction not owner', async () => {
      const record: OnchainTransactionCreateRecord = {
        hash: '0x9281',
        from: '0x2',
        chain: OnchainContractCreateTransactionRecordChain.ETHEREUM,
        factory: 'VALVE',
        factoryVersion: '1.0',
        factoryAbi: contractAbi,
        value: 1,
        status: OnchainContractCreateTransactionRecordStatus.MINED,
        data: '0x02afbfe10000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000091b77e5e5d9a00000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000c94da8449453eff24b02e090765f5d47d69a31970000000000000000000000000000000000000000000000000000000000000001000000000000000000000000c94da8449453eff24b02e090765f5d47d69a319700000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000989680',
        logs: [
          {
            topics: [
              '0xa01b09fc44a34edac0ad1d4e96e7791b427cfdb772ade1da0dcead2eb18ff8c6',
            ],
            data: '0x00000000000000000000000007e2cf20b3aa330e5c4355a9d697c30417c286fe00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100312e3000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000091b77e5e5d9a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000c94da8449453eff24b02e090765f5d47d69a3197',
          },
        ],
      };

      evmService.getRscContractCreationId.mockReturnValue('id');
      evmService.getRscContractAddress.mockReturnValue(
        '0x07E2cF20b3aA330E5C4355a9d697c30417C286fE',
      );

      //@ts-ignore
      prismaService.contractDeployment.findFirst.mockResolvedValue(
        mockContractDeployment,
      );

      //@ts-ignore
      const spyContractUpdate = jest.spyOn(prismaService.contract, 'update');
      //@ts-ignore
      const spyContractDeploymentUpdate = jest.spyOn(
        prismaService.contractDeployment,
        'update',
      );

      await contractsConsumer.handleBlockchainMonitoringContractDeploymentEvents(
        record,
      );

      expect(spyContractUpdate).toBeCalledTimes(0);
      expect(spyContractDeploymentUpdate).toBeCalledTimes(0);
    });
  });
  describe('handleDefenderMonitoringEvent', () => {
    async function handleDefenderMonitoringEvent(
      recordStatus: DefenderTransactionStatus,
      transactionId: string,
      expectedContractStatus: ContractStatus,
      expectedContractDeploymentStatus: ContractDeploymentStatus,
      expectedDate: jest.Expect,
    ): Promise<void> {
      const record: DefenderTransactionRecord = {
        hash: '0x9281',
        status: recordStatus,
        transactionId: transactionId,
      };

      const expectedFindFirstCall = {
        where: {
          defenderTransactionId: transactionId,
        },
        include: {
          contract: true,
        },
      };
      const expectedContractUpdateCall =
        recordStatus === DefenderTransactionStatus.CONFIRMED
          ? {
              data: {
                address: '0x0',
                status: expectedContractStatus,
                publishedAt: expectedDate,
                v: { increment: 1 },
              },
              where: { id: 'abc123', v: 0 },
            }
          : {
              data: {
                address: null,
                status: expectedContractStatus,
                publishedAt: expectedDate,
                v: { increment: 1 },
              },
              where: { id: 'abc123', v: 0 },
            };
      const expectedContractDeploymentUpdateCall =
        recordStatus === DefenderTransactionStatus.CONFIRMED
          ? {
              data: {
                transaction: '0x9281',
                status: expectedContractDeploymentStatus,
                contractDeployedAvroRecord: {
                  create: {
                    record: undefined,
                  },
                },
                v: { increment: 1 },
              },
              where: { id: 'id', v: 0 },
            }
          : recordStatus === DefenderTransactionStatus.FAILED
          ? {
              data: {
                transaction: '0x9281',
                status: expectedContractDeploymentStatus,
                contractDeployFailedAvroRecord: {
                  create: {
                    record: undefined,
                  },
                },
                v: { increment: 1 },
              },
              where: { id: 'id', v: 0 },
            }
          : {
              data: {
                transaction: '0x9281',
                status: expectedContractDeploymentStatus,
                v: { increment: 1 },
              },
              where: { id: 'id', v: 0 },
            };

      //@ts-ignore
      prismaService.contractDeployment.findFirst.mockResolvedValue(
        mockContractDeployment,
      );
      prismaService.$transaction.mockImplementation((callback) =>
        //@ts-ignore
        callback(prismaService),
      );

      //@ts-ignore
      const spyFindFirst = jest.spyOn(
        prismaService.contractDeployment,
        'findFirst',
      );
      //@ts-ignore
      const spyContractUpdate = jest.spyOn(prismaService.contract, 'update');
      //@ts-ignore
      const spyContractDeploymentUpdate = jest.spyOn(
        prismaService.contractDeployment,
        'update',
      );

      await contractsConsumer.handleDefenderMonitoringEvents(record);

      expect(spyFindFirst.mock.calls[0][0]).toEqual(expectedFindFirstCall);
      expect(spyContractUpdate.mock.calls[0][0]).toEqual(
        expectedContractUpdateCall,
      );
      expect(spyContractDeploymentUpdate.mock.calls[0][0]).toEqual(
        expectedContractDeploymentUpdateCall,
      );
    }

    it('should handleBlockchainMonitoringContractDeploymentEvents with status SUBMITTED', async () => {
      await handleDefenderMonitoringEvent(
        DefenderTransactionStatus.SUBMITTED,
        'transactionId',
        ContractStatus.PENDING,
        ContractDeploymentStatus.DEPLOYING,
        null,
      );
    });
    it('should handleBlockchainMonitoringContractDeploymentEvents with status FAILED', async () => {
      await handleDefenderMonitoringEvent(
        DefenderTransactionStatus.FAILED,
        'transactionId',
        ContractStatus.DRAFT,
        ContractDeploymentStatus.FAILED,
        null,
      );
    });
    it('should handleBlockchainMonitoringContractDeploymentEvents with status CONFIRMED', async () => {
      await handleDefenderMonitoringEvent(
        DefenderTransactionStatus.CONFIRMED,
        'transactionId',
        ContractStatus.PUBLISHED,
        ContractDeploymentStatus.COMPLETED,
        expect.any(Date),
      );
    });
    it('should not update when transactionId is not valid', async () => {
      const record: DefenderTransactionRecord = {
        hash: '0x0',
        transactionId: '123',
        status: DefenderTransactionStatus.SUBMITTED,
      };
      prismaService.contractDeployment.findFirst.mockResolvedValue(
        mockContractDeployment,
      );
      //@ts-ignore
      const spyContractUpdate = jest.spyOn(prismaService.contract, 'update');
      //@ts-ignore
      const spyContractDeploymentUpdate = jest.spyOn(
        prismaService.contractDeployment,
        'update',
      );

      await contractsConsumer.handleDefenderMonitoringEvents(record);
      expect(spyContractUpdate).toBeCalledTimes(0);
      expect(spyContractDeploymentUpdate).toBeCalledTimes(0);
    });
  });
});
