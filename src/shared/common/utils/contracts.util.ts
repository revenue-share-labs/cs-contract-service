import { Contract, ContractDeployment } from '@prisma/client';
import { omit } from 'lodash';
import { CreatedContractType } from '../../../api/contracts/dto';

export function unwrapRawContractToCreatedContract(
  wrappedCreatedContract: Contract,
): CreatedContractType {
  const data = omit(
    wrappedCreatedContract,
    'metadata',
    'mentionedMetadataWallets',
    'v',
    'owner',
    'participants',
  );
  const metadata = omit(wrappedCreatedContract.metadata as object);
  const owner = { address: wrappedCreatedContract.owner, revenue: 0 };

  const unwrappedCreatedContract: unknown = {
    ...data,
    ...metadata,
    owner,
  };

  return unwrappedCreatedContract as CreatedContractType;
}

export function setDataIfDefined(
  contract: ContractDeployment,
  field: string,
  key: string,
  value: unknown,
): void {
  if (value !== undefined && value !== null) {
    contract[field][key] = value;
  }
}
