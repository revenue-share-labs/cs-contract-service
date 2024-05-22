import { ValveV1ContractCreatedDto } from './contracts/types/valve/valve-v1-created-contract.dto';
import { ValveV1ContractPreparedDto } from './contracts/types/valve/valve-v1-prepared-contract.dto';
import { ValveV1ContractPreparedWrappedDto } from './contracts/wrapped/valve-v1-prepared-contract-wrapped.dto';

export * from './common/contract-anonymous-user.dto';
export * from './common/contract-currency.dto';
export * from './common/paginated-contracts-search.dto';
export * from './common/search.dto';
export * from './common/contract-common-details.dto';
export * from './contracts/types/valve/valve-v1-contract-owner.dto';
export * from './contracts/types/valve/valve-v1-recipient.dto';
export * from './contracts/types/valve/valve-v1-prepared-contract.dto';
export * from './contracts/types/valve/valve-v1-created-contract.dto';
export * from './common/search-query.dto';
export * from './contracts/wrapped/valve-v1-prepared-contract-wrapped.dto';
export * from './contracts/wrapped/wrappable-prepared-contract.dto';
export * from './common/patch-contract-status.dto';
export * from './common/contract-deployment.dto';

export const PreparedContractsDtoConfigMap = {
  VALVE: {
    '1.0': ValveV1ContractPreparedDto,
  },
};

export const PreparedContractsWrappedDtoConfigMap = {
  VALVE: {
    '1.0': (
      valveV1ContractPreparedDto: ValveV1ContractPreparedDto,
    ): ValveV1ContractPreparedWrappedDto => {
      return new ValveV1ContractPreparedWrappedDto(valveV1ContractPreparedDto);
    },
  },
};

export type CreatedContractType = ValveV1ContractCreatedDto;
export type PreparedContractType = ValveV1ContractPreparedDto;
