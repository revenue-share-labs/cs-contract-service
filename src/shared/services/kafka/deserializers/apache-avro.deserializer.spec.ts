import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import {
  ApacheAvroDeserializer,
  KafkaConnectMessage,
} from './apache-avro.deserializer';
import { mockDeep } from 'jest-mock-extended';

describe('ApacheAvroDeserializer', () => {
  it('SchemaRegistry should be defined correctly', () => {
    const mockHost = 'http://localhost:8081';
    const apacheAvroDeserializer = new ApacheAvroDeserializer(mockHost);
    const expectedRegistry = new SchemaRegistry({ host: mockHost });

    expect(apacheAvroDeserializer['registry']['api']['_manifest'].host).toEqual(
      expectedRegistry['api']['_manifest'].host,
    );
  });

  //TODO: fix connection to SchemaRegistry

  // it('decode from kafka connect correctly', async () => {
  //   const mockSchemaRegistry = mockDeep<SchemaRegistry>();
  //   const value: KafkaConnectMessage = {
  //     key: Buffer.from('123'),
  //     value:
  //       '"{\\"txnNumber\\": {\\"$numberLong\\": \\"3\\"}, \\"lsid\\": {\\"id\\": {\\"$binary\\": \\"/QpNOZKpREm2aHwCLByGxQ==\\", \\"$type\\": \\"04\\"}, \\"uid\\": {\\"$binary\\": \\"ddqot68vLpBUPnOuqFj2cdClv/dv/vF9ZVSwknYHEsE=\\", \\"$type\\": \\"00\\"}}, \\"_id\\": {\\"_data\\": \\"82645E2D67000000222B022C01002B026E5A10047D0B2B0015604549A9517011E36760D346645F69640064645E2D676E1370358CA3F3BA0004\\"}, \\"operationType\\": \\"insert\\", \\"clusterTime\\": {\\"$timestamp\\": {\\"t\\": 1683893607, \\"i\\": 34}}, \\"wallTime\\": {\\"$date\\": 1683893607883}, \\"fullDocument\\": {\\"_id\\": {\\"$oid\\": \\"645e2d676e1370358ca3f3ba\\"}, \\"record\\": {\\"$binary\\": \\"AAAAAAOEATB4ZjNmN2ZjN2FkMTQ1YTlkMDM0NTIyODk1OTZhYTJiYzdkMDFmM2MyMzE5NzhhNzM1YzE3ZTQ5MWUzYTZmMjI2ZEgyNTNjOWRhNS1mMzUyLTRmNDAtYTUxYy0wM2M1MjYxNDIzMjEK\\", \\"$type\\": \\"00\\"}, \\"relayerTransactionId\\": {\\"$oid\\": \\"645e1c23bad37e0bb685c3e1\\"}}, \\"ns\\": {\\"db\\": \\"web3-monitoring\\", \\"coll\\": \\"RelayerTransactionAvroRecord\\"}, \\"documentKey\\": {\\"_id\\": {\\"$oid\\": \\"645e2d676e1370358ca3f3ba\\"}}}"',
  //     timestamp: Date.now().toString(),
  //     attributes: 0,
  //     offset: '0',
  //     size: 0,
  //     headers: {},
  //   };
  //   const mockHost = 'http://localhost:8081';
  //   const apacheAvroDeserializer = new ApacheAvroDeserializer(mockHost);
  //   const spyRegister = jest.spyOn(mockSchemaRegistry, 'decode');
  //   expect(
  //     await apacheAvroDeserializer.deserialize(value, { channel: 'test' }),
  //   ).toEqual({
  //     data: {
  //       hash: '0xf3f7fc7ad145a9d03452289596aa2bc7d01f3c231978a735c17e491e3a6f226d',
  //       transactionId: '253c9da5-f352-4f40-a51c-03c526142321',
  //       status: 'CONFIRMED',
  //     },
  //     pattern: 'test',
  //   });
  // });
});
