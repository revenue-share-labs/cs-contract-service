import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StorageModule } from '../storage/storage.module';
import { UserServiceService } from './user-service.service';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get('USER_SERVICE_URL'),
        timeout: +configService.get('AXIOS_TIMEOUT'),
      }),
      inject: [ConfigService],
    }),
    StorageModule,
  ],
  exports: [UserServiceService],
  providers: [UserServiceService],
})
export class UserServiceModule {}
