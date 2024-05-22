/* eslint-disable @typescript-eslint/no-explicit-any */
import { ForbiddenException, MethodNotAllowedException } from '@nestjs/common';
import {
  ContractDeployment,
  ContractDeploymentStatus,
  ContractDeploymentStrategy,
  ContractStatus,
} from '@prisma/client';
import { SortOrder } from '../generic/dto';
import { UserDto } from '../../shared/services/user-service/dto';
import {
  Prisma,
  Contract,
  ContractVisibility,
  ContractParticipant,
} from '@prisma/client';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { differenceBy } from 'lodash';
import {
  SearchContractsDto as SearchContractsDto,
  PaginatedContractsSearchDto,
  CreatedContractType,
  SearchContractsQueryDto,
  WrappablePreparedContract,
  PatchContractStatusDto,
  PreparedContractsWrappedDtoConfigMap,
  ContractDeploymentDto,
  PreparedContractType,
} from './dto';
import { PrismaService } from '../../shared/services/prisma/prisma.service';
import { ApiErrorDto } from '../generic/dto';
import {
  Chains,
  getContractAbiAndAddress,
  setDataIfDefined,
  unwrapRawContractToCreatedContract,
} from '../../shared/common/utils';
import { DefenderService } from '../../shared/services/defender/defender.service';
import { ValveTxDataDto } from '../../shared/services/defender/dto/valve-tx-data.dto';
import { RelayerTransactionPayload } from 'defender-relay-client';
import { MumbaiDefenderService } from '../../shared/services/defender/mumbai-defender.service';

export type ContractCreateUpdateType =
  | Prisma.ContractUpdateInput
  | Prisma.ContractCreateInput;

export type ContractParticipantCreateUpdateType =
  | Prisma.ContractParticipantCreateManyInput
  | Prisma.ContractParticipantUpdateManyMutationInput;

@Injectable()
export class ContractsService {
  private readonly logger = new Logger(ContractsService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly mumbaiDefenderService: MumbaiDefenderService,
  ) {}

  async search(
    query: SearchContractsQueryDto,
    searchContractsDto: SearchContractsDto,
    user: UserDto,
  ): Promise<PaginatedContractsSearchDto> {
    this.logger.debug(
      `Search contracts search request query: ${JSON.stringify(
        query,
      )}, body: ${JSON.stringify(searchContractsDto)}`,
    );

    const pipeline: any[] = [
      this.buildSearchContractsQuery(query, searchContractsDto),
      ...this.buildSearchContractsParticipantsQuery(searchContractsDto, user),
    ];
    const sortPipeQuery =
      this.buildSearchContractsSortPipeQuery(searchContractsDto);

    this.logger.debug(
      `Search contracts built pipeline: ${JSON.stringify([
        ...pipeline,
        sortPipeQuery,
      ])}`,
    );

    const count: any = await this.prismaService.contract.aggregateRaw({
      pipeline: [
        ...pipeline,
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
          },
        },
      ],
    });

    const contracts: any = await this.prismaService.contract.aggregateRaw({
      pipeline: [
        ...pipeline,
        sortPipeQuery,
        { $skip: query.offset },
        { $limit: query.limit },
      ],
    });

    return this.unwrapSearchResultsToPaginatedContractsSearchDto(
      count,
      contracts,
    );
  }

  async findOne(id: string, user: UserDto): Promise<CreatedContractType> {
    this.logger.debug(
      `Find contract request: ${id} for user: ${JSON.stringify(user)}`,
    );

    const createdContract = await this.findContract(id, user);
    return unwrapRawContractToCreatedContract(createdContract);
  }

  async create(
    wrappedPreparedContractDto: WrappablePreparedContract<PreparedContractType>,
    user: UserDto,
  ): Promise<CreatedContractType> {
    this.logger.debug(
      `Create contract request: ${JSON.stringify(
        wrappedPreparedContractDto,
      )} for user: ${JSON.stringify(user)}`,
    );

    let createdContract: Contract;
    const preparedContractSchema =
      wrappedPreparedContractDto.buildCreateContractSchema(
        user.id,
        user.activeWallet?.address,
      ) as Prisma.ContractCreateInput;

    await this.prismaService.$transaction(async (tx) => {
      createdContract = await tx.contract.create({
        data: preparedContractSchema,
      });

      const preparedContractParticipantsSchema =
        wrappedPreparedContractDto.buildContractParticipantsSchema(
          user.id,
          user.activeWallet?.address,
          createdContract.id,
        ) as Prisma.ContractParticipantCreateManyInput[];

      await tx.contractParticipant.createMany({
        data: preparedContractParticipantsSchema,
      });
    });

    return unwrapRawContractToCreatedContract(createdContract);
  }

  async update(
    id: string,
    wrappedPreparedContractDto: WrappablePreparedContract<PreparedContractType>,
    user: UserDto,
  ): Promise<CreatedContractType> {
    this.logger.debug(
      `Update contract request: ${JSON.stringify(
        wrappedPreparedContractDto,
      )} with id: ${id} for user: ${JSON.stringify(user)}`,
    );

    const updatingContract = await this.findContract(id, user);

    const userIdentifiers = this.combineUserIdentifiers(user);
    const updateInitiatorRoles = updatingContract.participants
      .filter((participant) => userIdentifiers.includes(participant.identifier))
      .map((participant) => participant.role);

    let contractUpdateInput: ContractCreateUpdateType;
    let preparedContractParticipantsSchema: ContractParticipantCreateUpdateType[];
    const updatingContractOwner =
      updatingContract.owner ||
      (updatingContract.author === user.id && user.activeWallet
        ? user.activeWallet.address
        : null);

    try {
      contractUpdateInput =
        wrappedPreparedContractDto.buildUpdateContractSchema(
          updateInitiatorRoles,
          updatingContract,
          updatingContract.author,
          updatingContractOwner,
        ) as Prisma.ContractUpdateInput;
      preparedContractParticipantsSchema =
        wrappedPreparedContractDto.buildContractParticipantsSchema(
          updatingContract.author,
          updatingContractOwner,
          updatingContract.id,
        );
    } catch (e) {
      this.logger.debug(e);
      this.throwContractAccessDeniedException();
    }

    const participantsToCreate = differenceBy(
      preparedContractParticipantsSchema,
      updatingContract.participants,
      'identifier',
    ) as Prisma.ContractParticipantCreateManyInput[];
    const participantsToDelete = differenceBy(
      updatingContract.participants,
      preparedContractParticipantsSchema,
      'identifier',
    ).map((participant) => participant.id);

    let updatedContract: Contract;
    await this.prismaService.$transaction(async (tx) => {
      try {
        updatedContract = await tx.contract.update({
          where: {
            id: id,
            v: updatingContract.v,
          },
          data: { ...contractUpdateInput, v: { increment: 1 } },
        });
      } catch (err) {
        this.logger.debug(
          `Failed to update: ${id} contract for user: ${JSON.stringify(
            user,
          )}. Error: ${err.message}`,
        );
        this.throwContractNotFoundException(id);
      }

      if (participantsToCreate.length) {
        await tx.contractParticipant.createMany({ data: participantsToCreate });
      }
      if (participantsToDelete.length) {
        await tx.contractParticipant.deleteMany({
          where: { id: { in: participantsToDelete } },
        });
      }
    });

    return unwrapRawContractToCreatedContract(updatedContract);
  }

  async remove(id: string, user: UserDto): Promise<void> {
    this.logger.debug(
      `Delete contract request with id: ${id} for user: ${JSON.stringify(
        user,
      )}`,
    );

    const createdContract = await this.findContract(id, user);

    if (createdContract.status !== ContractStatus.DRAFT) {
      this.logger.debug(
        `U can't delete contract: ${createdContract.id} in status: ${createdContract.status}`,
      );
      this.throwContractMethodNotAllowedException();
    }
    if (
      !(
        createdContract.author === user.id ||
        createdContract.owner === user.activeWallet?.address
      )
    ) {
      this.logger.debug(
        `User: ${user.id} is not author or owner of contract: ${createdContract.id}`,
      );
      this.throwContractAccessDeniedException();
    }

    await this.prismaService.contract.delete({
      where: {
        id: id,
      },
    });
  }

  // TODO: remove after contract monitoring will be available, only for Alpha
  async patchStatus(
    id: string,
    patchContractStatusDto: PatchContractStatusDto,
    user: UserDto,
  ): Promise<CreatedContractType> {
    const updatingContract = await this.findOne(id, user);
    const wrappedUpdatingContract: WrappablePreparedContract<PreparedContractType> =
      PreparedContractsWrappedDtoConfigMap[updatingContract.type][
        updatingContract.version
      ](updatingContract);

    if (patchContractStatusDto.status === ContractStatus.PUBLISHED) {
      wrappedUpdatingContract.preparedContract.address =
        patchContractStatusDto.address;
    }
    wrappedUpdatingContract.preparedContract.status =
      patchContractStatusDto.status;

    return await this.update(id, wrappedUpdatingContract, user);
  }

  async createContractDeploymentWithPlatformStrategy(
    id: string,
    user: UserDto,
  ): Promise<ContractDeploymentDto> {
    this.logger.debug(`Find contract with id: ${id}`);
    const deployingContract = await this.findContract(id, user);
    if (deployingContract.author !== user.id) {
      this.throwContractAccessDeniedException();
    }
    if (deployingContract.status !== ContractStatus.DRAFT) {
      this.throwContractMethodNotAllowedException();
    }
    let contractDeployment: ContractDeployment;
    let contract: Contract;
    this.logger.debug(`Create contract deployment for contract with id: ${id}`);
    await this.prismaService.$transaction(async (tx) => {
      try {
        contract = await tx.contract.update({
          where: {
            id: id,
            v: deployingContract.v,
          },
          data: { status: ContractStatus.PENDING, v: { increment: 1 } },
        });
      } catch (err) {
        this.logger.debug(
          `Failed to update: ${id} contract for user: ${JSON.stringify(
            user,
          )}. Error: ${err.message}`,
        );
        this.throwContractNotFoundException(id);
      }

      contractDeployment = await tx.contractDeployment.create({
        data: {
          strategy: ContractDeploymentStrategy.PLATFORM,
          status: ContractDeploymentStatus.CREATED,
          contract: { connect: { id } },
          txData: {},
          unsignedTx: {},
        },
      });
    });
    const chainId = Chains[contract.chain];
    const defenderService: DefenderService = this.getDefenderService(chainId);
    this.logger.debug(
      `Get factory ABI and factory address for contract with id: ${id}`,
    );
    const { abi: factoryAbi, address: factoryAddress } =
      getContractAbiAndAddress(contract.chain, contract.type, contract.version);

    const formattedContract = unwrapRawContractToCreatedContract(contract);

    this.logger.debug(`Prepare tx data for contract with id: ${id}`);
    const contractDeploymentWithTxData = defenderService.prepareValveTxData(
      contractDeployment,
      formattedContract,
    );

    const txData: ValveTxDataDto =
      contractDeploymentWithTxData.txData as unknown as ValveTxDataDto;

    this.logger.debug(`Calculate address for contract with id: ${id}`);
    const address = await defenderService.calculateContractAddress(
      txData,
      factoryAddress,
      factoryAbi,
    );

    this.logger.debug(`Create unsigned tx for contract with id: ${id}`);
    const unsignedTx: RelayerTransactionPayload =
      await defenderService.createUnsignedTx(
        txData,
        factoryAbi,
        address,
        factoryAddress,
      );

    const contractDeploymentWithUnsignedTx =
      this.setUnsignedTxToContractDeployment(
        contractDeploymentWithTxData,
        unsignedTx,
      );

    this.logger.debug(
      `Update contract deployment with tx data, contract address and unsigned tx for contract with id: ${id}`,
    );
    await this.prismaService.contractDeployment.update({
      where: { id: contractDeployment.id },
      data: {
        address: address,
        txData: contractDeploymentWithUnsignedTx.txData,
        status: ContractDeploymentStatus.PREPARED,
        unsignedTx: contractDeploymentWithUnsignedTx.unsignedTx,
      },
    });
    this.logger.debug(`Deploy contract with id: ${id}`);
    const transactionId = await defenderService.createRSCContractByRelay(
      factoryAddress,
      unsignedTx,
    );

    this.logger.debug(
      `Update contract deployment status and transaction for contract with id: ${id}`,
    );
    await this.prismaService.$transaction(async (tx) => {
      contractDeployment = await tx.contractDeployment.update({
        where: {
          id: contractDeployment.id,
        },
        data: {
          status: ContractDeploymentStatus.DEPLOYING,
          defenderTransactionId: transactionId,
        },
      });
    });

    return {
      id: contractDeployment.id,
      status: contractDeployment.status,
      strategy: contractDeployment.strategy,
      contract: unwrapRawContractToCreatedContract(contract),
    };
  }

  async getActiveContractDeployment(
    id: string,
    user: UserDto,
  ): Promise<ContractDeploymentDto> {
    const contract = await this.findContract(id, user);
    const contractDeployment =
      await this.prismaService.contractDeployment.findFirst({
        where: {
          contractId: id,
          status: {
            in: [
              ContractDeploymentStatus.CREATED,
              ContractDeploymentStatus.DEPLOYING,
            ],
          },
        },
      });

    if (!contractDeployment) {
      this.throwContractDeploymentNotFoundException(id);
    }

    return {
      id: contractDeployment.id,
      status: contractDeployment.status,
      strategy: contractDeployment.strategy,
      transaction: contractDeployment.transaction,
      contract: unwrapRawContractToCreatedContract(contract),
    };
  }

  private getDefenderService(chainId: string): DefenderService {
    switch (chainId) {
      case Chains.POLYGON_MUMBAI:
        return this.mumbaiDefenderService;
      default:
        throw new Error(`Invalid chainId: ${chainId}`);
    }
  }

  private setUnsignedTxToContractDeployment(
    contractDeployment: ContractDeployment,
    unsignedTx: RelayerTransactionPayload,
  ): ContractDeployment {
    setDataIfDefined(contractDeployment, 'unsignedTx', 'to', unsignedTx.to);
    setDataIfDefined(
      contractDeployment,
      'unsignedTx',
      'value',
      unsignedTx.value,
    );
    setDataIfDefined(contractDeployment, 'unsignedTx', 'data', unsignedTx.data);
    setDataIfDefined(
      contractDeployment,
      'unsignedTx',
      'gasLimit',
      unsignedTx.gasLimit,
    );
    if ('speed' in unsignedTx) {
      setDataIfDefined(
        contractDeployment,
        'unsignedTx',
        'speed',
        unsignedTx.speed,
      );
    }
    return contractDeployment;
  }

  private buildSearchContractsQuery(
    query: SearchContractsQueryDto,
    searchContractsDto: SearchContractsDto,
  ): any {
    const searchContractsQuery = { $match: {} };

    if (searchContractsDto.author) {
      searchContractsQuery.$match = {
        ...searchContractsQuery.$match,
        author: searchContractsDto.author,
      };
    }
    if (query.status) {
      searchContractsQuery.$match = {
        ...searchContractsQuery.$match,
        status: {
          $in: Array.isArray(query.status) ? query.status : [query.status],
        },
      };
    }
    if (searchContractsDto.title) {
      searchContractsQuery.$match = {
        ...searchContractsQuery.$match,
        title: { $regex: searchContractsDto.title, $options: 'i' },
      };
    }
    if (searchContractsDto.type) {
      searchContractsQuery.$match = {
        ...searchContractsQuery.$match,
        type: { $in: searchContractsDto.type },
      };
    }
    if (searchContractsDto.recipientsStatus?.length) {
      searchContractsQuery.$match = {
        ...searchContractsQuery.$match,
        'metadata.isRecipientsLocked': {
          $in: [],
        },
      };
      const recipientsStatusQuery = {
        LOCKED: (): void => {
          searchContractsQuery.$match['metadata.isRecipientsLocked'].$in.push(
            true,
          );
        },
        EDITABLE: (): void => {
          searchContractsQuery.$match['metadata.isRecipientsLocked'].$in.push(
            false,
            null,
          );
        },
      };
      searchContractsDto.recipientsStatus.forEach((recipientsStatus) =>
        recipientsStatusQuery[recipientsStatus](),
      );
    }

    return searchContractsQuery;
  }

  private buildSearchContractsParticipantsQuery(
    searchContractsDto: SearchContractsDto,
    user: UserDto,
  ): any[] {
    const searchContractsParticipantsQuery = {
      $match: {
        $or: [],
      },
    };

    let communityVisibility: any = { visibility: ContractVisibility.COMMUNITY };
    let privateVisibility: any = {
      visibility: ContractVisibility.PRIVATE,
      'participant.identifier': { $in: this.combineUserIdentifiers(user) },
    };

    if (searchContractsDto.participantStatus?.length) {
      communityVisibility = {
        ...communityVisibility,
        'participant.identifier': { $in: this.combineUserIdentifiers(user) },
        'participant.role': { $in: searchContractsDto.participantStatus },
      };
      privateVisibility = {
        ...privateVisibility,
        'participant.role': { $in: searchContractsDto.participantStatus },
      };
    }

    if (searchContractsDto.visibility?.length) {
      const visibilityQuery = {
        COMMUNITY: (): void => {
          searchContractsParticipantsQuery.$match.$or.push(communityVisibility);
        },
        PRIVATE: (): void => {
          searchContractsParticipantsQuery.$match.$or.push(privateVisibility);
        },
      };
      searchContractsDto.visibility.forEach((visibility) =>
        visibilityQuery[visibility](),
      );
    } else {
      searchContractsParticipantsQuery.$match.$or.push(
        communityVisibility,
        privateVisibility,
      );
    }

    const query: any[] = [
      {
        $lookup: {
          from: 'ContractParticipant',
          localField: '_id',
          foreignField: 'contractId',
          as: 'participant',
        },
      },
      { $unwind: '$participant' },
      searchContractsParticipantsQuery,
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
    ];

    return query;
  }

  private buildSearchContractsSortPipeQuery(
    searchContractsDto: SearchContractsDto,
  ): any {
    const sortPipeQuery = { $sort: {} };

    if (searchContractsDto.epoch) {
      const epochOrderBy = {
        CREATED: (): void => {
          sortPipeQuery.$sort = {
            createdAt: this.modifySortOrderToNumber(
              searchContractsDto.dateSortOrder,
            ),
          };
        },
        UPDATED: (): void => {
          sortPipeQuery.$sort = {
            updatedAt: this.modifySortOrderToNumber(
              searchContractsDto.dateSortOrder,
            ),
          };
        },
        PUBLISHED: (): void => {
          sortPipeQuery.$sort = {
            publishedAt: this.modifySortOrderToNumber(
              searchContractsDto.dateSortOrder,
            ),
          };
        },
      };
      epochOrderBy[searchContractsDto.epoch]();
    } else {
      sortPipeQuery.$sort = {
        title: this.modifySortOrderToNumber(searchContractsDto.titleSortOrder),
      };
    }

    return sortPipeQuery;
  }

  private unwrapSearchResultsToPaginatedContractsSearchDto(
    count: any,
    contracts: any,
  ): PaginatedContractsSearchDto {
    if (
      Array.isArray(count) &&
      count.length !== 0 &&
      Array.isArray(contracts)
    ) {
      return {
        total: count[0].count,
        data: contracts.map((contract) => ({
          id: contract._id.$oid,
          author: contract.author,
          owner: { address: contract.owner, revenue: 0 },
          title: contract.title,
          address: contract.address,
          status: contract.status,
          type: contract.type,
          chain: contract.chain,
          participantStatus: [
            ...new Set(
              contract.participants.map((participant) => participant.role),
            ),
          ],
          createdAt: contract.createdAt.$date,
          updatedAt: contract.updatedAt.$date,
          publishedAt: contract.publishedAt?.$date,
        })),
      };
    } else {
      return {
        total: 0,
        data: [],
      };
    }
  }

  private modifySortOrderToNumber(sortOrder: SortOrder): number {
    return sortOrder === SortOrder.asc ? 1 : -1;
  }

  private async findContract(
    id: string,
    user: UserDto,
  ): Promise<
    Contract & {
      participants: ContractParticipant[];
    }
  > {
    let contract: Contract & {
      participants: ContractParticipant[];
    };
    try {
      contract = await this.prismaService.contract.findUniqueOrThrow({
        where: {
          id: id,
        },
        include: {
          participants: true,
        },
      });
    } catch (err) {
      this.logger.debug(
        `Failed to find: ${id} contract for user: ${JSON.stringify(
          user,
        )}. Error: ${err.message}`,
      );
      this.throwContractNotFoundException(id);
    }

    if (
      contract.visibility === ContractVisibility.PRIVATE &&
      contract.participants.filter((participant) =>
        this.combineUserIdentifiers(user).includes(participant.identifier),
      ).length === 0
    ) {
      this.logger.debug(
        `User dose not have permissions to find: ${id} contract for user: ${JSON.stringify(
          user,
        )}`,
      );
      this.throwContractAccessDeniedException();
    }

    return contract;
  }

  private throwContractNotFoundException(id: string): void {
    const apiErrorDto: ApiErrorDto = {
      message: 'Resource not found',
      errors: [
        {
          message: `Contract with id: ${id} doesn't exist or resource not available`,
        },
      ],
    };
    throw new NotFoundException(apiErrorDto);
  }

  private throwContractDeploymentNotFoundException(id: string): void {
    const apiErrorDto: ApiErrorDto = {
      message: 'Resource not found',
      errors: [
        {
          message: `Active contract deployment with contractId: ${id} doesn't exist or resource not available`,
        },
      ],
    };
    throw new NotFoundException(apiErrorDto);
  }

  private throwContractAccessDeniedException(): void {
    const apiErrorDto: ApiErrorDto = {
      message: 'Access denied',
      errors: [
        {
          message: `You can't interact with this contract`,
        },
      ],
    };
    throw new ForbiddenException(apiErrorDto);
  }

  private throwContractMethodNotAllowedException(): void {
    const apiErrorDto: ApiErrorDto = {
      message: 'Method not allowed',
      errors: [
        {
          message: `You can't change the state of contract`,
        },
      ],
    };
    throw new MethodNotAllowedException(apiErrorDto);
  }

  private combineUserIdentifiers(user: UserDto): string[] {
    return user.activeWallet?.address !== undefined &&
      user.activeWallet?.address !== null
      ? [user.id, user.activeWallet.address]
      : [user.id];
  }
}
