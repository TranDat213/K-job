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
import { JobType, JobStatus } from '@prisma/client';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  brandId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsString()
  requirement?: string;

  @IsOptional()
  @IsString()
  brief?: string;

  @IsOptional()
  @IsDateString()
  receivedDate?: string;

  @IsOptional()
  @IsDateString()
  demoDate?: string;

  @IsOptional()
  @IsDateString()
  postDate?: string;

  @IsOptional()
  @IsDateString()
  paymentExpectedDate?: string;

  @IsOptional()
  paymentAmount?: number;

  @IsOptional()
  @IsString()
  initialNote?: string;

  @IsOptional()
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileType?: string;
    fileSize?: number;
  }[];
}
