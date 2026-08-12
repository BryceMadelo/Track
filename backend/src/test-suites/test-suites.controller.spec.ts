import { Test, TestingModule } from '@nestjs/testing';
import { TestSuitesController } from './test-suites.controller';
import { TestSuitesService } from './test-suites.service';

describe('TestSuitesController', () => {
  let controller: TestSuitesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestSuitesController],
    })
      .useMocker(() => ({}))
      .compile();

    controller = module.get<TestSuitesController>(TestSuitesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
