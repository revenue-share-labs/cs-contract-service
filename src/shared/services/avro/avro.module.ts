import { Global, Module } from '@nestjs/common';
import { ContractDeployedSerializer } from './contract-deployed.serializer';
import { ContractDeployFailedSerializer } from './contract-deploy-failed.serializer';

@Global()
@Module({
  providers: [ContractDeployedSerializer, ContractDeployFailedSerializer],
  exports: [ContractDeployedSerializer, ContractDeployFailedSerializer],
})
export class AvroModule {}
