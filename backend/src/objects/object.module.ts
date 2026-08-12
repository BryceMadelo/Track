import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ObjectEntity } from './object.entity';
import { ObjectController } from './object.controller';
import { ObjectService } from './object.service';

@Module({
  imports: [TypeOrmModule.forFeature([ObjectEntity])],
  controllers: [ObjectController],
  providers: [ObjectService],
})
export class ObjectModule {}
