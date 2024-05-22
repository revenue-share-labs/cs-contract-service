import { UserServiceModule } from './shared/services/user-service/user-service.module';
import { AuthModule } from './shared/common/auth/auth.module';
import { DefaultFilter } from './shared/common/filters/default.filter';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ContractsModule } from './api/contracts/contracts.module';

import baseConfig from './shared/common/configs/base.config';
import swaggerConfig from './shared/common/configs/swagger.config';
import { PrismaModule } from './shared/services/prisma/prisma.module';
import { CurrenciesModule } from './api/currencies/currencies.module';
import corsConfig from './shared/common/configs/cors.config';
import kafkaConfig from './shared/common/configs/kafka.config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './shared/common/auth/jwt.guard';
import { TasksModule } from './shared/services/tasks/tasks.module';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthModule } from './shared/services/health/health.module';
import { KafkaModule } from './shared/services/kafka/kafka.module';
import { AvroModule } from './shared/services/avro/avro.module';
import avroConfig from './shared/common/configs/avro.config';
import { Web3Module } from './shared/services/web3/web3.module';
import { DefenderModule } from './shared/services/defender/defender.module';
import defenderConfig from './shared/common/configs/defender.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        baseConfig,
        swaggerConfig,
        corsConfig,
        kafkaConfig,
        avroConfig,
        defenderConfig,
      ],
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? `/etc/conf/contract-svc/.${process.env.NODE_ENV}.env`
          : `.${process.env.NODE_ENV}.env`,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    ContractsModule,
    CurrenciesModule,
    AuthModule,
    UserServiceModule,
    TasksModule,
    HealthModule,
    KafkaModule,
    AvroModule,
    Web3Module,
    DefenderModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: DefaultFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    {
      provide: 'JWT_SECRET',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<string> =>
        configService.get<string>('INTERNAL_JWT_SECRET'),
    },
  ],
})
export class AppModule {}
