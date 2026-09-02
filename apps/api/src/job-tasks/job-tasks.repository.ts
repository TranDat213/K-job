import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobTask, Prisma } from '@prisma/client';

type TaskWithJobOwner = JobTask & { job: { userId: string } };

@Injectable()
export class JobTasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────
  // Find job owner (for ownership assertion)
  // ─────────────────────────────────────────────────────────────────
  async findJobOwner(jobId: string): Promise<{ userId: string } | null> {
    return this.prisma.job.findFirst({
      where: { id: jobId, deletedAt: null },
      select: { userId: true },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Find task with its job's userId (for ownership assertion)
  // ─────────────────────────────────────────────────────────────────
  async findTaskWithOwner(taskId: string): Promise<TaskWithJobOwner | null> {
    return this.prisma.jobTask.findFirst({
      where: { id: taskId, deletedAt: null },
      include: { job: { select: { userId: true } } },
    }) as any;
  }

  // ─────────────────────────────────────────────────────────────────
  // Find all active tasks for a job ordered by position
  // ─────────────────────────────────────────────────────────────────
  async findAllByJob(jobId: string): Promise<JobTask[]> {
    return this.prisma.jobTask.findMany({
      where: { jobId, deletedAt: null },
      orderBy: { order: 'asc' },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Create task
  // ─────────────────────────────────────────────────────────────────
  async create(data: Prisma.JobTaskCreateInput): Promise<JobTask> {
    return this.prisma.jobTask.create({ data });
  }

  // ─────────────────────────────────────────────────────────────────
  // Update task
  // ─────────────────────────────────────────────────────────────────
  async update(id: string, data: Prisma.JobTaskUpdateInput): Promise<JobTask> {
    return this.prisma.jobTask.update({ where: { id }, data });
  }

  // ─────────────────────────────────────────────────────────────────
  // Soft delete
  // ─────────────────────────────────────────────────────────────────
  async softDelete(id: string): Promise<void> {
    await this.prisma.jobTask.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
