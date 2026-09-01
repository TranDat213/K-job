import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────
  // Find active user by email (deletedAt IS NULL)
  // ─────────────────────────────────────────────────────────────────
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Find active user by ID (deletedAt IS NULL)
  // ─────────────────────────────────────────────────────────────────
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Create user
  // ─────────────────────────────────────────────────────────────────
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Update user
  // ─────────────────────────────────────────────────────────────────
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Soft delete user
  // ─────────────────────────────────────────────────────────────────
  async softDelete(id: string): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
