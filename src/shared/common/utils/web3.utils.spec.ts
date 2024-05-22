import BigNumber from 'bignumber.js';
import {
  generateCreationId,
  getContractAbiAndAddress,
  toBigNumber,
  toContractPercent,
  valveDistributorsToContractFormat,
  valveRecipientsToContractFormat,
} from './web3.utils';
import { Chain, ContractType } from '@prisma/client';
import * as factories from '../../../../factories.json';

describe('Web3Util', () => {
  describe('toBigNumber', () => {
    it('should return BigNumber', () => {
      const value = '100';
      const expected = new BigNumber(value);
      expect(toBigNumber(value)).toEqual(expected);
    });
  });
  describe('toContractPercent', () => {
    it('should return percent in variant for contract', () => {
      const value = '100';
      const expected = '10000000';
      expect(toContractPercent(value)).toEqual(expected);
    });
  });
  describe('valveDistributorsToContractFormat', () => {
    it('should return array of addresses', () => {
      expect(
        valveDistributorsToContractFormat([
          { address: '0x1234567890abcdef', name: 'test' },
          { address: '0x0987654321fedcba', name: 'test' },
        ]),
      ).toEqual(['0x1234567890abcdef', '0x0987654321fedcba']);
    });
  });
  describe('valveRecipientsToContractFormat', () => {
    it('should return percents and addresses', () => {
      expect(
        valveRecipientsToContractFormat([
          {
            name: 'Bob',
            address: '0x1234567890abcdef',
            revenue: 50,
          },
          {
            name: 'Bob',
            address: '0x0987654321fedcba',
            revenue: 50,
          },
        ]),
      ).toEqual({
        addresses: ['0x1234567890abcdef', '0x0987654321fedcba'],
        percentages: ['5000000', '5000000'],
      });
    });
  });
  describe('getContractAbiAndAddress', () => {
    it('should return abi and address', () => {
      expect(
        getContractAbiAndAddress(
          Chain.POLYGON_MUMBAI,
          ContractType.VALVE,
          '1.0',
        ),
      ).toEqual({
        abi: JSON.parse(factories[Chain.POLYGON_MUMBAI][0].abi),
        address: factories[Chain.POLYGON_MUMBAI][0].address,
      });
    });
  });
  describe('generateCreationId', () => {
    it('should return Uint8Array', () => {
      expect(generateCreationId('testtesttesttesttesttest')).toBeInstanceOf(
        Uint8Array,
      );
    });
  });
});
