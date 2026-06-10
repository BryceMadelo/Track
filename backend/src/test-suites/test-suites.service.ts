import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestSuite, SuiteType } from './test-suite.entity';
import { TestCase } from '../test-cases/test-case.entity';

@Injectable()
export class TestSuitesService {
  constructor(
    @InjectRepository(TestSuite)
    private testSuitesRepository: Repository<TestSuite>,
    @InjectRepository(TestCase)
    private testCasesRepository: Repository<TestCase>,
  ) {}

  async findAll(): Promise<TestSuite[]> {
    return this.testSuitesRepository.find({
      where: { isActive: true },
      relations: { testCases: true },
    });
  }

  async findOne(id: number): Promise<TestSuite> {
    const suite = await this.testSuitesRepository.findOne({
      where: { id },
      relations: { testCases: true },
    });
    if (!suite) throw new NotFoundException(`Test suite #${id} not found`);
    return suite;
  }

  async create(data: {
    name: string;
    description?: string;
    type?: SuiteType;
    testCaseIds?: number[];
  }): Promise<TestSuite> {
    const suite = this.testSuitesRepository.create({
      name: data.name,
      description: data.description,
      type: data.type,
    });

    if (data.testCaseIds?.length) {
      suite.testCases = await this.testCasesRepository.findBy(
        data.testCaseIds.map(id => ({ id }))
      );
    }

    return this.testSuitesRepository.save(suite);
  }

  async update(id: number, data: any): Promise<TestSuite> {
    const suite = await this.findOne(id);
    if (data.testCaseIds) {
      suite.testCases = await this.testCasesRepository.findBy(
        data.testCaseIds.map(id => ({ id }))
      );
    }
    Object.assign(suite, data);
    return this.testSuitesRepository.save(suite);
  }

  async remove(id: number): Promise<void> {
    await this.testSuitesRepository.update(id, { isActive: false });
  }
}