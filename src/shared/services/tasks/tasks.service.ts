import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AuthStorageService } from '../storage/auth-storage.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private authStorageService: AuthStorageService) {}

  @Cron('*/45 * * * *')
  async handleCron(): Promise<void> {
    this.logger.log('Launching handleCron');
    await this.authStorageService.getServiceJwt();
  }
}
