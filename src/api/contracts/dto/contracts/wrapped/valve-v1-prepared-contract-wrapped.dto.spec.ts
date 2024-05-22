/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  ContractType,
  Chain,
  ContractVisibility,
  ContractStatus,
  ContractParticipantIdentifierType,
} from '@prisma/client';
import {
  ValveV1ContractPreparedDto,
  ValveV1DistributionType,
} from '../types/valve/valve-v1-prepared-contract.dto';
import { ValveV1ContractPreparedWrappedDto } from './valve-v1-prepared-contract-wrapped.dto';
import {
  ContractCreateUpdateType,
  ContractParticipantCreateUpdateType,
} from '../../../contracts.service';

describe('ValveV1ContractPreparedWrappedDto', () => {
  function buildContractSchema(
    status: ContractStatus,
    publishedAt: jest.Expect,
    address: string,
  ): void {
    const mockValveV1ContractPreparedDto: ValveV1ContractPreparedDto = {
      title: 'Example Contract',
      version: '1.0',
      description: 'Donald Trump',
      legalAgreementUrl: 'https://exmaple.com',
      visualizationUrl: 'https://exmaple.com',
      type: ContractType.VALVE,
      chain: Chain.ETHEREUM,
      visibility: ContractVisibility.PRIVATE,
      isRecipientsLocked: true,
      immutableController: true,
      status,
      address,
      distributors: [
        {
          name: 'distributor',
          address: '0x29E3B4F8aAF6F890f847095fc2b30c7a60B90142',
        },
      ],
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

    const valveV1ContractPreparedWrappedDto =
      new ValveV1ContractPreparedWrappedDto(mockValveV1ContractPreparedDto);

    const expectedContract: ContractCreateUpdateType = {
      author: 'id',
      owner: '0x29E3B4F8aAF6F890f847095fc2b30c7a60B90142',
      title: 'Example Contract',
      description: 'Donald Trump',
      version: '1.0',
      legalAgreementUrl: 'https://exmaple.com',
      visualizationUrl: 'https://exmaple.com',
      chain: Chain.ETHEREUM,
      type: ContractType.VALVE,
      visibility: ContractVisibility.PRIVATE,
      status,
      //@ts-ignore
      publishedAt,
      address,
      metadata: {
        isRecipientsLocked: true,
        immutableController: true,
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
        distributors: [
          {
            name: 'distributor',
            address: '0x29E3B4F8aAF6F890f847095fc2b30c7a60B90142',
          },
        ],
        distribution: ValveV1DistributionType.AUTO,
        autoNativeCurrencyDistribution: true,
        minAutoDistributionAmount: 100,
      },
    };

    expect(
      valveV1ContractPreparedWrappedDto.buildContractSchema(
        'id',
        '0x29E3B4F8aAF6F890f847095fc2b30c7a60B90142',
        ContractStatus.DRAFT,
      ),
    ).toStrictEqual(expectedContract);
  }

  it('should fail on invalid address', () => {
    const mockValveV1ContractPreparedDto: ValveV1ContractPreparedDto = {
      title: 'Example Contract',
      version: '1.0',
      description: 'Donald Trump',
      legalAgreementUrl: 'https://exmaple.com',
      visualizationUrl: 'https://exmaple.com',
      type: ContractType.VALVE,
      chain: Chain.ETHEREUM,
      visibility: ContractVisibility.PRIVATE,
      isRecipientsLocked: true,
      immutableController: true,
      status: ContractStatus.DRAFT,
      address: '0x231',
      distributors: [
        {
          name: 'distributor',
          address: '0x29E3B4F8aAF6F890f847095fc2b30c7a60B90142',
        },
      ],
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

    expect(() => {
      new ValveV1ContractPreparedWrappedDto(mockValveV1ContractPreparedDto);
    }).toThrow(Error);
  });

  describe('buildContractSchema', () => {
    it('should buildContractSchema for DRAFT status', () => {
      buildContractSchema(ContractStatus.DRAFT, null, null);
    });

    it('should buildContractSchema for PENDING status', () => {
      buildContractSchema(ContractStatus.PENDING, null, null);
    });

    it('should buildContractSchema for PUBLISHED status', () => {
      buildContractSchema(
        ContractStatus.PUBLISHED,
        expect.any(Date),
        '0x29E3B4F8aAF6F890f847095fc2b30c7a60B90142',
      );
    });

    it('should buildContractSchema with only required params', () => {
      const mockValveV1ContractPreparedDto: ValveV1ContractPreparedDto = {
        title: 'Example Contract',
        version: '1.0',
        type: ContractType.VALVE,
      };
      const expectedContract: ContractCreateUpdateType = {
        author: 'id',
        owner: '0x29E3B4F8aAF6F890f847095fc2b30c7a60B90142',
        title: 'Example Contract',
        description: undefined,
        version: '1.0',
        chain: undefined,
        type: ContractType.VALVE,
        visibility: ContractVisibility.PRIVATE,
        status: ContractStatus.DRAFT,
        publishedAt: null,
        address: null,
        legalAgreementUrl: undefined,
        visualizationUrl: undefined,
        metadata: {},
      };
      const valveV1ContractPreparedWrappedDto =
        new ValveV1ContractPreparedWrappedDto(mockValveV1ContractPreparedDto);

      expect(
        valveV1ContractPreparedWrappedDto.buildContractSchema(
          'id',
          '0x29E3B4F8aAF6F890f847095fc2b30c7a60B90142',
          ContractStatus.DRAFT,
        ),
      ).toStrictEqual(expectedContract);
    });
  });

  describe('buildContractParticipantsSchema', () => {
    it('should buildContractParticipantsSchema', () => {
      const mockValveV1ContractPreparedDto: ValveV1ContractPreparedDto = {
        title: 'Example Contract',
        version: '1.0',
        description: 'Donald Trump',
        type: ContractType.VALVE,
        chain: Chain.ETHEREUM,
        visibility: ContractVisibility.PRIVATE,
        status: ContractStatus.DRAFT,
        legalAgreementUrl: 'https://exmaple.com',
        visualizationUrl: 'https://exmaple.com',
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

      const valveV1ContractPreparedWrappedDto =
        new ValveV1ContractPreparedWrappedDto(mockValveV1ContractPreparedDto);

      const expectedParticipants: ContractParticipantCreateUpdateType[] = [
        {
          contractId: 'id2',
          identifier: '0x29E3B4F8aAF6F890f847095fc2b30c7a60B90142',
          identifierType: ContractParticipantIdentifierType.ADDRESS,
          role: 'OWNER',
        },
        {
          contractId: 'id2',
          identifier: 'id1',
          identifierType: ContractParticipantIdentifierType.ID,
          role: 'AUTHOR',
        },
        {
          contractId: 'id2',
          identifier: '0x7fdb908AA02D3a1f8b7f9D882EA67B68Ab355dc1',
          identifierType: ContractParticipantIdentifierType.ADDRESS,
          role: 'RECIPIENT',
        },
        {
          contractId: 'id2',
          identifier: '0x7fdb908AA02D3a1f8b7f9D882EA67B68Ab355dc1',
          identifierType: ContractParticipantIdentifierType.ADDRESS,
          role: 'RECIPIENT',
        },
      ];

      expect(
        valveV1ContractPreparedWrappedDto.buildContractParticipantsSchema(
          'id1',
          '0x29E3B4F8aAF6F890f847095fc2b30c7a60B90142',
          'id2',
        ),
      ).toStrictEqual(expectedParticipants);
    });
  });
});
