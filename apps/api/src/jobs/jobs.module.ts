import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobsRepository } from './jobs.repository';
import { JobsExcelService } from './jobs.excel.service';

@Module({
  controllers: [JobsController],
  providers: [JobsService, JobsRepository, JobsExcelService],
  exports: [JobsService],
})
export class JobsModule {}
