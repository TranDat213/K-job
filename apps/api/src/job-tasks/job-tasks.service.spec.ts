import { Test, TestingModule } from '@nestjs/testing';
import { JobTasksService } from './job-tasks.service';
import { JobTasksRepository } from './job-tasks.repository';

const mockJobTasksRepository = {
  findJobOwner: jest.fn(),
  findTaskWithOwner: jest.fn(),
  findAllByJob: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  getTodayTasks: jest.fn(),
};

describe('JobTasksService', () => {
  let service: JobTasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobTasksService,
        { provide: JobTasksRepository, useValue: mockJobTasksRepository },
      ],
    }).compile();

    service = module.get<JobTasksService>(JobTasksService);
    jest.clearAllMocks();
  });

  describe('getTodayTasks', () => {
    it('should calculate endOfToday and query repository', async () => {
      const mockResult = {
        count: 2,
        tasks: [
          {
            id: 'task_1',
            title: 'Shoot video',
            dueDate: new Date(),
            status: 'TODO',
            job: { id: 'job_1', name: 'Job 1', brand: { id: 'b_1', name: 'Brand 1' } },
          },
        ],
      };
      mockJobTasksRepository.getTodayTasks.mockResolvedValue(mockResult);

      const result = await service.getTodayTasks('user_1');

      expect(result).toEqual(mockResult);
      expect(mockJobTasksRepository.getTodayTasks).toHaveBeenCalledWith(
        'user_1',
        expect.any(Date),
      );
    });
  });
});
