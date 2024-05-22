import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ApacheAvroSerializer } from './avro.serializer';
import { ConfigType } from '@nestjs/config';
import avroConfig from '../../common/configs/avro.config';
import * as fs from 'fs';
import * as path from 'path';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { ContractDeployFailedRecord } from './records/contract-deploy-failed.record';

@Injectable()
export class ContractDeployFailedSerializer
  extends ApacheAvroSerializer<ContractDeployFailedRecord>
  implements OnModuleInit
{
  constructor(
    @Inject(avroConfig.KEY)
    private avro: ConfigType<typeof avroConfig>,
  ) {
    super(new SchemaRegistry({ host: avro.schemaRegistryHost }));
  }

  async onModuleInit(): Promise<void> {
    const schema = fs.readFileSync(
      path.resolve(global.__basedir + this.avro.contractDeployFailedSchemaPath),
      'utf8',
    );
    this.init(schema);
  }
}
