import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JobsService, JobsQuery } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JobStatus } from '@prisma/client';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // GET /api/jobs?page=1&limit=20&status=NEW&brandId=...&search=...
  @Get()
  async findAll(
    @CurrentUser() user: { id: string },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: JobStatus,
    @Query('brandId') brandId?: string,
    @Query('search') search?: string,
  ) {
    const query: JobsQuery = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      status,
      brandId,
      search,
    };
    return this.jobsService.findAll(user.id, query);
  }

  // GET /api/jobs/:id
  @Get(':id')
  async findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    const job = await this.jobsService.findOne(user.id, id);
    return { data: job, message: 'Success' };
  }

  // POST /api/jobs
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: { id: string }, @Body() dto: CreateJobDto) {
    const job = await this.jobsService.create(user.id, dto);
    return { data: job, message: 'Job created' };
  }

  // PATCH /api/jobs/:id
  @Patch(':id')
  async update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateJobDto,
  ) {
    const job = await this.jobsService.update(user.id, id, dto);
    return { data: job, message: 'Job updated' };
  }

  // DELETE /api/jobs/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.jobsService.remove(user.id, id);
  }
}
