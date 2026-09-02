import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  contactName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  contactPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  contactEmail?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
