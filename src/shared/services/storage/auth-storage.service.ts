import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthStorageService {
  private readonly logger = new Logger(AuthStorageService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.getServiceJwt();
  }

  public serviceJwt = '';

  public async getServiceJwt(): Promise<void> {
    try {
      this.logger.log('Trying to updated serviceJwt');
      const { data } = await this.httpService.axiosRef.get(
        '/token/' + this.configService.get('SERVICE_NAME'),
      );
      this.serviceJwt = data.token;
      this.logger.log(`Service token was updated: ${this.serviceJwt}`);
    } catch (err) {
      this.logger.error('Unable to update service token', err);
      setTimeout(() => this.getServiceJwt(), 5000);
    }
  }
}
