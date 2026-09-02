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
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('brands')
@UseGuards(JwtAuthGuard)
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  // GET /api/brands
  @Get()
  async findAll(@CurrentUser() user: { id: string }) {
    const brands = await this.brandsService.findAll(user.id);
    return { data: brands, message: 'Success' };
  }

  // GET /api/brands/:id
  @Get(':id')
  async findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    const brand = await this.brandsService.findOne(user.id, id);
    return { data: brand, message: 'Success' };
  }

  // POST /api/brands
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: { id: string }, @Body() dto: CreateBrandDto) {
    const brand = await this.brandsService.create(user.id, dto);
    return { data: brand, message: 'Brand created' };
  }

  // PATCH /api/brands/:id
  @Patch(':id')
  async update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateBrandDto,
  ) {
    const brand = await this.brandsService.update(user.id, id, dto);
    return { data: brand, message: 'Brand updated' };
  }

  // DELETE /api/brands/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.brandsService.remove(user.id, id);
  }
}
