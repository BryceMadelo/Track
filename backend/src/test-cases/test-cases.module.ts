import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestCasesService } from './test-cases.service';
import { TestCasesController } from './test-cases.controller';
import { TestCase } from './test-case.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TestCase])],
  providers: [TestCasesService],
  controllers: [TestCasesController],
  exports: [TestCasesService],
})
export class TestCasesModule {}
