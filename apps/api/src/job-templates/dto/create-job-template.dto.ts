import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { JobType } from '@prisma/client';

export class CreateJobTemplateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;
}
