import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PaymentsRepository } from './payments.repository';

const mockPaymentsRepository = {
  findJobOwner: jest.fn(),
  findPaymentWithOwner: jest.fn(),
  findAllByJob: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  getMonthlyStats: jest.fn(),
};

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PaymentsRepository, useValue: mockPaymentsRepository },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    jest.clearAllMocks();
  });

  describe('getMonthlyStats', () => {
    it('should query monthly stats and format to numbers', async () => {
      mockPaymentsRepository.getMonthlyStats.mockResolvedValue({
        monthRevenue: '15000000',
        pendingRevenue: '5000000',
      });

      const result = await service.getMonthlyStats('user_1');

      expect(result).toEqual({
        monthRevenue: 15000000,
        pendingRevenue: 5000000,
      });
      expect(mockPaymentsRepository.getMonthlyStats).toHaveBeenCalledWith(
        'user_1',
        expect.any(Date),
        expect.any(Date),
      );
    });
  });
});
