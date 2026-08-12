import { Test, TestingModule } from '@nestjs/testing';
import { EnvironmentsService } from './environments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Environment } from './environment.entity';

describe('EnvironmentsService', () => {
  let service: EnvironmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnvironmentsService, { provide: getRepositoryToken(Environment), useValue: {} }],
    }).compile();

    service = module.get<EnvironmentsService>(EnvironmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
