import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Payment, Prisma, PaymentStatus } from '@prisma/client';

type PaymentWithJobOwner = Payment & { job: { userId: string } };

@Injectable()
export class PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────
  // Validate job belongs to user (for ownership assertion)
  // ─────────────────────────────────────────────────────────────────
  async findJobOwner(jobId: string): Promise<{ userId: string } | null> {
    return this.prisma.job.findFirst({
      where: { id: jobId, deletedAt: null },
      select: { userId: true },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Find payment with its job's userId (for ownership assertion)
  // ─────────────────────────────────────────────────────────────────
  async findPaymentWithOwner(paymentId: string): Promise<PaymentWithJobOwner | null> {
    return this.prisma.payment.findFirst({
      where: { id: paymentId, deletedAt: null },
      include: { job: { select: { userId: true } } },
    }) as any;
  }

  // ─────────────────────────────────────────────────────────────────
  // Find all active payments for a job
  // ─────────────────────────────────────────────────────────────────
  async findAllByJob(jobId: string): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: { jobId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Create payment
  // ─────────────────────────────────────────────────────────────────
  async create(data: Prisma.PaymentCreateInput): Promise<Payment> {
    return this.prisma.payment.create({ data });
  }

  // ─────────────────────────────────────────────────────────────────
  // Update payment
  // ─────────────────────────────────────────────────────────────────
  async update(id: string, data: Prisma.PaymentUpdateInput): Promise<Payment> {
    return this.prisma.payment.update({ where: { id }, data });
  }

  // ─────────────────────────────────────────────────────────────────
  // Soft delete
  // ─────────────────────────────────────────────────────────────────
  async softDelete(id: string): Promise<void> {
    await this.prisma.payment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Update job's payment expected date
  // ─────────────────────────────────────────────────────────────────
  async updateJobPaymentExpectedDate(jobId: string, paymentExpectedDate: Date | null) {
    return this.prisma.job.update({
      where: { id: jobId },
      data: { paymentExpectedDate },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Get monthly payment stats for a user
  // ─────────────────────────────────────────────────────────────────
  async getMonthlyStats(userId: string, startOfMonth: Date, endOfMonth: Date) {
    const baseWhere: Prisma.PaymentWhereInput = {
      deletedAt: null,
      job: {
        userId,
        deletedAt: null,
      },
    };

    const [paidThisMonth, pendingPayments] = await Promise.all([
      this.prisma.payment.aggregate({
        where: {
          ...baseWhere,
          status: PaymentStatus.PAID,
          OR: [
            { paidDate: { gte: startOfMonth, lte: endOfMonth } },
            { paidDate: null, updatedAt: { gte: startOfMonth, lte: endOfMonth } },
          ],
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          ...baseWhere,
          status: {
            in: [PaymentStatus.PENDING, PaymentStatus.REQUESTED, PaymentStatus.OVERDUE],
          },
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      monthRevenue: paidThisMonth._sum.amount ?? 0,
      pendingRevenue: pendingPayments._sum.amount ?? 0,
    };
  }
}
