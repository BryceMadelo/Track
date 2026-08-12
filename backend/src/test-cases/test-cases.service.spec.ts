import { Test, TestingModule } from '@nestjs/testing';
import { TestCasesService } from './test-cases.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TestCase } from './test-case.entity';

describe('TestCasesService', () => {
  let service: TestCasesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestCasesService, { provide: getRepositoryToken(TestCase), useValue: {} }],
    }).compile();

    service = module.get<TestCasesService>(TestCasesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
