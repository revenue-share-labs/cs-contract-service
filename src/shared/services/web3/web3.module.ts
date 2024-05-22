import { Global, Module } from '@nestjs/common';
import { EvmService } from './evm.service';

@Global()
@Module({
  providers: [EvmService],
  exports: [EvmService],
})
export class Web3Module {}
