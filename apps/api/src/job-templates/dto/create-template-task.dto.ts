import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsBoolean,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateTemplateTaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  order!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  daysBeforePost?: number;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
}
