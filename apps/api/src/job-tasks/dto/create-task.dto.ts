import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { TaskStatus } from '@prisma/client';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
