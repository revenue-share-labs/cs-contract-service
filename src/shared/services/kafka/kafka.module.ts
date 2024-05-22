import kafkaConfig from '../../common/configs/kafka.config';
import { Module } from '@nestjs/common';
import { ContractsConsumer } from './consumers/contracts.consumer';
import { ClientsModule, Transport, KafkaOptions } from '@nestjs/microservices';
import { ConfigType } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'CONTRACTS_KAFKA_CLIENT',
        inject: [kafkaConfig.KEY],
        useFactory: async (
          kafka: ConfigType<typeof kafkaConfig>,
        ): Promise<KafkaOptions> => ({
          transport: Transport.KAFKA,
          options: {
            consumer: {
              groupId: kafka.contractsConsumerGroupId,
              allowAutoTopicCreation: kafka.contractsConsumerAllowTopicCreation,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [ContractsConsumer],
})
export class KafkaModule {}
