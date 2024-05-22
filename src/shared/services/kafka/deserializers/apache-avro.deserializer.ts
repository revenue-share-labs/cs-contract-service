import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { ConsumerDeserializer, IncomingEvent } from '@nestjs/microservices';
import { KafkaMessage } from '@nestjs/microservices/external/kafka.interface';
import { IHeaders } from 'kafkajs';

export interface KafkaConnectMessage {
  key: Buffer | null;
  value: string | null;
  timestamp: string;
  attributes: number;
  offset: string;
  size: number;
  headers?: IHeaders;
}

export class ApacheAvroDeserializer implements ConsumerDeserializer {
  private registry: SchemaRegistry;

  constructor(host: string) {
    this.registry = new SchemaRegistry({ host });
  }

  async deserialize(
    value: KafkaMessage | KafkaConnectMessage,
    options?: Record<string, unknown>,
  ): Promise<IncomingEvent> {
    if (typeof value.value !== 'string') {
      const decoded = await this.registry.decode(value.value);
      return {
        pattern: options['channel'],
        data: decoded,
      };
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const obj = JSON.parse(JSON.parse(value.value));
      const buffer = Buffer.from(obj.fullDocument.record.$binary, 'base64');
      const decoded = await this.registry.decode(buffer);
      return {
        pattern: options['channel'],
        data: decoded,
      };
    }
  }
}
