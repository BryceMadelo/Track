import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestSuitesService } from './test-suites.service';
import { TestSuitesController } from './test-suites.controller';
import { TestSuite } from './test-suite.entity';
import { TestCase } from '../test-cases/test-case.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TestSuite, TestCase])],
  providers: [TestSuitesService],
  controllers: [TestSuitesController],
  exports: [TestSuitesService],
})
export class TestSuitesModule {}
