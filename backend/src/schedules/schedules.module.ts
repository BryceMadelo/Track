import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { Schedule } from './schedule.entity';
import { ExecutionModule } from '../execution/execution.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Schedule]),
    ScheduleModule.forRoot(),
    ExecutionModule,
  ],
  providers: [SchedulesService],
  controllers: [SchedulesController],
  exports: [SchedulesService],
})
export class SchedulesModule {}