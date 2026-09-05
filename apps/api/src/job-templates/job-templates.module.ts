import { Module } from '@nestjs/common';
import { JobTemplatesController } from './job-templates.controller';
import { AdminJobTemplatesController } from './admin-job-templates.controller';
import { JobTemplatesService } from './job-templates.service';
import { JobTemplatesRepository } from './job-templates.repository';

@Module({
  controllers: [JobTemplatesController, AdminJobTemplatesController],
  providers: [JobTemplatesService, JobTemplatesRepository],
  exports: [JobTemplatesService],
})
export class JobTemplatesModule {}
