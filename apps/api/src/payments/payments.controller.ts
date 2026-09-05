import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // GET /api/payments/stats
  @Get('payments/stats')
  async getMonthlyStats(@CurrentUser() user: { id: string }) {
    const stats = await this.paymentsService.getMonthlyStats(user.id);
    return { data: stats, message: 'Success' };
  }

  // GET /api/jobs/:jobId/payments
  @Get('jobs/:jobId/payments')
  async findAll(
    @CurrentUser() user: { id: string },
    @Param('jobId') jobId: string,
  ) {
    const payments = await this.paymentsService.findAll(user.id, jobId);
    return { data: payments, message: 'Success' };
  }

  // POST /api/jobs/:jobId/payments
  @Post('jobs/:jobId/payments')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: { id: string },
    @Param('jobId') jobId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    const payment = await this.paymentsService.create(user.id, jobId, dto);
    return { data: payment, message: 'Payment created' };
  }

  // PATCH /api/payments/:id
  @Patch('payments/:id')
  async update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdatePaymentDto,
  ) {
    const payment = await this.paymentsService.update(user.id, id, dto);
    return { data: payment, message: 'Payment updated' };
  }

  // DELETE /api/payments/:id
  @Delete('payments/:id')
  @HttpCode(HttpStatus.OK)
  async remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.paymentsService.remove(user.id, id);
  }
}
