import { registerAs } from '@nestjs/config';
import { ApacheAvroDeserializer } from '../../services/kafka/deserializers/apache-avro.deserializer';

export default registerAs('kafka', () => ({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: process.env.KAFKA_BROKERS.split(','),
  sslEnabled: process.env.KAFKA_SSL_ENABLED === 'true',
  contractsConsumerGroupId: process.env.KAFKA_CONTRACTS_CONSUMER_GROUP_ID,
  contractsConsumerAllowTopicCreation:
    process.env.KAFKA_CONTRACTS_CONSUMER_ALLOW_TOPIC_CREATION === 'true',
  deserializer: new ApacheAvroDeserializer(
    process.env.KAFKA_SCHEMA_REGISTRY_URL,
  ),
}));
