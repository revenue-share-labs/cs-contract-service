import { PaginatedDefaultResponseDto } from '../../generic/dto';
import { CurrencyDto } from './currency.dto';

export class PaginatedContractsSearchDto extends PaginatedDefaultResponseDto(
  CurrencyDto,
) {}
