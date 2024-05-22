import {
  Chain,
  Contract,
  ContractStatus,
  ContractType,
  ContractVisibility,
} from '@prisma/client';
import {
  ValveV1ContractPreparedDto,
  ValveV1DistributionType,
} from '../types/valve/valve-v1-prepared-contract.dto';
import { ValveV1ContractPreparedWrappedDto } from './valve-v1-prepared-contract-wrapped.dto';

describe('WrappablePreparedContract', () => {
  describe('buildUpdateContractSchema', () => {
    const mockValveV1ContractPreparedDto: ValveV1ContractPreparedDto = {
      title: 'Example Contract',
      version: '1.0',
      description: 'Donald Trump',
      legalAgreementUrl: 'https://exmaple.com',
      visualizationUrl: 'https://exmaple.com',
      type: ContractType.VALVE,
      recipients: [
        {
          name: 'Bob',
          address: '0x7fdb908AA02D3a1f8b7f9D882EA67B68Ab355dc1',
          revenue: 50,
        },
        {
          name: 'Bob',
          address: '0x7fdb908AA02D3a1f8b7f9D882EA67B68Ab355dc1',
          revenue: 50,
        },
      ],
      distribution: ValveV1DistributionType.AUTO,
      autoNativeCurrencyDistribution: true,
      minAutoDistributionAmount: 100,
    };
    const mockDate = new Date();
    const mockUpdatingContract: Contract = {
      id: 'abc123',
      author: 'id',
      owner: '0x1',
      title: 'My Contract',
      legalAgreementUrl: 'https://exmaple.com',
      visualizationUrl: 'https://exmaple.com',
      description: 'Donald Trump',
      version: '1.0',
      address: '0x7fdb908AA02D3a1f8b7f9D882EA67B68Ab355dc1',
      chain: Chain.ETHEREUM,
      type: ContractType.VALVE,
      visibility: ContractVisibility.PRIVATE,
      status: ContractStatus.DRAFT,
      metadata: {},
      createdAt: mockDate,
      updatedAt: mockDate,
      publishedAt: mockDate,
      v: 0,
    };

    const valveV1ContractPreparedWrappedDto =
      new ValveV1ContractPreparedWrappedDto(mockValveV1ContractPreparedDto);

    it('should return a ContractCreateUpdateType object when given valid input', () => {
      const updateInitiatorRoles = ['OWNER'];

      expect(
        valveV1ContractPreparedWrappedDto.buildUpdateContractSchema(
          updateInitiatorRoles,
          mockUpdatingContract,
          'id',
          '0x1',
        ),
      ).toBeInstanceOf(Object);
    });

    it('should throw an error when given invalid input', () => {
      const updateInitiatorRoles = ['RECIPIENT'];

      expect(() =>
        valveV1ContractPreparedWrappedDto.buildUpdateContractSchema(
          updateInitiatorRoles,
          mockUpdatingContract,
          'id',
          '0x1',
        ),
      ).toThrowError('Insufficient rights to update the contract');
    });
  });
});
