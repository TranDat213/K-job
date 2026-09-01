import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from './users.repository';
import { PrismaService } from '../prisma/prisma.service';

const mockUser = {
  id: 'user_cuid_1',
  email: 'test@example.com',
  passwordHash: 'hashed_password',
  name: 'Test User',
  avatarUrl: null,
  phone: '0901234567',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockPrismaService = {
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('UsersRepository', () => {
  let repository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should query prisma with email and deletedAt null', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await repository.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com', deletedAt: null },
      });
    });
  });

  describe('findById', () => {
    it('should query prisma with id and deletedAt null', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await repository.findById('user_cuid_1');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'user_cuid_1', deletedAt: null },
      });
    });
  });

  describe('create', () => {
    it('should create a new user record in DB', async () => {
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await repository.create({
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        name: 'Test User',
      });

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashed_password',
          name: 'Test User',
        },
      });
    });
  });
});
