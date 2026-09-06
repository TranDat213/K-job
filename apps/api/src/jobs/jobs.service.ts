import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JobsRepository } from './jobs.repository';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobStatus } from '@prisma/client';

export interface JobsQuery {
  page?: number;
  limit?: number;
  status?: JobStatus;
  brandId?: string;
  search?: string;
}

@Injectable()
export class JobsService {
  constructor(private readonly jobsRepository: JobsRepository) {}

  // ─────────────────────────────────────────────────────────────────
  // FIND ALL  — paginated, filterable
  // ─────────────────────────────────────────────────────────────────
  async findAll(userId: string, query: JobsQuery = {}) {
    return this.jobsRepository.findAll(userId, query);
  }

  // ─────────────────────────────────────────────────────────────────
  // GET STATS
  // ─────────────────────────────────────────────────────────────────
  async getStats(userId: string) {
    return this.jobsRepository.getStats(userId);
  }

  // ─────────────────────────────────────────────────────────────────
  // FIND ONE  — ownership check
  // ─────────────────────────────────────────────────────────────────
  async findOne(userId: string, id: string) {
    const job = await this.jobsRepository.findById(id);
    if (!job) throw new NotFoundException('Job not found');
    if (job.userId !== userId) throw new ForbiddenException('Access denied');
    return job;
  }

  // ─────────────────────────────────────────────────────────────────
  // CREATE  — validate ownership, delegate $transaction to repo
  // ─────────────────────────────────────────────────────────────────
  async create(userId: string, dto: CreateJobDto) {
    // Validate brand ownership
    const brand = await this.jobsRepository.findBrandForUser(dto.brandId, userId);
    if (!brand) throw new NotFoundException('Brand not found or access denied');

    // Validate template ownership if provided
    if (dto.templateId) {
      const template = await this.jobsRepository.findTemplateForUser(dto.templateId, userId);
      if (!template) throw new NotFoundException('Template not found or access denied');
    }

    const toDate = (s?: string) => (s ? new Date(s) : undefined);
    const postDate = toDate(dto.postDate);

    const job = await this.jobsRepository.createWithTasks(
      {
        user: { connect: { id: userId } },
        brand: { connect: { id: dto.brandId } },
        ...(dto.templateId && { template: { connect: { id: dto.templateId } } }),
        name: dto.name,
        description: dto.description,
        jobType: dto.jobType,
        status: dto.status ?? 'NEW',
        quantity: dto.quantity,
        requirement: dto.requirement,
        brief: dto.brief,
        receivedDate: toDate(dto.receivedDate),
        demoDate: toDate(dto.demoDate),
        postDate,
        paymentExpectedDate: toDate(dto.paymentExpectedDate),
      },
      dto.templateId,
      postDate,
      {
        userId,
        initialNote: dto.initialNote,
        paymentAmount: dto.paymentAmount,
        paymentExpectedDate: toDate(dto.paymentExpectedDate),
        attachments: dto.attachments,
        tasks: dto.tasks,
      },
    );

    return this.findOne(userId, job.id);
  }

  // ─────────────────────────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────────────────────────
  async update(userId: string, id: string, dto: UpdateJobDto) {
    await this.findOne(userId, id); // ownership check

    const toDate = (s?: string | null) =>
      s ? new Date(s) : s === null || s === '' ? null : undefined;

    const parsedPaymentExpectedDate =
      dto.paymentExpectedDate !== undefined ? toDate(dto.paymentExpectedDate) : undefined;

    const updatedJob = await this.jobsRepository.update(id, {
      name: dto.name,
      description: dto.description,
      jobType: dto.jobType,
      status: dto.status,
      quantity: dto.quantity,
      requirement: dto.requirement,
      brief: dto.brief,
      receivedDate: dto.receivedDate !== undefined ? toDate(dto.receivedDate) : undefined,
      demoDate: dto.demoDate !== undefined ? toDate(dto.demoDate) : undefined,
      postDate: dto.postDate !== undefined ? toDate(dto.postDate) : undefined,
      paymentExpectedDate: parsedPaymentExpectedDate,
    });

    // Tự động đồng bộ ngày thanh toán dự kiến sang các khoản thanh toán chưa hoàn tất của job
    if (parsedPaymentExpectedDate !== undefined) {
      await this.jobsRepository.syncPendingPaymentsExpectedDate(id, parsedPaymentExpectedDate);
    }

    return updatedJob;
  }

  // ─────────────────────────────────────────────────────────────────
  // REMOVE  — soft delete (does NOT cascade tasks/payments)
  // ─────────────────────────────────────────────────────────────────
  async remove(userId: string, id: string) {
    await this.findOne(userId, id); // ownership check
    await this.jobsRepository.softDelete(id);
    return { message: 'Job deleted' };
  }

  // ─────────────────────────────────────────────────────────────────
  // NOTES
  // ─────────────────────────────────────────────────────────────────
  async addNote(userId: string, jobId: string, content: string) {
    await this.findOne(userId, jobId);
    return this.jobsRepository.addNote(jobId, userId, content);
  }

  async removeNote(userId: string, noteId: string) {
    const note = await this.jobsRepository.findNoteById(noteId);
    if (!note) throw new NotFoundException('Note not found');
    if (note.job.userId !== userId && note.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    await this.jobsRepository.softDeleteNote(noteId);
    return { message: 'Note deleted' };
  }

  // ─────────────────────────────────────────────────────────────────
  // ATTACHMENTS
  // ─────────────────────────────────────────────────────────────────
  async addAttachment(
    userId: string,
    jobId: string,
    data: { fileName: string; fileUrl: string; fileType?: string; fileSize?: number },
  ) {
    await this.findOne(userId, jobId);
    return this.jobsRepository.addAttachment(jobId, data);
  }

  async removeAttachment(userId: string, attachmentId: string) {
    const att = await this.jobsRepository.findAttachmentById(attachmentId);
    if (!att) throw new NotFoundException('Attachment not found');
    if (att.job.userId !== userId) throw new ForbiddenException('Access denied');
    await this.jobsRepository.softDeleteAttachment(attachmentId);
    return { message: 'Attachment deleted' };
  }
}

