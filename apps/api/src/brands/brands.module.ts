import { Module } from '@nestjs/common';
import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';
import { BrandsRepository } from './brands.repository';

@Module({
  controllers: [BrandsController],
  providers: [BrandsService, BrandsRepository],
  exports: [BrandsService],
})
export class BrandsModule {}
