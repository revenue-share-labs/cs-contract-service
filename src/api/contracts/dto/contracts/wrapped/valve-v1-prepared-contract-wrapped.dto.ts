import { ConsumerDeserializer } from '@nestjs/microservices';
import {
  ContractStatus,
  ContractParticipantIdentifierType,
  ContractVisibility,
} from '@prisma/client';
import {
  ContractCreateUpdateType,
  ContractParticipantCreateUpdateType,
} from '../../../contracts.service';
import { ValveV1ContractPreparedDto } from '../types/valve/valve-v1-prepared-contract.dto';
import {
  RolesAllowedFieldsToUpdateConfigMapType,
  WrappablePreparedContract,
} from './wrappable-prepared-contract.dto';
import { getUtcDate } from '../../../../../shared/common/utils/date.util';
import { toChecksumAddress } from 'web3-utils';
import { cloneDeep } from 'lodash';

export enum ValveV1ParticipantRole {
  AUTHOR = 'AUTHOR',
  OWNER = 'OWNER',
  RECIPIENT = 'RECIPIENT',
  CONTROLLER = 'CONTROLLER',
  DISTRIBUTOR = 'DISTRIBUTOR',
}

const title = 'title';
const description = 'description';
const chain = 'chain';
const status = 'status';
const address = 'address';
const immutableController = 'immutableController';
const visibility = 'visibility';
const controller = 'controller';
const distributors = 'distributors';
const currencies = 'currencies';
const isRecipientsLocked = 'isRecipientsLocked';
const recipients = 'recipients';
const distribution = 'distribution';
const autoNativeCurrencyDistribution = 'autoNativeCurrencyDistribution';
const minAutoDistributionAmount = 'minAutoDistributionAmount';
const legalAgreementUrl = 'legalAgreementUrl';
const visualizationUrl = 'visualizationUrl';

const rolesAllowedFieldsToUpdateConfigMap: RolesAllowedFieldsToUpdateConfigMapType<ValveV1ParticipantRole> =
  {
    AUTHOR: {
      DRAFT: [
        title,
        description,
        chain,
        immutableController,
        visibility,
        controller,
        distributors,
        currencies,
        isRecipientsLocked,
        recipients,
        distribution,
        autoNativeCurrencyDistribution,
        minAutoDistributionAmount,
        legalAgreementUrl,
        visualizationUrl,
      ],
      PUBLISHED: [
        title,
        description,
        visibility,
        legalAgreementUrl,
        visualizationUrl,
      ],
      PENDING: [
        title,
        description,
        visibility,
        legalAgreementUrl,
        visualizationUrl,
      ],
    },
    OWNER: {
      DRAFT: [
        title,
        description,
        chain,
        status,
        address,
        immutableController,
        visibility,
        controller,
        distributors,
        currencies,
        isRecipientsLocked,
        recipients,
        distribution,
        autoNativeCurrencyDistribution,
        minAutoDistributionAmount,
        legalAgreementUrl,
        visualizationUrl,
      ],
      PUBLISHED: [
        title,
        description,
        status,
        visibility,
        distribution,
        controller,
        isRecipientsLocked,
        distributors,
        legalAgreementUrl,
        visualizationUrl,
      ],
      PENDING: [
        title,
        description,
        status,
        address,
        visibility,
        distribution,
        controller,
        isRecipientsLocked,
        distributors,
        legalAgreementUrl,
        visualizationUrl,
      ],
    },
    RECIPIENT: { DRAFT: [], PUBLISHED: [], PENDING: [] },
    CONTROLLER: { DRAFT: [], PUBLISHED: [], PENDING: [] },
    DISTRIBUTOR: { DRAFT: [], PUBLISHED: [], PENDING: [] },
  };

function handleRolesAllowedFieldsToUpdateConfigMap(
  valveV1ContractPreparedDto: ValveV1ContractPreparedDto,
  rolesAllowedFieldsToUpdateConfigMap: RolesAllowedFieldsToUpdateConfigMapType<ValveV1ParticipantRole>,
): RolesAllowedFieldsToUpdateConfigMapType<ValveV1ParticipantRole> {
  if (!valveV1ContractPreparedDto.isRecipientsLocked) {
    rolesAllowedFieldsToUpdateConfigMap.CONTROLLER.PENDING.push(recipients);
    rolesAllowedFieldsToUpdateConfigMap.CONTROLLER.PUBLISHED.push(recipients);
  }

  return rolesAllowedFieldsToUpdateConfigMap;
}

// TODO: move to utils when there will be more than one contracts version
function setMetadataIfDefined(
  contract: ContractCreateUpdateType,
  key: string,
  value: unknown,
): void {
  if (value !== undefined && value !== null) {
    contract.metadata[key] = value;
  }
}

export class ValveV1ContractPreparedWrappedDto extends WrappablePreparedContract<ValveV1ContractPreparedDto> {
  constructor(valveV1ContractPreparedDto: ValveV1ContractPreparedDto) {
    super(
      rolesAllowedFieldsToUpdateConfigMap,
      valveV1ContractPreparedDto,
      handleRolesAllowedFieldsToUpdateConfigMap,
    );
  }

  protected transformFields(
    preparedContract: ValveV1ContractPreparedDto,
  ): ValveV1ContractPreparedDto {
    const {
      title,
      description,
      version,
      chain,
      type,
      visibility,
      status: preparedDtoStatus,
      immutableController,
      isRecipientsLocked,
      distribution,
      autoNativeCurrencyDistribution,
      minAutoDistributionAmount,
      legalAgreementUrl,
      visualizationUrl,
    } = preparedContract;

    let { address, distributors, currencies, recipients, controller } =
      cloneDeep(preparedContract);

    if (address) {
      address = toChecksumAddress(address);
    }
    if (controller) {
      controller = {
        name: controller.name,
        address: toChecksumAddress(controller.address),
      };
    }
    if (recipients) {
      recipients = recipients.map((recipient) => {
        return {
          name: recipient.name,
          address: toChecksumAddress(recipient.address),
          revenue: recipient.revenue,
        };
      });
    }
    if (distributors) {
      distributors = distributors.map((distributor) => {
        return {
          name: distributor.name,
          address: toChecksumAddress(distributor.address),
        };
      });
    }
    if (currencies) {
      currencies = currencies.map((currency) => {
        return {
          title: currency.title,
          address:
            currency.address === null || currency.address === undefined
              ? null
              : toChecksumAddress(currency.address),
        };
      });
    }

    return {
      title,
      description,
      version,
      address,
      chain,
      type,
      visibility,
      status: preparedDtoStatus,
      controller,
      immutableController,
      recipients,
      isRecipientsLocked,
      distribution,
      distributors,
      autoNativeCurrencyDistribution,
      minAutoDistributionAmount,
      currencies,
      legalAgreementUrl,
      visualizationUrl,
    };
  }

  // TODO: resolve contract address
  buildContractSchema(
    author: string,
    owner: string,
    status: ContractStatus,
  ): ContractCreateUpdateType {
    const {
      title,
      description,
      version,
      address,
      chain,
      type,
      visibility,
      status: preparedDtoStatus,
      controller,
      immutableController,
      recipients,
      isRecipientsLocked,
      distribution,
      distributors,
      autoNativeCurrencyDistribution,
      minAutoDistributionAmount,
      currencies,
      legalAgreementUrl,
      visualizationUrl,
    } = this.preparedContract;

    const contract: ContractCreateUpdateType = {
      author,
      owner,
      title,
      description,
      version,
      legalAgreementUrl,
      visualizationUrl,
      address: preparedDtoStatus === ContractStatus.PUBLISHED ? address : null,
      chain,
      type,
      visibility: visibility ?? ContractVisibility.PRIVATE,
      status: preparedDtoStatus ?? status,
      metadata: {},
      publishedAt:
        preparedDtoStatus === ContractStatus.PUBLISHED ? getUtcDate() : null,
    };

    setMetadataIfDefined(contract, 'controller', controller);
    setMetadataIfDefined(contract, 'immutableController', immutableController);
    setMetadataIfDefined(contract, 'recipients', recipients);
    setMetadataIfDefined(contract, 'isRecipientsLocked', isRecipientsLocked);
    setMetadataIfDefined(contract, 'distribution', distribution);
    setMetadataIfDefined(contract, 'distributors', distributors);
    setMetadataIfDefined(
      contract,
      'autoNativeCurrencyDistribution',
      autoNativeCurrencyDistribution,
    );
    setMetadataIfDefined(
      contract,
      'minAutoDistributionAmount',
      minAutoDistributionAmount,
    );
    setMetadataIfDefined(contract, 'currencies', currencies);

    return contract;
  }

  buildContractParticipantsSchema(
    authorId: string,
    ownerId: string,
    contractId: string,
  ): ContractParticipantCreateUpdateType[] {
    const author: ContractParticipantCreateUpdateType = {
      identifier: authorId,
      identifierType: ContractParticipantIdentifierType.ID,
      role: ValveV1ParticipantRole.AUTHOR,
      contractId,
    };

    let result: ContractParticipantCreateUpdateType[] = [author];

    if (ownerId) {
      const owner: ContractParticipantCreateUpdateType = {
        identifier: ownerId,
        identifierType: ContractParticipantIdentifierType.ADDRESS,
        role: ValveV1ParticipantRole.OWNER,
        contractId,
      };
      result = [owner, ...result];
    }

    const { recipients, controller, distributors } = this.preparedContract;

    if (recipients) {
      const recipientList: ContractParticipantCreateUpdateType[] = recipients
        .filter((recipient) => recipient.address !== '')
        .map((recipient) => ({
          identifier: recipient.address,
          identifierType: ContractParticipantIdentifierType.ADDRESS,
          role: ValveV1ParticipantRole.RECIPIENT,
          contractId,
        }));
      result = [...result, ...recipientList];
    }

    if (controller?.address) {
      const controllerParticipant: ContractParticipantCreateUpdateType = {
        identifier: controller.address,
        identifierType: ContractParticipantIdentifierType.ADDRESS,
        role: ValveV1ParticipantRole.CONTROLLER,
        contractId,
      };
      result = [...result, controllerParticipant];
    }

    if (distributors) {
      distributors.forEach((distributors) => {
        const distributorsParticipant: ContractParticipantCreateUpdateType = {
          identifier: distributors.address,
          identifierType: ContractParticipantIdentifierType.ADDRESS,
          role: ValveV1ParticipantRole.DISTRIBUTOR,
          contractId,
        };
        result = [...result, distributorsParticipant];
      });
    }

    return result;
  }
}
