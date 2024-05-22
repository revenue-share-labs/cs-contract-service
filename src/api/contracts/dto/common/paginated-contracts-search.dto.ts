import { PaginatedDefaultResponseDto } from '../../../generic/dto';
import { ContractCommonDetailsDto } from './contract-common-details.dto';

export class PaginatedContractsSearchDto extends PaginatedDefaultResponseDto(
  ContractCommonDetailsDto,
) {}
