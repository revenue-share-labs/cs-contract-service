/* eslint-disable @typescript-eslint/ban-ts-comment */

import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
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
  ContractDeploymentDto,
  ValveV1ContractCreatedDto,
  ValveV1ContractPreparedDto,
} from './dto';
import { WalletProvider } from '../../shared/services/user-service/dto/user-wallet.dto';
import { MumbaiDefenderService } from '../../shared/services/defender/mumbai-defender.service';

describe('ContractsController', () => {
  let contractsController: ContractsController;
  let prismaService: DeepMockProxy<PrismaClient>;
  let mumbaiDefenderService: DeepMockProxy<MumbaiDefenderService>;

  const mockDate = new Date();
  const mockUser: UserDto = {
    roles: [UserRole.CUSTOMER],
    wallets: [{ address: '0x1', provider: WalletProvider.META_MASK }],
    id: 'id',
    activeWallet: { address: '0x1', provider: WalletProvider.META_MASK },
    createdBy: UserCreationStrategy.ADDRESS,
  };
  const mockContract: Contract & {
    participants: ContractParticipant[];
  } = {
    id: 'abc123',
    author: 'id',
    owner: '0x1',
    title: 'My Contract',
    description: 'Donald Trump',
    version: '1.0',
    address: '0x7fdb908AA02D3a1f8b7f9D882EA67B68Ab355dc1',
    legalAgreementUrl: 'https://exmaple.com',
    visualizationUrl: 'https://exmaple.com',
    chain: Chain.POLYGON_MUMBAI,
    type: ContractType.VALVE,
    visibility: ContractVisibility.PRIVATE,
    status: ContractStatus.DRAFT,
    metadata: {},
    createdAt: mockDate,
    updatedAt: mockDate,
    publishedAt: mockDate,
    v: 0,
    participants: [
      {
        id: 'abc435',
        identifier: 'id',
        identifierType: ContractParticipantIdentifierType.ID,
        role: 'OWNER',
        contractId: 'abc123',
        createdAt: mockDate,
        updatedAt: mockDate,
      },
    ],
  };
  const mockValveV1ContractCreatedDto: ValveV1ContractCreatedDto = {
    id: 'abc123',
    author: 'id',
    owner: { address: '0x1', revenue: 0 },
    title: 'My Contract',
    description: 'Donald Trump',
    version: '1.0',
    address: '0x7fdb908AA02D3a1f8b7f9D882EA67B68Ab355dc1',
    chain: Chain.POLYGON_MUMBAI,
    type: ContractType.VALVE,
    visibility: ContractVisibility.PRIVATE,
    status: ContractStatus.DRAFT,
    legalAgreementUrl: 'https://exmaple.com',
    visualizationUrl: 'https://exmaple.com',
    createdAt: mockDate,
    updatedAt: mockDate,
    publishedAt: mockDate,
  };
  const mockValveV1ContractPreparedDto: ValveV1ContractPreparedDto = {
    title: 'My Contract',
    description: 'Donald Trump',
    version: '1.0',
    type: ContractType.VALVE,
    recipients: [],
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ContractsController],
      providers: [ContractsService, PrismaService, MumbaiDefenderService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .overrideProvider(MumbaiDefenderService)
      .useValue(mockDeep<MumbaiDefenderService>())
      .compile();

    contractsController = moduleRef.get(ContractsController);
    prismaService = moduleRef.get(PrismaService);
    mumbaiDefenderService = moduleRef.get(MumbaiDefenderService);
  });

  it('should be defined', () => {
    expect(contractsController).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a contract when valid id is passed', async () => {
      //@ts-ignore
      prismaService.contract.findUniqueOrThrow.mockResolvedValue(mockContract);
      expect(await contractsController.findOne('1', mockUser)).toStrictEqual(
        mockValveV1ContractCreatedDto,
      );
    });

    it('should return an NotFoundException when invalid id is passed', async () => {
      const mockError = new Error();

      prismaService.contract.findUniqueOrThrow.mockRejectedValue(mockError);

      try {
        await contractsController.findOne('1', mockUser);
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
      }
    });

    it('should return an ForbiddenException when not enough permission to view contract', async () => {
      const mockUser: UserDto = {
        roles: [UserRole.CUSTOMER],
        wallets: [{ address: '0x1', provider: WalletProvider.META_MASK }],
        id: 'id2345',
        activeWallet: { address: '0x1', provider: WalletProvider.META_MASK },
        createdBy: UserCreationStrategy.ADDRESS,
      };

      //@ts-ignore
      prismaService.contract.findUniqueOrThrow.mockResolvedValue(mockContract);

      try {
        await contractsController.findOne('1', mockUser);
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('create', () => {
    it('should return a contract', async () => {
      //@ts-ignore
      prismaService.contract.create.mockResolvedValue(mockContract);
      prismaService.$transaction.mockImplementation((callback) =>
        //@ts-ignore
        callback(prismaService),
      );

      expect(
        await contractsController.create(
          mockValveV1ContractPreparedDto,
          mockUser,
        ),
      ).toStrictEqual(mockValveV1ContractCreatedDto);
    });
  });

  describe('update', () => {
    it('should update a contract when valid id is passed', async () => {
      //@ts-ignore
      prismaService.contract.findUniqueOrThrow.mockResolvedValue(mockContract);
      //@ts-ignore
      prismaService.contract.update.mockResolvedValue(mockContract);
      prismaService.$transaction.mockImplementation((callback) =>
        //@ts-ignore
        callback(prismaService),
      );
      expect(
        await contractsController.update(
          '1',
          mockValveV1ContractPreparedDto,
          mockUser,
        ),
      ).toStrictEqual(mockValveV1ContractCreatedDto);
    });

    it('should return an NotFoundException when invalid id is passed', async () => {
      const mockError = new Error();

      prismaService.contract.findUniqueOrThrow.mockRejectedValue(mockError);

      try {
        await contractsController.update(
          '1',
          mockValveV1ContractPreparedDto,
          mockUser,
        );
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
      }
    });

    it('should return an ForbiddenException when author not owner', async () => {
      const mockUser: UserDto = {
        roles: [UserRole.CUSTOMER],
        wallets: [{ address: '0x1', provider: WalletProvider.META_MASK }],
        id: 'i12345',
        activeWallet: { address: '0x1', provider: WalletProvider.META_MASK },
        createdBy: UserCreationStrategy.ADDRESS,
      };
      //@ts-ignore
      prismaService.contract.findUniqueOrThrow.mockResolvedValue(mockContract);

      try {
        await contractsController.update(
          '1',
          mockValveV1ContractPreparedDto,
          mockUser,
        );
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('delete', () => {
    it('should delete a contract when valid id is passed', async () => {
      //@ts-ignore
      prismaService.contract.findUniqueOrThrow.mockResolvedValue(mockContract);
      //@ts-ignore
      prismaService.contract.delete.mockResolvedValue(mockContract);
      prismaService.$transaction.mockImplementation((callback) =>
        //@ts-ignore
        callback(prismaService),
      );
      await contractsController.remove('1', mockUser);
    });

    it('should return an NotFoundException when invalid id is passed', async () => {
      const mockError = new Error();

      prismaService.contract.findUniqueOrThrow.mockRejectedValue(mockError);

      try {
        await contractsController.remove('1', mockUser);
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
      }
    });

    it('should return an ForbiddenException when author not owner', async () => {
      const mockUser: UserDto = {
        roles: [UserRole.CUSTOMER],
        wallets: [{ address: '0x1', provider: WalletProvider.META_MASK }],
        id: 'i12345',
        activeWallet: { address: '0x1', provider: WalletProvider.META_MASK },
        createdBy: UserCreationStrategy.ADDRESS,
      };
      //@ts-ignore
      prismaService.contract.findUniqueOrThrow.mockResolvedValue(mockContract);

      try {
        await contractsController.remove('1', mockUser);
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('patchStatus', () => {
    const mockPatchContractStatusDto = {
      status: ContractStatus.PUBLISHED,
      address: '0x1',
    };

    it('should patchStatus a contract when valid id is passed', async () => {
      //@ts-ignore
      prismaService.contract.findUniqueOrThrow.mockResolvedValue(mockContract);
      //@ts-ignore
      prismaService.contract.update.mockResolvedValue(mockContract);
      prismaService.$transaction.mockImplementation((callback) =>
        //@ts-ignore
        callback(prismaService),
      );

      expect(
        await contractsController.patchStatus(
          '1',
          mockPatchContractStatusDto,
          mockUser,
        ),
      ).toStrictEqual(mockValveV1ContractCreatedDto);
    });

    it('should return an NotFoundException when invalid id is passed', async () => {
      const mockError = new Error();

      prismaService.contract.findUniqueOrThrow.mockRejectedValue(mockError);

      try {
        await contractsController.patchStatus(
          '1',
          mockPatchContractStatusDto,
          mockUser,
        );
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
      }
    });

    it('should return an ForbiddenException when author not owner', async () => {
      const mockUser: UserDto = {
        roles: [UserRole.CUSTOMER],
        wallets: [{ address: '0x1', provider: WalletProvider.META_MASK }],
        id: 'i12345',
        activeWallet: { address: '0x1', provider: WalletProvider.META_MASK },
        createdBy: UserCreationStrategy.ADDRESS,
      };
      //@ts-ignore
      prismaService.contract.findUniqueOrThrow.mockResolvedValue(mockContract);

      try {
        await contractsController.patchStatus(
          '1',
          mockPatchContractStatusDto,
          mockUser,
        );
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('createContractDeploymentWithPlatformStrategy', () => {
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

    it('should createContractDeploymentWithPlatformStrategy a contract when valid id is passed', async () => {
      const expectedContractDeployment: ContractDeploymentDto = {
        id: 'id',
        strategy: ContractDeploymentStrategy.PLATFORM,
        status: ContractDeploymentStatus.CREATED,
        contract: mockValveV1ContractCreatedDto,
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

      expect(
        await contractsController.createContractDeploymentWithPlatformStrategy(
          '1',
          mockUser,
        ),
      ).toStrictEqual(expectedContractDeployment);
    });

    it('should return an NotFoundException when invalid id is passed', async () => {
      const mockError = new Error();

      prismaService.contract.findUniqueOrThrow.mockRejectedValue(mockError);

      try {
        await contractsController.createContractDeploymentWithPlatformStrategy(
          '1',
          mockUser,
        );
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
      }
    });

    it('should return an ForbiddenException when author not owner', async () => {
      const mockUser: UserDto = {
        roles: [UserRole.CUSTOMER],
        wallets: [{ address: '0x1', provider: WalletProvider.META_MASK }],
        id: 'i12345',
        activeWallet: { address: '0x1', provider: WalletProvider.META_MASK },
        createdBy: UserCreationStrategy.ADDRESS,
      };
      //@ts-ignore
      prismaService.contract.findUniqueOrThrow.mockResolvedValue(mockContract);

      try {
        await contractsController.createContractDeploymentWithPlatformStrategy(
          '1',
          mockUser,
        );
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('getActiveContractDeployment', () => {
    const mockContractDeployment: ContractDeployment = {
      id: 'id',
      strategy: ContractDeploymentStrategy.PLATFORM,
      status: ContractDeploymentStatus.CREATED,
      transaction: null,
      contractId: 'abc123',
      createdAt: mockDate,
      updatedAt: mockDate,
      contractDeployedAvroRecordId: 'asd',
      contractDeployFailedAvroRecordId: 'asd',
      defenderTransactionId: '',
      txData: {},
      unsignedTx: {},
      address: '0x0',
      v: 0,
    };

    it('should getActiveContractDeployment a contract when valid id is passed', async () => {
      const expectedContractDeployment: ContractDeploymentDto = {
        id: 'id',
        strategy: ContractDeploymentStrategy.PLATFORM,
        status: ContractDeploymentStatus.CREATED,
        transaction: null,
        contract: mockValveV1ContractCreatedDto,
      };
      //@ts-ignore
      prismaService.contract.findUniqueOrThrow.mockResolvedValue(mockContract);
      //@ts-ignore
      prismaService.contractDeployment.findFirst.mockResolvedValue(
        mockContractDeployment,
      );

      expect(
        await contractsController.getActiveContractDeployment('1', mockUser),
      ).toStrictEqual(expectedContractDeployment);
    });

    it('should return an NotFoundException when invalid id is passed', async () => {
      const mockError = new Error();

      prismaService.contract.findUniqueOrThrow.mockRejectedValue(mockError);

      try {
        await contractsController.getActiveContractDeployment('1', mockUser);
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
      }
    });

    it('should return an ForbiddenException when author not owner', async () => {
      const mockUser: UserDto = {
        roles: [UserRole.CUSTOMER],
        wallets: [{ address: '0x1', provider: WalletProvider.META_MASK }],
        id: 'i12345',
        activeWallet: { address: '0x1', provider: WalletProvider.META_MASK },
        createdBy: UserCreationStrategy.ADDRESS,
      };
      //@ts-ignore
      prismaService.contract.findUniqueOrThrow.mockResolvedValue(mockContract);

      try {
        await contractsController.getActiveContractDeployment('1', mockUser);
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
  });
});
