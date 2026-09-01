import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

@Module({
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository], // exported so other modules can access user data logic/repository
})
export class UsersModule {}

