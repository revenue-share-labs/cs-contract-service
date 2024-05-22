import {
  Contract,
  ContractParticipant,
  Chain,
  ContractType,
  ContractVisibility,
  ContractStatus,
  ContractParticipantIdentifierType,
} from '@prisma/client';
import { unwrapRawContractToCreatedContract } from './contracts.util';
import {
  CreatedContractType,
  ValveV1DistributionType,
} from '../../../api/contracts/dto';

describe('ContractsUtil', () => {
  it('unwrapCreatedContractMetadata should return valid object', () => {
    const mockDate = new Date();
    const mockContract: Contract & {
      participants: ContractParticipant[];
    } = {
      id: 'abc123',
      author: 'id',
      owner: '0x1',
      title: 'My Contract',
      description: 'Donald Trump',
      version: '1.0',
      legalAgreementUrl: 'https://exmaple.com',
      visualizationUrl: 'https://exmaple.com',
      address: '0x7fdb908AA02D3a1f8b7f9D882EA67B68Ab355dc1',
      chain: Chain.ETHEREUM,
      type: ContractType.VALVE,
      visibility: ContractVisibility.PRIVATE,
      status: ContractStatus.DRAFT,
      metadata: {
        controller: {
          name: 'controller',
          address: '0x29E3B4F8aAF6F890f847095fc2b30c7a60B90142',
        },
        recipients: [
          {
            name: 'ASD',
            address: '123',
            revenue: 100,
          },
        ],
        distribution: 'AUTO',
        distributors: [
          {
            name: 'distributor',
            address: '0x29E3B4F8aAF6F890f847095fc2b30c7a60B90142',
          },
        ],
        autoNativeCurrencyDistribution: true,
        currencies: [
          {
            title: null,
            address: 'test address',
          },
        ],
      },
      createdAt: mockDate,
      updatedAt: mockDate,
      publishedAt: mockDate,
      v: 0,
      participants: [
        {
          id: 'abc435',
          identifier: 'id',
          identifierType: ContractParticipantIdentifierType.ID,
          role: 'AUTHOR',
          contractId: 'abc123',
          createdAt: mockDate,
          updatedAt: mockDate,
        },
      ],
    };
    const expectedCreatedContractType: CreatedContractType = {
      id: 'abc123',
      author: 'id',
      owner: { address: '0x1', revenue: 0 },
      title: 'My Contract',
      description: 'Donald Trump',
      version: '1.0',
      address: '0x7fdb908AA02D3a1f8b7f9D882EA67B68Ab355dc1',
      chain: Chain.ETHEREUM,
      type: ContractType.VALVE,
      visibility: ContractVisibility.PRIVATE,
      status: ContractStatus.DRAFT,
      legalAgreementUrl: 'https://exmaple.com',
      visualizationUrl: 'https://exmaple.com',
      controller: {
        name: 'controller',
        address: '0x29E3B4F8aAF6F890f847095fc2b30c7a60B90142',
      },
      recipients: [
        {
          name: 'ASD',
          address: '123',
          revenue: 100,
        },
      ],
      distribution: ValveV1DistributionType.AUTO,
      distributors: [
        {
          name: 'distributor',
          address: '0x29E3B4F8aAF6F890f847095fc2b30c7a60B90142',
        },
      ],
      autoNativeCurrencyDistribution: true,
      currencies: [
        {
          title: null,
          address: 'test address',
        },
      ],
      createdAt: mockDate,
      updatedAt: mockDate,
      publishedAt: mockDate,
    };

    const result = unwrapRawContractToCreatedContract(mockContract);

    expect(result).toEqual(expectedCreatedContractType);
  });
});
