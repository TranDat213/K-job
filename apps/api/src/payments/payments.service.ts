import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PaymentsRepository } from './payments.repository';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private readonly paymentsRepository: PaymentsRepository) {}

  // ─────────────────────────────────────────────────────────────────
  // Ownership guards
  // ─────────────────────────────────────────────────────────────────
  private async assertJobOwner(userId: string, jobId: string) {
    const job = await this.paymentsRepository.findJobOwner(jobId);
    if (!job) throw new NotFoundException('Job not found');
    if (job.userId !== userId) throw new ForbiddenException('Access denied');
  }

  private async assertPaymentOwner(userId: string, paymentId: string) {
    const payment = await this.paymentsRepository.findPaymentWithOwner(paymentId);
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.job.userId !== userId) throw new ForbiddenException('Access denied');
    return payment;
  }

  // ─────────────────────────────────────────────────────────────────
  // FIND ALL payments for a job
  // ─────────────────────────────────────────────────────────────────
  async findAll(userId: string, jobId: string) {
    await this.assertJobOwner(userId, jobId);
    return this.paymentsRepository.findAllByJob(jobId);
  }

  // ─────────────────────────────────────────────────────────────────
  // CREATE payment
  // ─────────────────────────────────────────────────────────────────
  async create(userId: string, jobId: string, dto: CreatePaymentDto) {
    await this.assertJobOwner(userId, jobId);

    const toDate = (s?: string | null) =>
      s ? new Date(s) : s === null || s === '' ? null : undefined;

    const parsedExpectedDate = toDate(dto.expectedDate);

    const payment = await this.paymentsRepository.create({
      job: { connect: { id: jobId } },
      amount: dto.amount,
      currency: dto.currency ?? 'VND',
      status: dto.status ?? PaymentStatus.PENDING,
      expectedDate: parsedExpectedDate,
      paidDate: toDate(dto.paidDate),
      paymentMethod: dto.paymentMethod,
      note: dto.note,
    });

    if (parsedExpectedDate !== undefined) {
      await this.paymentsRepository.updateJobPaymentExpectedDate(jobId, parsedExpectedDate);
    }

    return payment;
  }

  // ─────────────────────────────────────────────────────────────────
  // UPDATE payment — sets paidDate automatically when status → PAID
  // ─────────────────────────────────────────────────────────────────
  async update(userId: string, paymentId: string, dto: UpdatePaymentDto) {
    const payment = await this.assertPaymentOwner(userId, paymentId);

    const toDate = (s?: string | null) =>
      s ? new Date(s) : s === null || s === '' ? null : undefined;

    // Business rule: PAID status sets paidDate = now() unless explicit date supplied
    let paidDate: Date | null | undefined = undefined;
    if (dto.status === PaymentStatus.PAID && !payment.paidDate) {
      paidDate = dto.paidDate ? new Date(dto.paidDate) : new Date();
    }

    const parsedExpectedDate =
      dto.expectedDate !== undefined ? toDate(dto.expectedDate) : undefined;

    const updatedPayment = await this.paymentsRepository.update(paymentId, {
      amount: dto.amount,
      currency: dto.currency,
      status: dto.status,
      expectedDate: parsedExpectedDate,
      paidDate: paidDate ?? (dto.paidDate !== undefined ? toDate(dto.paidDate) : undefined),
      paymentMethod: dto.paymentMethod,
      note: dto.note,
    });

    if (parsedExpectedDate !== undefined) {
      await this.paymentsRepository.updateJobPaymentExpectedDate(
        payment.jobId,
        parsedExpectedDate,
      );
    }

    return updatedPayment;
  }

  // ─────────────────────────────────────────────────────────────────
  // REMOVE — soft delete
  // ─────────────────────────────────────────────────────────────────
  async remove(userId: string, paymentId: string) {
    await this.assertPaymentOwner(userId, paymentId);
    await this.paymentsRepository.softDelete(paymentId);
    return { message: 'Payment deleted' };
  }

  // ─────────────────────────────────────────────────────────────────
  // GET MONTHLY STATS for user
  // ─────────────────────────────────────────────────────────────────
  async getMonthlyStats(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const stats = await this.paymentsRepository.getMonthlyStats(
      userId,
      startOfMonth,
      endOfMonth,
    );

    return {
      monthRevenue: Number(stats.monthRevenue) || 0,
      pendingRevenue: Number(stats.pendingRevenue) || 0,
    };
  }
}
