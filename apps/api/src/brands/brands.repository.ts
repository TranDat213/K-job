import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Brand, Prisma } from '@prisma/client';

@Injectable()
export class BrandsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────
  // Find all active brands for a user
  // ─────────────────────────────────────────────────────────────────
  async findAllByUser(userId: string): Promise<Brand[]> {
    return this.prisma.brand.findMany({
      where: { userId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Find one active brand by id (no ownership check — done in service)
  // ─────────────────────────────────────────────────────────────────
  async findById(id: string): Promise<(Brand & { _count: { jobs: number } }) | null> {
    return this.prisma.brand.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { jobs: { where: { deletedAt: null } } } } },
    }) as any;
  }

  // ─────────────────────────────────────────────────────────────────
  // Find active brand by name for a user (duplicate check)
  // ─────────────────────────────────────────────────────────────────
  async findByName(userId: string, name: string, excludeId?: string): Promise<Brand | null> {
    return this.prisma.brand.findFirst({
      where: {
        userId,
        name,
        deletedAt: null,
        ...(excludeId && { NOT: { id: excludeId } }),
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Create brand
  // ─────────────────────────────────────────────────────────────────
  async create(data: Prisma.BrandCreateInput): Promise<Brand> {
    return this.prisma.brand.create({ data });
  }

  // ─────────────────────────────────────────────────────────────────
  // Update brand fields
  // ─────────────────────────────────────────────────────────────────
  async update(id: string, data: Prisma.BrandUpdateInput): Promise<Brand> {
    return this.prisma.brand.update({ where: { id }, data });
  }

  // ─────────────────────────────────────────────────────────────────
  // Soft delete brand
  // ─────────────────────────────────────────────────────────────────
  async softDelete(id: string): Promise<void> {
    await this.prisma.brand.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
