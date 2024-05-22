import { ContractsController } from './contracts.controller';
import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';

@Module({
  controllers: [ContractsController],
  providers: [ContractsService],
})
export class ContractsModule {}
