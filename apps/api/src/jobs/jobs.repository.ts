import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Job, Prisma, TaskStatus } from '@prisma/client';
import { JobsQuery } from './jobs.service';

@Injectable()
export class JobsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────
  // Find paginated jobs — filterable
  // ─────────────────────────────────────────────────────────────────
  async findAll(userId: string, query: JobsQuery) {
    const { page = 1, limit = 20, status, brandId, search } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.JobWhereInput = {
      userId,
      deletedAt: null,
      ...(status && { status }),
      ...(brandId && { brandId }),
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
    };

    const [total, jobs] = await this.prisma.$transaction([
      this.prisma.job.count({ where }),
      this.prisma.job.findMany({
        where,
        include: {
          brand: { select: { id: true, name: true } },
          _count: { select: { tasks: { where: { deletedAt: null } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return { data: jobs, meta: { page, limit, total } };
  }

  // ─────────────────────────────────────────────────────────────────
  // Find one job with related data (no ownership check)
  // ─────────────────────────────────────────────────────────────────
  async findById(id: string) {
    return this.prisma.job.findFirst({
      where: { id, deletedAt: null },
      include: {
        brand: true,
        template: { select: { id: true, name: true } },
        tasks: { where: { deletedAt: null }, orderBy: { order: 'asc' } },
        payments: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
        notes: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Validate brand belongs to user
  // ─────────────────────────────────────────────────────────────────
  async findBrandForUser(brandId: string, userId: string) {
    return this.prisma.brand.findFirst({
      where: { id: brandId, userId, deletedAt: null },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Validate template belongs to user
  // ─────────────────────────────────────────────────────────────────
  async findTemplateForUser(templateId: string, userId: string) {
    return this.prisma.jobTemplate.findFirst({
      where: { id: templateId, userId, deletedAt: null },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Create job + auto-generate tasks from template in a transaction
  // ─────────────────────────────────────────────────────────────────
  async createWithTasks(
    jobData: Prisma.JobCreateInput,
    templateId: string | undefined,
    postDate: Date | undefined,
  ): Promise<Job> {
    return this.prisma.$transaction(async (tx) => {
      const job = await tx.job.create({ data: jobData });

      if (templateId && postDate) {
        const templateTasks = await tx.templateTask.findMany({
          where: { templateId, deletedAt: null },
          orderBy: { order: 'asc' },
        });

        if (templateTasks.length > 0) {
          await tx.jobTask.createMany({
            data: templateTasks.map((tt) => {
              const dueDate = new Date(postDate);
              dueDate.setDate(dueDate.getDate() - tt.daysBeforePost);
              return {
                jobId: job.id,
                title: tt.title,
                description: tt.description,
                order: tt.order,
                status: TaskStatus.TODO,
                dueDate,
              };
            }),
          });
        }
      }

      return job;
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Update job fields
  // ─────────────────────────────────────────────────────────────────
  async update(id: string, data: Prisma.JobUpdateInput) {
    return this.prisma.job.update({
      where: { id },
      data,
      include: { brand: { select: { id: true, name: true } } },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Soft delete
  // ─────────────────────────────────────────────────────────────────
  async softDelete(id: string): Promise<void> {
    await this.prisma.job.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
