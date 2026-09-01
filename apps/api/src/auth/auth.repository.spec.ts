import { Test, TestingModule } from '@nestjs/testing';
import { AuthRepository } from './auth.repository';
import { PrismaService } from '../prisma/prisma.service';

const mockUser = {
  id: 'cuid_user_1',
  email: 'test@example.com',
  passwordHash: '$2b$12$hashedpassword',
  name: 'Test User',
  avatarUrl: null,
  phone: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockPrismaService = {
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
};

describe('AuthRepository', () => {
  let repository: AuthRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<AuthRepository>(AuthRepository);
    jest.clearAllMocks();
  });

  describe('findUserByEmail', () => {
    it('should query prisma with email and deletedAt null filter', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await repository.findUserByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { email: 'test@example.com', deletedAt: null },
      });
    });
  });

  describe('findUserById', () => {
    it('should query prisma with id and deletedAt null filter', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await repository.findUserById('cuid_user_1');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'cuid_user_1', deletedAt: null },
      });
    });
  });

  describe('createUser', () => {
    it('should create user record in DB', async () => {
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await repository.createUser({
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        name: 'Test User',
      });

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          passwordHash: 'hashedpassword',
          name: 'Test User',
        },
      });
    });
  });
});
