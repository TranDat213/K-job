import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JobTasksRepository } from './job-tasks.repository';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class JobTasksService {
  constructor(private readonly jobTasksRepository: JobTasksRepository) {}

  // ─────────────────────────────────────────────────────────────────
  // Ownership guards
  // ─────────────────────────────────────────────────────────────────
  private async assertJobOwner(userId: string, jobId: string) {
    const job = await this.jobTasksRepository.findJobOwner(jobId);
    if (!job) throw new NotFoundException('Job not found');
    if (job.userId !== userId) throw new ForbiddenException('Access denied');
  }

  private async assertTaskOwner(userId: string, taskId: string) {
    const task = await this.jobTasksRepository.findTaskWithOwner(taskId);
    if (!task) throw new NotFoundException('Task not found');
    if (task.job.userId !== userId) throw new ForbiddenException('Access denied');
    return task;
  }

  // ─────────────────────────────────────────────────────────────────
  // FIND ALL tasks for a job
  // ─────────────────────────────────────────────────────────────────
  async findAll(userId: string, jobId: string) {
    await this.assertJobOwner(userId, jobId);
    return this.jobTasksRepository.findAllByJob(jobId);
  }

  // ─────────────────────────────────────────────────────────────────
  // CREATE task
  // ─────────────────────────────────────────────────────────────────
  async create(userId: string, jobId: string, dto: CreateTaskDto) {
    await this.assertJobOwner(userId, jobId);
    return this.jobTasksRepository.create({
      job: { connect: { id: jobId } },
      title: dto.title,
      description: dto.description,
      status: dto.status ?? TaskStatus.TODO,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      order: dto.order ?? 0,
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // UPDATE task  — completedAt business logic
  // ─────────────────────────────────────────────────────────────────
  async update(userId: string, taskId: string, dto: UpdateTaskDto) {
    const task = await this.assertTaskOwner(userId, taskId);

    let completedAt: Date | null | undefined = undefined;
    if (dto.status === TaskStatus.COMPLETED && !task.completedAt) {
      completedAt = new Date();
    } else if (dto.status && dto.status !== TaskStatus.COMPLETED && task.completedAt) {
      completedAt = null; // reopen — clear completedAt
    }

    return this.jobTasksRepository.update(taskId, {
      title: dto.title,
      description: dto.description,
      status: dto.status,
      order: dto.order,
      dueDate: dto.dueDate !== undefined ? new Date(dto.dueDate) : undefined,
      completedAt,
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // REMOVE  — soft delete
  // ─────────────────────────────────────────────────────────────────
  async remove(userId: string, taskId: string) {
    await this.assertTaskOwner(userId, taskId);
    await this.jobTasksRepository.softDelete(taskId);
    return { message: 'Task deleted' };
  }
}
