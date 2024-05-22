import { Global, Module } from '@nestjs/common';
import { PreparedContractPipe } from './prepared-contract.pipe';

@Global()
@Module({
  providers: [PreparedContractPipe],
  exports: [PreparedContractPipe],
})
export class PipesModule {}
