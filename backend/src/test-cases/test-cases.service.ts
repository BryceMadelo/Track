import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestCase, Platform, Priority, AutomationStatus } from './test-case.entity';

@Injectable()
export class TestCasesService {
  constructor(
    @InjectRepository(TestCase)
    private testCasesRepository: Repository<TestCase>,
  ) {}

  async findAll(): Promise<TestCase[]> {
    return this.testCasesRepository.find({ where: { isActive: true } });
  }

  async findOne(id: number): Promise<TestCase> {
    const testCase = await this.testCasesRepository.findOne({ where: { id } });
    if (!testCase) throw new NotFoundException(`Test case #${id} not found`);
    return testCase;
  }

  async create(data: {
    title: string;
    description?: string;
    platform: Platform;
    priority?: Priority;
    automationStatus?: AutomationStatus;
    tags?: string;
    steps?: { order: number; action: string; expected: string }[];
    expectedResult?: string;
  }): Promise<TestCase> {
    const testCase = this.testCasesRepository.create(data);
    return this.testCasesRepository.save(testCase);
  }

  async update(id: number, data: Partial<TestCase>): Promise<TestCase> {
    await this.testCasesRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.testCasesRepository.update(id, { isActive: false });
  }
}