import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionService } from './execution.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Execution } from './execution.entity';
import { getQueueToken } from '@nestjs/bull';

describe('ExecutionService', () => {
  let service: ExecutionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExecutionService, { provide: getRepositoryToken(Execution), useValue: {} }, { provide: getQueueToken('execution'), useValue: {} }],
    }).compile();

    service = module.get<ExecutionService>(ExecutionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
