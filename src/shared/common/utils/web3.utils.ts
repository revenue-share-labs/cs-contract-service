import BigNumber from 'bignumber.js';
import { ethers, InterfaceAbi } from 'ethers';
import {
  ContractAnonymousUserDto,
  ValveV1RecipientDto,
} from '../../../api/contracts/dto';
import { Chain, ContractType } from '@prisma/client';
import * as factories from '../../../../factories.json';

export enum Chains {
  'ETHEREUM' = '1',
  'ETHEREUM_GOERLI' = '5',
  'POLYGON' = '137',
  'POLYGON_MUMBAI' = '80001',
}

export type BigNumberLike = ethers.BigNumberish | number | string | BigNumber;

export function toBigNumber(value: BigNumberLike): BigNumber {
  return new BigNumber(value.toString());
}

export function toContractPercent(value: BigNumberLike): string {
  return toBigNumber(value).times(100000).decimalPlaces(0).toString();
}

export function valveDistributorsToContractFormat(
  distributors: ContractAnonymousUserDto[],
): string[] {
  return distributors && distributors.length
    ? distributors.map((distributor) => distributor.address)
    : [];
}

export function valveRecipientsToContractFormat(
  recipients: ValveV1RecipientDto[],
): { addresses: string[]; percentages: string[] } {
  const { addresses, percentages, addedPercentage } = recipients.reduce<{
    addresses: string[];
    percentages: string[];
    addedPercentage: BigNumber;
  }>(
    ({ addresses, percentages, addedPercentage }, item) => {
      const percentage = toBigNumber(item.revenue);
      if (percentage.lte(0)) {
        return { addresses, percentages, addedPercentage };
      }

      return {
        addresses: [...addresses, item.address],
        percentages: [...percentages, toContractPercent(percentage)],
        addedPercentage: addedPercentage.plus(percentage),
      };
    },
    { addresses: [], percentages: [], addedPercentage: BigNumber(0) },
  );

  if (addedPercentage.gt(100)) {
    throw new Error(
      `Total percentage is greater than 100% : (${addedPercentage.toFixed(
        2,
      )}%)`,
    );
  }

  return { addresses, percentages };
}

export interface Factory {
  readonly name: string;
  readonly address: string;
  readonly version: string;
  readonly abi: string;
}

export function getContractAbiAndAddress(
  chain: Chain,
  contractType: ContractType,
  version: string,
): { abi: InterfaceAbi; address: string } {
  const currentFactories: Factory[] = factories[chain];
  const currenFactory: Factory = currentFactories.filter(
    (factory) => factory.name === contractType && factory.version === version,
  )[0];
  return { abi: JSON.parse(currenFactory.abi), address: currenFactory.address };
}

export function generateCreationId(id: string): Uint8Array {
  const buf = new ArrayBuffer(id.length * 2); // 2 bytes for each char
  const bufView = new Uint8Array(buf, 0, 32);
  for (let i = 0, strLen = id.length; i < strLen; i++) {
    bufView[i] = id.charCodeAt(i);
  }
  return bufView;
}
