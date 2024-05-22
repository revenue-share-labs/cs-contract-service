import { ConfigService, ConfigType } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { DefenderService } from './defender.service';
import defenderConfig from '../../common/configs/defender.config';

@Injectable()
export class MumbaiDefenderService extends DefenderService {
  constructor(private readonly configService: ConfigService) {
    const defender =
      configService.get<ConfigType<typeof defenderConfig>>('defender');
    super(
      {
        apiKey: defender.relayKeyMumbai,
        apiSecret: defender.relaySecretMumbai,
      },
      MumbaiDefenderService.name,
    );
  }
}
