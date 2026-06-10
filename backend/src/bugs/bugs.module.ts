import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BugsService } from './bugs.service';
import { BugsController } from './bugs.controller';
import { Bug } from './bug.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bug, User])],
  providers: [BugsService],
  controllers: [BugsController],
  exports: [BugsService],
})
export class BugsModule {}