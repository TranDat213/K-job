import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────
  // Find active user by email for auth check
  // ─────────────────────────────────────────────────────────────────
  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Find active user by ID
  // ─────────────────────────────────────────────────────────────────
  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Create user in DB during registration
  // ─────────────────────────────────────────────────────────────────
  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }
}
