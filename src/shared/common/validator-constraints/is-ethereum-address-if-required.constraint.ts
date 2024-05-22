import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import {
  ContractCurrencyDto,
  NativeBlockchainCurrency,
} from '../../../api/contracts/dto';

@ValidatorConstraint({ name: 'isEthereumAddressIfRequired', async: false })
export class IsEthereumAddressIfRequired
  implements ValidatorConstraintInterface
{
  validate(address: string, args: ValidationArguments): boolean {
    const { title } = args.object as ContractCurrencyDto;
    if (
      Object.values(NativeBlockchainCurrency).includes(
        title as NativeBlockchainCurrency,
      )
    ) {
      // Should be null for native currency
      return address === null || address === undefined;
    }

    return /^(0x)?[0-9a-f]{40}$/i.test(address);
  }

  defaultMessage(args: ValidationArguments): string {
    const { title } = args.object as ContractCurrencyDto;
    if (
      Object.values(NativeBlockchainCurrency).includes(
        title as NativeBlockchainCurrency,
      )
    ) {
      return 'Address must be null for native currencies';
    }
    return 'Invalid Ethereum address';
  }
}
