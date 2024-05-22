import { Global, Module } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { JwtGuard } from './jwt.guard';
import { ConfigService } from '@nestjs/config';
import { RolesGuard } from './roles.guard';

@Global()
@Module({
  providers: [
    JwtStrategy,
    JwtGuard,
    RolesGuard,
    ConfigService,
    {
      provide: 'JWT_SECRET',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService): Promise<string> =>
        configService.get<string>('INTERNAL_JWT_SECRET'),
    },
  ],
  exports: [JwtStrategy, JwtGuard, RolesGuard],
})
export class AuthModule {}
