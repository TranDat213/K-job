import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { JobsRepository } from './jobs.repository';

const mockJobsRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  getStats: jest.fn(),
  createWithTasks: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  findBrandForUser: jest.fn(),
  findTemplateForUser: jest.fn(),
};

describe('JobsService', () => {
  let service: JobsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: JobsRepository, useValue: mockJobsRepository },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    jest.clearAllMocks();
  });

  describe('getStats', () => {
    it('should call repository.getStats with userId', async () => {
      const mockStats = { total: 10, inProgress: 4, completed: 6 };
      mockJobsRepository.getStats.mockResolvedValue(mockStats);

      const result = await service.getStats('user_1');

      expect(result).toEqual(mockStats);
      expect(mockJobsRepository.getStats).toHaveBeenCalledWith('user_1');
    });
  });
});
