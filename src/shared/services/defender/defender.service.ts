import { ContractRunner, ethers, Interface, InterfaceAbi } from 'ethers';
import {
  DefenderRelayProvider,
  DefenderRelaySigner,
} from 'defender-relay-client/lib/ethers';
import { ContractDeployment } from '@prisma/client';
import {
  generateCreationId,
  setDataIfDefined,
  toBigNumber,
  valveDistributorsToContractFormat,
  valveRecipientsToContractFormat,
} from '../../common/utils';
import { ValveV1ContractCreatedDto } from '../../../api/contracts/dto';
import { ValveTxDataDto } from './dto/valve-tx-data.dto';
import { Injectable, Logger } from '@nestjs/common';
import { Relayer, RelayerTransactionPayload } from 'defender-relay-client';

@Injectable()
export abstract class DefenderService {
  private readonly logger: Logger;

  private readonly signer: DefenderRelaySigner;
  private readonly relayer: Relayer;

  protected constructor(
    private readonly credentials: { apiKey: string; apiSecret: string },
    private readonly defenderName: string,
  ) {
    const provider = new DefenderRelayProvider(credentials);
    this.signer = new DefenderRelaySigner(credentials, provider, {
      speed: 'fast',
    });
    this.relayer = new Relayer(credentials);
    this.logger = new Logger(defenderName);
  }

  async calculateContractAddress(
    txData: ValveTxDataDto,
    factoryAddress: string,
    factoryAbi: InterfaceAbi,
  ): Promise<string> {
    this.logger.debug(`Calculate contract address`);
    const deployerAddress = await this.signer.getAddress();

    const contract = new ethers.Contract(
      factoryAddress,
      factoryAbi,
      this.signer as unknown as ContractRunner,
    );

    return await contract.predictDeterministicAddress(txData, deployerAddress);
  }

  prepareValveTxData(
    contractDeployment: ContractDeployment,
    data: ValveV1ContractCreatedDto,
  ): ContractDeployment {
    this.logger.debug(`Prepare tx data`);
    let addresses, percentages;
    if (data.recipients) {
      const formatRecipients = valveRecipientsToContractFormat(data.recipients);
      addresses = formatRecipients.addresses;
      percentages = formatRecipients.percentages;
    }
    const distributors = valveDistributorsToContractFormat(data.distributors);
    const creationId = generateCreationId(contractDeployment.id);
    setDataIfDefined(
      contractDeployment,
      'txData',
      'controller',
      data.controller && data.controller.address,
    );
    setDataIfDefined(
      contractDeployment,
      'txData',
      'distributors',
      distributors,
    );
    setDataIfDefined(
      contractDeployment,
      'txData',
      'isImmutableRecipients',
      data.isRecipientsLocked,
    );
    setDataIfDefined(
      contractDeployment,
      'txData',
      'isAutoNativeCurrencyDistribution',
      data.autoNativeCurrencyDistribution,
    );
    setDataIfDefined(
      contractDeployment,
      'txData',
      'minAutoDistributeAmount',
      data.minAutoDistributionAmount &&
        toBigNumber(data.minAutoDistributionAmount).times(1e18).toString(),
    );
    setDataIfDefined(
      contractDeployment,
      'txData',
      'initialRecipients',
      addresses,
    );
    setDataIfDefined(contractDeployment, 'txData', 'percentages', percentages);
    setDataIfDefined(contractDeployment, 'txData', 'creationId', creationId);
    return contractDeployment;
  }

  async createUnsignedTx(
    txData: ValveTxDataDto,
    contractAbi: InterfaceAbi,
    preparedAddress: string,
    address: string,
  ): Promise<RelayerTransactionPayload> {
    this.logger.debug(`Create unsigned tx`);
    const iContract = new Interface(contractAbi);
    const data = iContract.encodeFunctionData('createRSCValve', [
      {
        controller: txData.controller,
        distributors: txData.distributors,
        isImmutableRecipients: txData.isImmutableRecipients,
        isAutoNativeCurrencyDistribution:
          txData.isAutoNativeCurrencyDistribution,
        minAutoDistributeAmount: txData.minAutoDistributeAmount,
        initialRecipients: txData.initialRecipients,
        percentages: txData.percentages,
        creationId: txData.creationId,
      },
    ]);

    const unsignedTx = {
      to: address,
      value: 0,
      data: data,
      speed: 'fast',
    };

    const gasLimit = await this.signer.estimateGas(unsignedTx);
    return {
      to: address,
      value: 0,
      data: data,
      speed: 'fast',
      gasLimit: gasLimit.toString(),
    };
  }

  async createRSCContractByRelay(
    contractAddress: string,
    unsignedTx: RelayerTransactionPayload,
  ): Promise<string> {
    this.logger.debug(`Deploy RSCContract`);
    const tx = await this.relayer.sendTransaction(unsignedTx);
    this.logger.debug(`txHash: ${tx.hash}`);
    this.logger.debug(`Defender transactionId: ${tx.transactionId}`);
    return tx.transactionId;
  }
}
