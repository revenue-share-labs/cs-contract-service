import { registerAs } from '@nestjs/config';

export default registerAs('avro', () => ({
  schemaRegistryHost: process.env.AVRO_SCHEMA_REGISTRY,
  contractDeployFailedSchemaPath:
    process.env.AVRO_CONTRACT_DEPLOY_FAILED_SCHEMA_PATH,
  contractDeployedSchemaPath: process.env.AVRO_CONTRACT_DEPLOYED_SCHEMA_PATH,
}));
