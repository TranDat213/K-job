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
import { JobTasksService } from './job-tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class JobTasksController {
  constructor(private readonly jobTasksService: JobTasksService) {}

  // GET /api/jobs/:jobId/tasks
  @Get('jobs/:jobId/tasks')
  async findAll(
    @CurrentUser() user: { id: string },
    @Param('jobId') jobId: string,
  ) {
    const tasks = await this.jobTasksService.findAll(user.id, jobId);
    return { data: tasks, message: 'Success' };
  }

  // POST /api/jobs/:jobId/tasks
  @Post('jobs/:jobId/tasks')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: { id: string },
    @Param('jobId') jobId: string,
    @Body() dto: CreateTaskDto,
  ) {
    const task = await this.jobTasksService.create(user.id, jobId, dto);
    return { data: task, message: 'Task created' };
  }

  // PATCH /api/tasks/:id
  @Patch('tasks/:id')
  async update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const task = await this.jobTasksService.update(user.id, id, dto);
    return { data: task, message: 'Task updated' };
  }

  // DELETE /api/tasks/:id
  @Delete('tasks/:id')
  @HttpCode(HttpStatus.OK)
  async remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.jobTasksService.remove(user.id, id);
  }
}
