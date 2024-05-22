import { CurrenciesService } from './currencies.service';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  CurrencyDto,
  PaginatedContractsSearchDto,
  SearchCurrenciesDto as SearchCurrenciesDto,
} from './dto';
import { ApiErrorDto, PaginationQueryParams } from '../generic/dto';

@Controller('currencies')
@ApiBearerAuth()
@ApiTags('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get('/:id')
  @ApiOperation({
    summary: 'Find currency by ID',
    description:
      'This method allows you to get a complete description about the currency',
  })
  @ApiOkResponse({
    type: CurrencyDto,
  })
  @ApiNotFoundResponse({
    description: 'Currency not found',
    type: ApiErrorDto,
  })
  @ApiUnauthorizedResponse({
    type: ApiErrorDto,
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    description: 'Not enough permission to view currency',
    type: ApiErrorDto,
  })
  findOne(@Param('id') id: string): Promise<CurrencyDto> {
    return this.currenciesService.findOne(id);
  }

  @Post('search')
  @ApiOperation({ summary: 'Get currencies by parameters' })
  @ApiOkResponse({
    type: PaginatedContractsSearchDto,
  })
  @ApiUnauthorizedResponse({
    type: ApiErrorDto,
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    description: 'Not enough permission to search currencies',
    type: ApiErrorDto,
  })
  search(
    @Query() query: PaginationQueryParams,
    @Body() searchCurrenciesDto: SearchCurrenciesDto,
  ): Promise<PaginatedContractsSearchDto> {
    return this.currenciesService.search(query, searchCurrenciesDto);
  }
}
