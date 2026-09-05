import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobTemplate, TemplateTask, Prisma, JobTemplateScope } from '@prisma/client';

@Injectable()
export class JobTemplatesRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────
  // Find all active templates accessible by a user (SYSTEM + user's own)
  // ─────────────────────────────────────────────────────────────────
  async findAllByUser(userId: string): Promise<JobTemplate[]> {
    return this.prisma.jobTemplate.findMany({
      where: {
        deletedAt: null,
        OR: [
          { scope: JobTemplateScope.SYSTEM, isActive: true },
          { scope: JobTemplateScope.USER, ownerId: userId },
        ],
      },
      include: {
        _count: { select: { templateTasks: { where: { deletedAt: null } } } },
      },
      orderBy: [{ scope: 'asc' }, { name: 'asc' }],
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Admin: Find all system templates (including inactive ones)
  // ─────────────────────────────────────────────────────────────────
  async findAllSystemTemplates(): Promise<JobTemplate[]> {
    return this.prisma.jobTemplate.findMany({
      where: { scope: JobTemplateScope.SYSTEM, deletedAt: null },
      include: {
        _count: { select: { templateTasks: { where: { deletedAt: null } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Find one active template by id
  // ─────────────────────────────────────────────────────────────────
  async findById(id: string): Promise<(JobTemplate & { templateTasks: TemplateTask[] }) | null> {
    return this.prisma.jobTemplate.findFirst({
      where: { id, deletedAt: null },
      include: {
        templateTasks: {
          where: { deletedAt: null },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Create template
  // ─────────────────────────────────────────────────────────────────
  async create(data: Prisma.JobTemplateCreateInput): Promise<JobTemplate> {
    return this.prisma.jobTemplate.create({ data });
  }

  // ─────────────────────────────────────────────────────────────────
  // Update template fields
  // ─────────────────────────────────────────────────────────────────
  async update(id: string, data: Prisma.JobTemplateUpdateInput): Promise<JobTemplate> {
    return this.prisma.jobTemplate.update({ where: { id }, data });
  }

  // ─────────────────────────────────────────────────────────────────
  // Soft delete template
  // ─────────────────────────────────────────────────────────────────
  async softDelete(id: string): Promise<void> {
    await this.prisma.jobTemplate.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Copy template: clones template and its templateTasks for a user
  // ─────────────────────────────────────────────────────────────────
  async copyTemplate(
    sourceTemplate: JobTemplate & { templateTasks: TemplateTask[] },
    userId: string,
  ): Promise<JobTemplate & { templateTasks: TemplateTask[] }> {
    return this.prisma.$transaction(async (tx) => {
      const newTemplate = await tx.jobTemplate.create({
        data: {
          name: `${sourceTemplate.name} (Bản sao)`,
          description: sourceTemplate.description,
          jobType: sourceTemplate.jobType,
          scope: JobTemplateScope.USER,
          owner: { connect: { id: userId } },
          isActive: true,
        },
      });

      if (sourceTemplate.templateTasks && sourceTemplate.templateTasks.length > 0) {
        await tx.templateTask.createMany({
          data: sourceTemplate.templateTasks.map((tt) => ({
            templateId: newTemplate.id,
            title: tt.title,
            description: tt.description,
            order: tt.order,
            daysBeforePost: tt.daysBeforePost,
            isRequired: tt.isRequired,
          })),
        });
      }

      return tx.jobTemplate.findUniqueOrThrow({
        where: { id: newTemplate.id },
        include: {
          templateTasks: {
            where: { deletedAt: null },
            orderBy: { order: 'asc' },
          },
        },
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // TEMPLATE TASKS — find one
  // ─────────────────────────────────────────────────────────────────
  async findTaskById(
    taskId: string,
  ): Promise<(TemplateTask & { template: { ownerId: string | null; scope: JobTemplateScope } }) | null> {
    return this.prisma.templateTask.findFirst({
      where: { id: taskId, deletedAt: null },
      include: { template: { select: { ownerId: true, scope: true } } },
    }) as any;
  }

  // ─────────────────────────────────────────────────────────────────
  // Create template task
  // ─────────────────────────────────────────────────────────────────
  async createTask(data: Prisma.TemplateTaskCreateInput): Promise<TemplateTask> {
    return this.prisma.templateTask.create({ data });
  }

  // ─────────────────────────────────────────────────────────────────
  // Update template task
  // ─────────────────────────────────────────────────────────────────
  async updateTask(taskId: string, data: Prisma.TemplateTaskUpdateInput): Promise<TemplateTask> {
    return this.prisma.templateTask.update({ where: { id: taskId }, data });
  }

  // ─────────────────────────────────────────────────────────────────
  // Soft delete template task
  // ─────────────────────────────────────────────────────────────────
  async softDeleteTask(taskId: string): Promise<void> {
    await this.prisma.templateTask.update({
      where: { id: taskId },
      data: { deletedAt: new Date() },
    });
  }
}
