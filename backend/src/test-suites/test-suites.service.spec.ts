import { Test, TestingModule } from '@nestjs/testing';
import { TestSuitesService } from './test-suites.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TestSuite } from './test-suite.entity';
import { TestCase } from '../test-cases/test-case.entity';

describe('TestSuitesService', () => {
  let service: TestSuitesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestSuitesService],
    })
      .useMocker(() => ({}))
      .compile();

    service = module.get<TestSuitesService>(TestSuitesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
