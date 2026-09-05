import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateAttachmentDto {
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @IsString()
  @IsNotEmpty()
  fileUrl!: string;

  @IsOptional()
  @IsString()
  fileType?: string;

  @IsOptional()
  @IsInt()
  fileSize?: number;
}
