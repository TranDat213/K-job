import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Job, Prisma, TaskStatus, JobStatus } from '@prisma/client';
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
        template: { select: { id: true, name: true, scope: true } },
        tasks: { where: { deletedAt: null }, orderBy: { order: 'asc' } },
        payments: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
        notes: {
          where: { deletedAt: null },
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
        },
        attachments: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
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
  // Validate template is accessible to user (Active SYSTEM or owned USER)
  // ─────────────────────────────────────────────────────────────────
  async findTemplateForUser(templateId: string, userId: string) {
    return this.prisma.jobTemplate.findFirst({
      where: {
        id: templateId,
        deletedAt: null,
        OR: [
          { scope: 'SYSTEM', isActive: true },
          { scope: 'USER', ownerId: userId },
        ],
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Create job + auto-generate tasks, notes, attachments, payment in a transaction
  // ─────────────────────────────────────────────────────────────────
  async createWithTasks(
    jobData: Prisma.JobCreateInput,
    templateId: string | undefined,
    postDate: Date | undefined,
    extra?: {
      userId: string;
      initialNote?: string;
      paymentAmount?: number;
      paymentExpectedDate?: Date;
      attachments?: Array<{
        fileName: string;
        fileUrl: string;
        fileType?: string;
        fileSize?: number;
      }>;
    },
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

      if (extra?.initialNote && extra.initialNote.trim()) {
        await tx.jobNote.create({
          data: {
            jobId: job.id,
            userId: extra.userId,
            content: extra.initialNote.trim(),
          },
        });
      }

      if (extra?.attachments && extra.attachments.length > 0) {
        await tx.jobAttachment.createMany({
          data: extra.attachments.map((att) => ({
            jobId: job.id,
            fileName: att.fileName,
            fileUrl: att.fileUrl,
            fileType: att.fileType,
            fileSize: att.fileSize,
          })),
        });
      }

      if (extra?.paymentAmount && extra.paymentAmount > 0) {
        await tx.payment.create({
          data: {
            jobId: job.id,
            amount: extra.paymentAmount,
            expectedDate: extra.paymentExpectedDate,
          },
        });
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

  // ─────────────────────────────────────────────────────────────────
  // Notes
  // ─────────────────────────────────────────────────────────────────
  async addNote(jobId: string, userId: string, content: string) {
    return this.prisma.jobNote.create({
      data: { jobId, userId, content },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  async findNoteById(id: string) {
    return this.prisma.jobNote.findFirst({
      where: { id, deletedAt: null },
      include: { job: { select: { userId: true } } },
    });
  }

  async softDeleteNote(id: string) {
    return this.prisma.jobNote.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Attachments
  // ─────────────────────────────────────────────────────────────────
  async addAttachment(
    jobId: string,
    data: { fileName: string; fileUrl: string; fileType?: string; fileSize?: number },
  ) {
    return this.prisma.jobAttachment.create({
      data: {
        jobId,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize,
      },
    });
  }

  async findAttachmentById(id: string) {
    return this.prisma.jobAttachment.findFirst({
      where: { id, deletedAt: null },
      include: { job: { select: { userId: true } } },
    });
  }

  async softDeleteAttachment(id: string) {
    return this.prisma.jobAttachment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Get job statistics for user
  // ─────────────────────────────────────────────────────────────────
  async getStats(userId: string) {
    const baseWhere: Prisma.JobWhereInput = { userId, deletedAt: null };

    const [total, inProgress, completed] = await Promise.all([
      this.prisma.job.count({ where: baseWhere }),
      this.prisma.job.count({
        where: {
          ...baseWhere,
          status: {
            notIn: [JobStatus.DRAFT, JobStatus.COMPLETED, JobStatus.CANCELLED],
          },
        },
      }),
      this.prisma.job.count({
        where: {
          ...baseWhere,
          status: JobStatus.COMPLETED,
        },
      }),
    ]);

    return { total, inProgress, completed };
  }
}

