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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminJobTemplatesController {
  constructor(private readonly jobTemplatesService: JobTemplatesService) {}

  // GET /api/admin/job-templates
  @Get('job-templates')
  async findAll() {
    const templates = await this.jobTemplatesService.adminFindAll();
    return { data: templates, message: 'Success' };
  }

  // GET /api/admin/job-templates/:id
  @Get('job-templates/:id')
  async findOne(@Param('id') id: string) {
    const template = await this.jobTemplatesService.adminFindOne(id);
    return { data: template, message: 'Success' };
  }

  // POST /api/admin/job-templates
  @Post('job-templates')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateJobTemplateDto) {
    const template = await this.jobTemplatesService.adminCreate(dto);
    return { data: template, message: 'System template created' };
  }

  // PATCH /api/admin/job-templates/:id
  @Patch('job-templates/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateJobTemplateDto & { isActive?: boolean },
  ) {
    const template = await this.jobTemplatesService.adminUpdate(id, dto);
    return { data: template, message: 'System template updated' };
  }

  // DELETE /api/admin/job-templates/:id
  @Delete('job-templates/:id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.jobTemplatesService.adminRemove(id);
  }

  // POST /api/admin/job-templates/:templateId/tasks
  @Post('job-templates/:templateId/tasks')
  @HttpCode(HttpStatus.CREATED)
  async createTask(
    @Param('templateId') templateId: string,
    @Body() dto: CreateTemplateTaskDto,
  ) {
    const task = await this.jobTemplatesService.adminCreateTask(templateId, dto);
    return { data: task, message: 'System template task created' };
  }

  // PATCH /api/admin/template-tasks/:id
  @Patch('template-tasks/:id')
  async updateTask(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateTaskDto,
  ) {
    const task = await this.jobTemplatesService.adminUpdateTask(id, dto);
    return { data: task, message: 'System template task updated' };
  }

  // DELETE /api/admin/template-tasks/:id
  @Delete('template-tasks/:id')
  @HttpCode(HttpStatus.OK)
  async removeTask(@Param('id') id: string) {
    return this.jobTemplatesService.adminRemoveTask(id);
  }
}
