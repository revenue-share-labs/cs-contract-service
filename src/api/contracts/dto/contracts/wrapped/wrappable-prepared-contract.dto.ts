import { isEqual } from 'lodash';
import { unwrapRawContractToCreatedContract } from '../../../../../shared/common/utils';
import { Contract, ContractStatus } from '@prisma/client';
import {
  ContractCreateUpdateType,
  ContractParticipantCreateUpdateType,
} from '../../../contracts.service';
import { PreparedContractType } from '../..';

export type RoleType = string | number | symbol;
export type RolesAllowedFieldsToUpdateConfigMapType<Roles extends RoleType> = {
  [index in Roles]: { [index in ContractStatus]: string[] };
};

export abstract class WrappablePreparedContract<
  T extends PreparedContractType,
> {
  private readonly rolesAllowedFieldsToUpdateConfigMap: RolesAllowedFieldsToUpdateConfigMapType<RoleType>;
  readonly preparedContract: T;

  constructor(
    rolesAllowedFieldsToUpdateConfigMap: RolesAllowedFieldsToUpdateConfigMapType<RoleType>,
    preparedContract: T,
    handleRolesAllowedFieldsToUpdateConfigMap?: (
      preparedContract: PreparedContractType,
      rolesAllowedFieldsToUpdateConfigMap: RolesAllowedFieldsToUpdateConfigMapType<RoleType>,
    ) => RolesAllowedFieldsToUpdateConfigMapType<RoleType>,
  ) {
    if (handleRolesAllowedFieldsToUpdateConfigMap) {
      this.rolesAllowedFieldsToUpdateConfigMap =
        handleRolesAllowedFieldsToUpdateConfigMap(
          preparedContract,
          rolesAllowedFieldsToUpdateConfigMap,
        );
    } else {
      this.rolesAllowedFieldsToUpdateConfigMap =
        rolesAllowedFieldsToUpdateConfigMap;
    }
    this.preparedContract = this.transformFields(preparedContract);
  }

  buildCreateContractSchema(
    author: string,
    owner: string,
  ): ContractCreateUpdateType {
    return this.buildContractSchema(author, owner, ContractStatus.DRAFT);
  }

  buildUpdateContractSchema(
    updateInitiatorRoles: string[],
    updatingContract: Contract,
    authorId: string,
    ownerId: string | null,
  ): ContractCreateUpdateType {
    if (
      this.validateUpdateContractSchemaPermissions(
        updateInitiatorRoles,
        updatingContract,
      )
    ) {
      return this.buildContractSchema(
        authorId,
        ownerId,
        updatingContract.status,
      );
    } else {
      throw new Error('Insufficient rights to update the contract');
    }
  }

  protected abstract transformFields(preparedContract: T): T;

  abstract buildContractParticipantsSchema(
    authorId: string,
    ownerId: string,
    contractId: string,
  ): ContractParticipantCreateUpdateType[];

  abstract buildContractSchema(
    author: string,
    owner: string,
    status: ContractStatus,
  ): ContractCreateUpdateType;

  private validateUpdateContractSchemaPermissions(
    initiatorRoles: string[],
    updatingContract: Contract,
  ): boolean {
    const unwrappedUpdatingContract =
      unwrapRawContractToCreatedContract(updatingContract);
    const thisEntries = Object.entries(this.preparedContract);

    const allowedFieldsToUpdate = [];
    initiatorRoles.forEach((initiatorRole) =>
      allowedFieldsToUpdate.push(
        ...this.rolesAllowedFieldsToUpdateConfigMap[initiatorRole][
          updatingContract.status
        ],
      ),
    );

    if (!allowedFieldsToUpdate.length) {
      return false;
    }

    const uniqueAllowedFieldsToUpdate = [...new Set(allowedFieldsToUpdate)];

    for (const [key, val] of thisEntries) {
      if (
        !isEqual(val, unwrappedUpdatingContract[key]) &&
        !uniqueAllowedFieldsToUpdate.includes(key)
      ) {
        return false;
      }
    }

    return true;
  }
}
