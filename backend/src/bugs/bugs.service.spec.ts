import { Test, TestingModule } from '@nestjs/testing';
import { BugsService } from './bugs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Bug } from './bug.entity';
import { User } from '../users/user.entity';

describe('BugsService', () => {
  let service: BugsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BugsService, { provide: getRepositoryToken(Bug), useValue: {} }, { provide: getRepositoryToken(User), useValue: {} }],
    }).compile();

    service = module.get<BugsService>(BugsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
