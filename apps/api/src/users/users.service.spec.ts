import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

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

const mockUsersRepository = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockUsersRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should call repository findByEmail', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('findById', () => {
    it('should call repository findById', async () => {
      mockUsersRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findById('user_cuid_1');

      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findById).toHaveBeenCalledWith('user_cuid_1');
    });
  });

  describe('create', () => {
    it('should delegate creation to repository', async () => {
      mockUsersRepository.create.mockResolvedValue(mockUser);

      const result = await service.create({
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        name: 'Test User',
      });

      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        passwordHash: 'hashed_password',
        name: 'Test User',
        phone: undefined,
      });
    });
  });
});
