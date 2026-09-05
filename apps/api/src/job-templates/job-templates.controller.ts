import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JobTemplatesService } from './job-templates.service';
import { CreateJobTemplateDto } from './dto/create-job-template.dto';
import { UpdateJobTemplateDto } from './dto/update-job-template.dto';
import { CreateTemplateTaskDto } from './dto/create-template-task.dto';
import { UpdateTemplateTaskDto } from './dto/update-template-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class JobTemplatesController {
  constructor(private readonly jobTemplatesService: JobTemplatesService) {}

  // GET /api/job-templates
  @Get('job-templates')
  async findAll(@CurrentUser() user: { id: string }) {
    const templates = await this.jobTemplatesService.findAll(user.id);
    return { data: templates, message: 'Success' };
  }

  // GET /api/job-templates/:id
  @Get('job-templates/:id')
  async findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    const template = await this.jobTemplatesService.findOne(user.id, id);
    return { data: template, message: 'Success' };
  }

  // POST /api/job-templates
  @Post('job-templates')
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: { id: string }, @Body() dto: CreateJobTemplateDto) {
    const template = await this.jobTemplatesService.create(user.id, dto);
    return { data: template, message: 'Template created' };
  }

  // PATCH /api/job-templates/:id
  @Patch('job-templates/:id')
  async update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateJobTemplateDto,
  ) {
    const template = await this.jobTemplatesService.update(user.id, id, dto);
    return { data: template, message: 'Template updated' };
  }

  // DELETE /api/job-templates/:id
  @Delete('job-templates/:id')
  @HttpCode(HttpStatus.OK)
  async remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.jobTemplatesService.remove(user.id, id);
  }

  // POST /api/job-templates/:id/copy
  @Post('job-templates/:id/copy')
  @HttpCode(HttpStatus.CREATED)
  async copy(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    const template = await this.jobTemplatesService.copy(user.id, id);
    return { data: template, message: 'Template copied successfully' };
  }

  // ─── Template Tasks ──────────────────────────────────────────────

  // POST /api/job-templates/:templateId/tasks
  @Post('job-templates/:templateId/tasks')
  @HttpCode(HttpStatus.CREATED)
  async createTask(
    @CurrentUser() user: { id: string },
    @Param('templateId') templateId: string,
    @Body() dto: CreateTemplateTaskDto,
  ) {
    const task = await this.jobTemplatesService.createTask(user.id, templateId, dto);
    return { data: task, message: 'Template task created' };
  }

  // PATCH /api/template-tasks/:id
  @Patch('template-tasks/:id')
  async updateTask(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateTemplateTaskDto,
  ) {
    const task = await this.jobTemplatesService.updateTask(user.id, id, dto);
    return { data: task, message: 'Template task updated' };
  }

  // DELETE /api/template-tasks/:id
  @Delete('template-tasks/:id')
  @HttpCode(HttpStatus.OK)
  async removeTask(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.jobTemplatesService.removeTask(user.id, id);
  }
}
