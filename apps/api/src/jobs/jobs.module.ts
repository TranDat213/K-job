import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobsRepository } from './jobs.repository';

@Module({
  controllers: [JobsController],
  providers: [JobsService, JobsRepository],
  exports: [JobsService],
})
export class JobsModule {}
