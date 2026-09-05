import {
  IsNumber,
  IsPositive,
  IsOptional,
  IsEnum,
  IsString,
  IsDateString,
} from 'class-validator';
import { PaymentStatus, PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsDateString()
  expectedDate?: string;

  @IsOptional()
  @IsDateString()
  paidDate?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  note?: string;
}
