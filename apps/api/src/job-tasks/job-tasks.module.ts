import { Module } from '@nestjs/common';
import { JobTasksController } from './job-tasks.controller';
import { JobTasksService } from './job-tasks.service';
import { JobTasksRepository } from './job-tasks.repository';

@Module({
  controllers: [JobTasksController],
  providers: [JobTasksService, JobTasksRepository],
  exports: [JobTasksService],
})
export class JobTasksModule {}
