import { ValidationArguments } from 'class-validator';
import { IsEthereumAddressIfRequired } from './is-ethereum-address-if-required.constraint';
import {
  NativeBlockchainCurrency,
  ContractCurrencyDto,
} from '../../../api/contracts/dto';

describe('IsEthereumAddressIfRequired', () => {
  let isEthereumAddressIfRequired: IsEthereumAddressIfRequired;

  beforeEach(() => {
    isEthereumAddressIfRequired = new IsEthereumAddressIfRequired();
  });

  it('should return true if address is null and currency is native', () => {
    const validationArgs: ValidationArguments = {
      object: {
        title: NativeBlockchainCurrency.ETH,
      } as ContractCurrencyDto,
      value: null,
      constraints: [],
      targetName: '',
      property: '',
    };

    expect(isEthereumAddressIfRequired.validate(null, validationArgs)).toBe(
      true,
    );
  });

  it('should return false if address is not null and currency is native', () => {
    const validationArgs: ValidationArguments = {
      object: {
        title: NativeBlockchainCurrency.ETH,
      } as ContractCurrencyDto,
      value: '0x1234567890abcdef',
      constraints: [],
      targetName: '',
      property: '',
    };

    expect(
      isEthereumAddressIfRequired.validate(
        '0x1234567890abcdef',
        validationArgs,
      ),
    ).toBe(false);
  });

  it('should return true if address is valid and currency is not native', () => {
    const validationArgs: ValidationArguments = {
      object: { title: 'NonNativeCurrency' } as ContractCurrencyDto,
      value: '0x1234567890abcdef1234567890abcdef12345678',
      constraints: [],
      targetName: '',
      property: '',
    };

    expect(
      isEthereumAddressIfRequired.validate(
        '0x1234567890abcdef1234567890abcdef12345678',
        validationArgs,
      ),
    ).toBe(true);
  });

  it('should return false if address is not valid and currency is not native', () => {
    const validationArgs: ValidationArguments = {
      object: { title: 'NonNativeCurrency' } as ContractCurrencyDto,
      value: 'invalid_address',
      constraints: [],
      targetName: '',
      property: '',
    };

    expect(
      isEthereumAddressIfRequired.validate('invalid_address', validationArgs),
    ).toBe(false);
  });

  it('should return appropriate message if address is not valid', () => {
    const validationArgsNative: ValidationArguments = {
      object: {
        title: NativeBlockchainCurrency.ETH,
      } as ContractCurrencyDto,
      value: '0x1234567890abcdef',
      constraints: [],
      targetName: '',
      property: '',
    };
    const validationArgsNonNative: ValidationArguments = {
      object: { title: 'NonNativeCurrency' } as ContractCurrencyDto,
      value: 'invalid_address',
      constraints: [],
      targetName: '',
      property: '',
    };

    expect(
      isEthereumAddressIfRequired.defaultMessage(validationArgsNative),
    ).toBe('Address must be null for native currencies');
    expect(
      isEthereumAddressIfRequired.defaultMessage(validationArgsNonNative),
    ).toBe('Invalid Ethereum address');
  });
});
