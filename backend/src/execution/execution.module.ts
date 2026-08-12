import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecutionController } from './execution.controller';
import { ExecutionService } from './execution.service';
import { ExecutionProcessor } from './execution.processor';
import { Execution } from './execution.entity';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'execution' }),
    TypeOrmModule.forFeature([Execution]),
  ],
  controllers: [ExecutionController],
  providers: [ExecutionService, ExecutionProcessor],
  exports: [ExecutionService],
})
export class ExecutionModule {}
