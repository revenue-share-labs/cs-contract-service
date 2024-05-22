import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [StorageModule],
  providers: [TasksService],
  exports: [],
})
export class TasksModule {}
