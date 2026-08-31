import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

type CreateUserInput = {
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────
  // Find by email — only active users (deletedAt IS NULL)
  // ─────────────────────────────────────────────────────────────────
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null, // soft-delete filter
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Find by id — only active users
  // ─────────────────────────────────────────────────────────────────
  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null, // soft-delete filter
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Create user
  // ─────────────────────────────────────────────────────────────────
  async create(input: CreateUserInput): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        name: input.name,
        phone: input.phone,
      },
    });
  }
}
