import { PaginationQueryParams } from '../../api/generic/dto';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  CurrencyDto,
  PaginatedContractsSearchDto,
  SearchCurrenciesDto,
} from './dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/services/prisma/prisma.service';

@Injectable()
export class CurrenciesService {
  private readonly logger = new Logger(CurrenciesService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async search(
    query: PaginationQueryParams,
    searchCurrenciesQueryDto: SearchCurrenciesDto,
  ): Promise<PaginatedContractsSearchDto> {
    this.logger.debug(
      `Search currencies request query: ${JSON.stringify(
        query,
      )}, body: ${searchCurrenciesQueryDto}`,
    );

    const args: Prisma.CurrencyFindManyArgs = {
      skip: query.offset,
      take: query.limit,
    };

    if (searchCurrenciesQueryDto.title) {
      args.where = {
        ...args.where,
        title: { in: searchCurrenciesQueryDto.title },
      };
    }
    if (searchCurrenciesQueryDto.chain) {
      args.where = {
        ...args.where,
        locations: { some: { chain: { in: searchCurrenciesQueryDto.chain } } },
      };
    }

    this.logger.debug(
      `Search currencies built query args: ${JSON.stringify(args)}`,
    );

    const total = await this.prismaService.currency.count({
      where: args.where,
    });
    const contracts = await this.prismaService.currency.findMany(args);

    return {
      total: total,
      data: contracts,
    };
  }

  async findOne(id: string): Promise<CurrencyDto> {
    this.logger.debug(`Find currency request: ${id}`);

    let currency: CurrencyDto;
    try {
      currency = await this.prismaService.currency.findFirstOrThrow({
        where: {
          id: id,
        },
      });
    } catch (err) {
      this.logger.debug(
        `Failed to find: ${id} currency. Error: ${err.message}`,
      );
      throw new NotFoundException(`Currency with id: ${id} doesn't exist`);
    }

    return currency;
  }
}
