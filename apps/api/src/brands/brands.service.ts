import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { BrandsRepository } from './brands.repository';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Brand } from '@prisma/client';

@Injectable()
export class BrandsService {
  constructor(private readonly brandsRepository: BrandsRepository) {}

  // ─────────────────────────────────────────────────────────────────
  // FIND ALL  — scoped to user
  // ─────────────────────────────────────────────────────────────────
  async findAll(userId: string) {
    return this.brandsRepository.findAllByUser(userId);
  }

  // ─────────────────────────────────────────────────────────────────
  // FIND ONE  — ownership check
  // ─────────────────────────────────────────────────────────────────
  async findOne(userId: string, id: string) {
    const brand = await this.brandsRepository.findById(id);
    if (!brand) throw new NotFoundException('Brand not found');
    if (brand.userId !== userId) throw new ForbiddenException('Access denied');
    return brand;
  }

  // ─────────────────────────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────────────────────────
  async create(userId: string, dto: CreateBrandDto): Promise<Brand> {
    const duplicate = await this.brandsRepository.findByName(userId, dto.name);
    if (duplicate) throw new ConflictException('Brand name already exists');

    return this.brandsRepository.create({
      user: { connect: { id: userId } },
      name: dto.name,
      contactName: dto.contactName,
      contactPhone: dto.contactPhone,
      contactEmail: dto.contactEmail,
      note: dto.note,
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────────────────────────
  async update(userId: string, id: string, dto: UpdateBrandDto): Promise<Brand> {
    await this.findOne(userId, id); // ownership check

    if (dto.name) {
      const conflict = await this.brandsRepository.findByName(userId, dto.name, id);
      if (conflict) throw new ConflictException('Brand name already exists');
    }

    return this.brandsRepository.update(id, dto);
  }

  // ─────────────────────────────────────────────────────────────────
  // REMOVE  — soft delete
  // ─────────────────────────────────────────────────────────────────
  async remove(userId: string, id: string) {
    await this.findOne(userId, id); // ownership check
    await this.brandsRepository.softDelete(id);
    return { message: 'Brand deleted' };
  }
}
