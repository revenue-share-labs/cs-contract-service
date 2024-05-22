import {
  Contract,
  ContractDeployment,
  ContractDeploymentStatus,
  ContractStatus,
} from '@prisma/client';
import { Controller, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { ClientKafka, EventPattern, Payload } from '@nestjs/microservices';
import { PrismaService } from '../../prisma/prisma.service';
import { getUtcDate } from '../../../common/utils';
import {
  OnchainContractCreateTransactionRecordStatus,
  OnchainTransactionCreateRecord,
} from './records/onchain-transaction-create.record';
import { EvmService } from '../../web3/evm.service';
import {
  DefenderTransactionRecord,
  DefenderTransactionStatus,
} from './records/defender-transaction.record';
import { ContractDeployFailedSerializer } from '../../avro/contract-deploy-failed.serializer';
import { ContractDeployedSerializer } from '../../avro/contract-deployed.serializer';

// TODO: move topics to config
const blockchainMonitoringContractDeploymentEventsTopic =
  'web3-monitoring.TransactionCreateAvroRecord';
const defenderMonitoringEventsTopic =
  'web3-monitoring.RelayerTransactionAvroRecord';

@Controller()
export class ContractsConsumer implements OnModuleInit {
  private readonly logger = new Logger(ContractsConsumer.name);

  constructor(
    @Inject('CONTRACTS_KAFKA_CLIENT')
    private readonly kafkaClient: ClientKafka,
    private readonly prismaService: PrismaService,
    private readonly evmService: EvmService,
    private readonly contractDeployedSerializer: ContractDeployedSerializer,
    private readonly contractDeployFailedSerializer: ContractDeployFailedSerializer,
  ) {}

  async onModuleInit(): Promise<void> {
    this.kafkaClient.subscribeToResponseOf(
      blockchainMonitoringContractDeploymentEventsTopic,
    );
    this.kafkaClient.subscribeToResponseOf(defenderMonitoringEventsTopic);
  }

  @EventPattern(blockchainMonitoringContractDeploymentEventsTopic)
  async handleBlockchainMonitoringContractDeploymentEvents(
    @Payload()
    record: OnchainTransactionCreateRecord,
  ): Promise<void> {
    this.logger.debug(
      `Contract received for processing: ${JSON.stringify(record)}`,
    );
    const address = this.evmService.getRscContractAddress(
      record.factoryAbi,
      record.logs,
    );
    const creationId = this.evmService.getRscContractCreationId(
      record.factoryAbi,
      record.logs,
    );

    const contractDeployment =
      await this.prismaService.contractDeployment.findUnique({
        where: {
          id: creationId,
        },
        include: {
          contract: true,
        },
      });

    if (!contractDeployment) {
      this.logger.warn(
        `Contract deployment with creationId: ${creationId} not found`,
      );
      return;
    }
    if (record.from !== contractDeployment.contract.owner) {
      this.logger.warn(
        `Contract deployment with creationId: ${creationId} does not belong to ${record.from}`,
      );
      return;
    }

    const contractDeploymentUpdateData =
      await this.getContractDeploymentUpdateDataForOnchain(
        record,
        contractDeployment,
        contractDeployment.contract,
      );
    if (!contractDeploymentUpdateData) {
      this.logger.warn(`Failed to prepare contract deployment update data`);
      return;
    }
    await this.updateContractAndContractDeployment(
      record,
      contractDeployment,
      contractDeploymentUpdateData,
      address,
    );
  }

  @EventPattern(defenderMonitoringEventsTopic)
  async handleDefenderMonitoringEvents(
    @Payload()
    record: DefenderTransactionRecord,
  ): Promise<void> {
    this.logger.debug(
      `Contract received for processing: ${JSON.stringify(record)}`,
    );

    if (
      record.status !== DefenderTransactionStatus.MINED &&
      record.status !== DefenderTransactionStatus.INMEMPOOL &&
      record.status !== DefenderTransactionStatus.SENT
    ) {
      const contractDeployment =
        await this.prismaService.contractDeployment.findFirst({
          where: {
            defenderTransactionId: record.transactionId,
          },
          include: {
            contract: true,
          },
        });
      if (!contractDeployment) {
        this.logger.warn(
          `Contract deployment with transaction: ${record.transactionId} not found`,
        );
        return;
      }

      const contractDeploymentUpdateData =
        await this.getContractDeploymentUpdateDataForDefender(
          record,
          contractDeployment,
          contractDeployment.contract,
        );

      if (!contractDeploymentUpdateData) {
        this.logger.warn(`Failed to prepare contract deployment update data`);
        return;
      }

      await this.updateContractAndContractDeployment(
        record,
        contractDeployment,
        contractDeploymentUpdateData,
        contractDeployment.address,
      );
    }
  }

  private async updateContractAndContractDeployment(
    record: OnchainTransactionCreateRecord | DefenderTransactionRecord,
    contractDeployment: ContractDeployment & { contract: Contract },
    contractDeploymentUpdateData: ContractDeployment,
    address: string,
  ): Promise<void> {
    const contractStatus = {
      PENDING: (): ContractStatus => {
        return ContractStatus.PENDING;
      },
      MINED: (): ContractStatus => {
        return ContractStatus.PUBLISHED;
      },
      CONFIRMED: (): ContractStatus => {
        return ContractStatus.PUBLISHED;
      },
      FAILED: (): ContractStatus => {
        return ContractStatus.DRAFT;
      },
      CANCELED: (): ContractStatus => {
        return ContractStatus.DRAFT;
      },
      SUBMITTED: (): ContractStatus => {
        return ContractStatus.PENDING;
      },
    };
    await this.prismaService.$transaction(async (tx) => {
      await tx.contractDeployment.update({
        where: { id: contractDeployment.id, v: contractDeployment.v },
        data: contractDeploymentUpdateData,
      });
      await tx.contract.update({
        where: {
          id: contractDeployment.contract.id,
          v: contractDeployment.contract.v,
        },
        data: {
          status: contractStatus[record.status](),
          address:
            record.status === DefenderTransactionStatus.MINED ||
            record.status === DefenderTransactionStatus.CONFIRMED
              ? address
              : null,
          publishedAt:
            record.status === DefenderTransactionStatus.MINED ||
            record.status === DefenderTransactionStatus.CONFIRMED
              ? getUtcDate()
              : null,
          v: { increment: 1 },
        },
      });
    });
  }

  private async getContractDeploymentUpdateDataForOnchain(
    record: OnchainTransactionCreateRecord,
    contractDeployment: ContractDeployment,
    contract: Contract,
  ): Promise<ContractDeployment> {
    let contractDeploymentUpdateData;
    const contractDeploymentStatus = {
      PENDING: (): ContractDeploymentStatus => {
        return ContractDeploymentStatus.DEPLOYING;
      },
      MINED: (): ContractDeploymentStatus => {
        return ContractDeploymentStatus.COMPLETED;
      },
      FAILED: (): ContractDeploymentStatus => {
        return ContractDeploymentStatus.FAILED;
      },
      CANCELED: (): ContractDeploymentStatus => {
        return ContractDeploymentStatus.FAILED;
      },
    };
    if (
      record.status === OnchainContractCreateTransactionRecordStatus.FAILED ||
      record.status === OnchainContractCreateTransactionRecordStatus.CANCELED
    ) {
      this.logger.debug(`Create failed/canceled data: ${record.status}`);
      const contractDeployFailedRecord =
        await this.contractDeployFailedSerializer.serialize({
          deploymentId: contractDeployment.id,
          contractId: contract.id,
          errorDetails: {
            message:
              record.status ===
              OnchainContractCreateTransactionRecordStatus.FAILED
                ? 'Transaction failed'
                : 'Transaction canceled',
          },
        });

      contractDeploymentUpdateData = {
        transaction: record.hash,
        status: contractDeploymentStatus[record.status](),
        v: { increment: 1 },
        contractDeployFailedAvroRecord: {
          create: { record: contractDeployFailedRecord },
        },
      };
    }
    if (
      record.status === OnchainContractCreateTransactionRecordStatus.PENDING
    ) {
      this.logger.debug(`Create pending data: ${record.status}`);

      contractDeploymentUpdateData = {
        transaction: record.hash,
        status: contractDeploymentStatus[record.status](),
        v: { increment: 1 },
      };
    }

    if (record.status === OnchainContractCreateTransactionRecordStatus.MINED) {
      this.logger.debug(`Create deployed data : ${record.status}`);
      const contractDeployedRecord =
        await this.contractDeployedSerializer.serialize({
          deploymentId: contractDeployment.id,
          contractId: contract.id,
        });

      contractDeploymentUpdateData = {
        transaction: record.hash,
        status: contractDeploymentStatus[record.status](),
        v: { increment: 1 },
        contractDeployedAvroRecord: {
          create: { record: contractDeployedRecord },
        },
      };
    }
    return contractDeploymentUpdateData;
  }

  private async getContractDeploymentUpdateDataForDefender(
    record: DefenderTransactionRecord,
    contractDeployment: ContractDeployment,
    contract: Contract,
  ): Promise<ContractDeployment> {
    let contractDeploymentUpdateData;

    const contractDeploymentStatus = {
      SUBMITTED: (): ContractDeploymentStatus => {
        return ContractDeploymentStatus.DEPLOYING;
      },
      MINED: (): ContractDeploymentStatus => {
        return ContractDeploymentStatus.COMPLETED;
      },
      FAILED: (): ContractDeploymentStatus => {
        return ContractDeploymentStatus.FAILED;
      },
      CONFIRMED: (): ContractDeploymentStatus => {
        return ContractDeploymentStatus.COMPLETED;
      },
    };
    if (record.status === DefenderTransactionStatus.FAILED) {
      const contractDeployFailedRecord =
        await this.contractDeployFailedSerializer.serialize({
          deploymentId: contractDeployment.id,
          contractId: contract.id,
          errorDetails: {
            message: 'Transaction failed',
          },
        });
      contractDeploymentUpdateData = {
        transaction: record.hash,
        status: contractDeploymentStatus[record.status](),
        v: { increment: 1 },
        contractDeployFailedAvroRecord: {
          create: { record: contractDeployFailedRecord },
        },
      };
    }
    if (record.status === DefenderTransactionStatus.SUBMITTED) {
      contractDeploymentUpdateData = {
        transaction: record.hash,
        status: contractDeploymentStatus[record.status](),
        v: { increment: 1 },
      };
    }
    if (record.status === DefenderTransactionStatus.CONFIRMED) {
      const contractDeployedRecord =
        await this.contractDeployedSerializer.serialize({
          deploymentId: contractDeployment.id,
          contractId: contract.id,
        });

      contractDeploymentUpdateData = {
        transaction: record.hash,
        status: contractDeploymentStatus[record.status](),
        v: { increment: 1 },
        contractDeployedAvroRecord: {
          create: { record: contractDeployedRecord },
        },
      };
    }

    return contractDeploymentUpdateData;
  }
}
