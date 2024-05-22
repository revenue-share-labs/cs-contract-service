import { RolesGuard } from './../../shared/common/auth/roles.guard';
import { Roles } from './../../shared/common/decorators/roles.decorator';
import { JwtGuard } from './../../shared/common/auth/jwt.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiMethodNotAllowedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  PaginatedContractsSearchDto,
  SearchContractsDto as SearchContractsDto,
  ValveV1ContractCreatedDto,
  ValveV1ContractPreparedDto,
  CreatedContractType,
  PreparedContractType,
  PreparedContractsWrappedDtoConfigMap,
  SearchContractsQueryDto,
  PatchContractStatusDto,
  ContractDeploymentDto,
} from './dto';
import { PreparedContractPipe } from '../../shared/common/pipes/prepared-contract.pipe';
import { ApiErrorDto } from '../generic/dto';
import { User } from '../../shared/common/decorators/user.decorator';
import { UserDto, UserRole } from '../../shared/services/user-service/dto';

@Controller()
@ApiBearerAuth()
@ApiTags('contracts')
@ApiExtraModels(ValveV1ContractCreatedDto, ValveV1ContractPreparedDto)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get('/:id')
  @ApiOperation({
    summary: 'Find contract by ID',
    description:
      'This method allows you to get a complete description of the contract fields, if status is DRAFT address will be NULL since the contract has not yet been published on chain',
  })
  @ApiOkResponse({
    schema: {
      oneOf: [{ $ref: getSchemaPath(ValveV1ContractCreatedDto) }],
      discriminator: {
        propertyName: 'type',
        mapping: {
          ValveV1ContractCreatedDto: 'ValveV1ContractCreatedDto',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Contract not found or resource not available',
    type: ApiErrorDto,
  })
  @ApiUnauthorizedResponse({
    type: ApiErrorDto,
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    description: 'Not enough permission to view contract',
    type: ApiErrorDto,
  })
  findOne(
    @Param('id') id: string,
    @User() user: UserDto,
  ): Promise<CreatedContractType> {
    return this.contractsService.findOne(id, user);
  }

  @Post()
  @UsePipes(PreparedContractPipe)
  @ApiOperation({
    summary: 'Create contract',
    description:
      'This method creates contract with status=DRAFT. You can edit it via the API until it is published to the',
  })
  @ApiBody({
    schema: {
      oneOf: [{ $ref: getSchemaPath(ValveV1ContractPreparedDto) }],
      discriminator: {
        propertyName: 'type',
        mapping: {
          ValveV1ContractPreparedDto: 'ValveV1ContractPreparedDto',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    type: ApiErrorDto,
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    description: 'Not enough permission to create contract',
    type: ApiErrorDto,
  })
  @ApiOkResponse({
    schema: {
      oneOf: [{ $ref: getSchemaPath(ValveV1ContractCreatedDto) }],
      discriminator: {
        propertyName: 'type',
        mapping: {
          ValveV1ContractCreatedDto: 'ValveV1ContractCreatedDto',
        },
      },
    },
  })
  create(
    @Body()
    wrappedPreparedContractDto: PreparedContractType,
    @User() user: UserDto,
  ): Promise<CreatedContractType> {
    return this.contractsService.create(
      PreparedContractsWrappedDtoConfigMap[wrappedPreparedContractDto.type][
        wrappedPreparedContractDto.version
      ](wrappedPreparedContractDto),
      user,
    );
  }

  @Put('/:id')
  @UsePipes(PreparedContractPipe)
  @ApiOperation({
    summary: 'Update contract by ID',
    description:
      'This method allows to update contract only if status=DRAFT, otherwise, changing some parameters of the contract is possible only through chain',
  })
  @ApiBody({
    schema: {
      oneOf: [{ $ref: getSchemaPath(ValveV1ContractPreparedDto) }],
      discriminator: {
        propertyName: 'type',
        mapping: {
          ValveV1ContractPreparedDto: 'ValveV1ContractPreparedDto',
        },
      },
    },
  })
  @ApiOkResponse({
    schema: {
      oneOf: [{ $ref: getSchemaPath(ValveV1ContractCreatedDto) }],
      discriminator: {
        propertyName: 'type',
        mapping: {
          ValveV1ContractCreatedDto: 'ValveV1ContractCreatedDto',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Contract not found',
    type: ApiErrorDto,
  })
  @ApiUnauthorizedResponse({
    type: ApiErrorDto,
    description: 'Unauthorized',
  })
  @ApiUnauthorizedResponse({
    type: ApiErrorDto,
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    description: 'Not enough permission to update contract',
    type: ApiErrorDto,
  })
  update(
    @Param('id') id: string,
    @Body()
    wrappedPreparedContractDto: PreparedContractType,
    @User() user: UserDto,
  ): Promise<CreatedContractType> {
    return this.contractsService.update(
      id,
      PreparedContractsWrappedDtoConfigMap[wrappedPreparedContractDto.type][
        wrappedPreparedContractDto.version
      ](wrappedPreparedContractDto),
      user,
    );
  }

  @Patch('/:id/status')
  @ApiOperation({
    summary: 'Patch contract status by ID',
    description: 'This method allows to patch contract status',
  })
  @ApiOkResponse({
    schema: {
      oneOf: [{ $ref: getSchemaPath(ValveV1ContractCreatedDto) }],
      discriminator: {
        propertyName: 'type',
        mapping: {
          ValveV1ContractCreatedDto: 'ValveV1ContractCreatedDto',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Contract not found',
    type: ApiErrorDto,
  })
  @ApiUnauthorizedResponse({
    type: ApiErrorDto,
    description: 'Unauthorized',
  })
  @ApiUnauthorizedResponse({
    type: ApiErrorDto,
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    description: 'Not enough permission to update contract',
    type: ApiErrorDto,
  })
  patchStatus(
    @Param('id') id: string,
    @Body()
    patchContractStatusDto: PatchContractStatusDto,
    @User() user: UserDto,
  ): Promise<CreatedContractType> {
    return this.contractsService.patchStatus(id, patchContractStatusDto, user);
  }

  @Delete('/:id')
  @ApiOperation({
    summary: 'Delete contract by ID',
    description: 'This method allows to delete contract only if status=DRAFT',
  })
  @ApiOkResponse()
  @ApiNotFoundResponse({
    description: 'Contract not found',
    type: ApiErrorDto,
  })
  @ApiUnauthorizedResponse({
    type: ApiErrorDto,
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    description: 'Not enough permission to remove contract',
    type: ApiErrorDto,
  })
  @ApiMethodNotAllowedResponse({
    description:
      'Contract DRAFT has been already published and it is immutable',
    type: ApiErrorDto,
  })
  remove(@Param('id') id: string, @User() user: UserDto): Promise<void> {
    return this.contractsService.remove(id, user);
  }

  @Post('/search')
  @ApiOperation({ summary: 'Get contracts by parameters' })
  @ApiResponse({
    status: 200,
    type: PaginatedContractsSearchDto,
  })
  @ApiUnauthorizedResponse({
    type: ApiErrorDto,
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    description: 'Not enough permission to search contracts',
    type: ApiErrorDto,
  })
  search(
    @Query() query: SearchContractsQueryDto,
    @Body() searchContractsDto: SearchContractsDto,
    @User() user: UserDto,
  ): Promise<PaginatedContractsSearchDto> {
    return this.contractsService.search(query, searchContractsDto, user);
  }

  @Post('/:id/deployment/platform')
  @ApiOperation({
    summary: 'Deploy contract by ID with platform strategy',
    description:
      'This method allows to deploy contract with internal deployment engine, only accessible for role=PARTNER',
  })
  @ApiOkResponse({
    type: ContractDeploymentDto,
  })
  @ApiUnauthorizedResponse({
    type: ApiErrorDto,
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    description: 'Not enough permission to deploy contract',
    type: ApiErrorDto,
  })
  @ApiMethodNotAllowedResponse({
    description: 'Contract is publishing right now',
    type: ApiErrorDto,
  })
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  createContractDeploymentWithPlatformStrategy(
    @Param('id') id: string,
    @User() user: UserDto,
  ): Promise<ContractDeploymentDto> {
    return this.contractsService.createContractDeploymentWithPlatformStrategy(
      id,
      user,
    );
  }

  @Get('/:id/deployment/active')
  @ApiOperation({
    summary: 'Get active contract deployment by ID',
  })
  @ApiOkResponse({
    type: ContractDeploymentDto,
  })
  @ApiUnauthorizedResponse({
    type: ApiErrorDto,
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    description: 'Not enough permission to deploy contract',
    type: ApiErrorDto,
  })
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  getActiveContractDeployment(
    @Param('id') id: string,
    @User() user: UserDto,
  ): Promise<ContractDeploymentDto> {
    return this.contractsService.getActiveContractDeployment(id, user);
  }
}
