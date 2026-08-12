import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Queue } from 'bull';
import {
  Execution,
  ExecutionStatus,
  ExecutionPlatform,
} from './execution.entity';

@Injectable()
export class ExecutionService {
  private readonly logger = new Logger(ExecutionService.name);

  constructor(
    @InjectQueue('execution') private executionQueue: Queue,
    @InjectRepository(Execution)
    private executionRepository: Repository<Execution>,
  ) {}

  async queueMobileTest(username: string, password: string) {
    const execution = this.executionRepository.create({
      platform: ExecutionPlatform.MOBILE,
      status: ExecutionStatus.QUEUED,
    });
    const saved = await this.executionRepository.save(execution);

    const job = await this.executionQueue.add('mobile', {
      username,
      password,
      executionId: saved.id,
    });

    await this.executionRepository.update(saved.id, { jobId: String(job.id) });
    this.logger.log(`Mobile job queued with ID: ${job.id}`);
    return { jobId: job.id, executionId: saved.id, status: 'queued' };
  }

  async queueWebTest(
    username: string,
    password: string,
    url: string,
    environment?: string,
  ) {
    const execution = this.executionRepository.create({
      platform: ExecutionPlatform.WEB,
      status: ExecutionStatus.QUEUED,
      environment,
    });
    const saved = await this.executionRepository.save(execution);

    const job = await this.executionQueue.add('web', {
      username,
      password,
      url,
      executionId: saved.id,
    });

    await this.executionRepository.update(saved.id, { jobId: String(job.id) });
    this.logger.log(`Web job queued with ID: ${job.id}`);
    return { jobId: job.id, executionId: saved.id, status: 'queued' };
  }

  async updateExecution(id: number, data: Partial<Execution>) {
    await this.executionRepository.update(id, data);
  }

  async findAll() {
    return this.executionRepository.find({
      order: { startedAt: 'DESC' },
      take: 50,
    });
  }

  async findOne(id: number) {
    return this.executionRepository.findOne({ where: { id } });
  }

  async queueVisualWebTest(data: {
    username: string;
    password: string;
    url: string;
    environment?: string;
    engine: 'playwright' | 'selenium';
    featureTitle: string;
    scenarioTitle: string;
    steps: {
      keyword: string;
      title: string;
      description: string;
      captureScreenshot: boolean;
    }[];
  }) {
    const execution = this.executionRepository.create({
      platform: ExecutionPlatform.WEB,
      status: ExecutionStatus.QUEUED,
      environment: data.environment,
    });
    const saved = await this.executionRepository.save(execution);

    const job = await this.executionQueue.add('visual-web', {
      ...data,
      executionId: saved.id,
    });

    await this.executionRepository.update(saved.id, { jobId: String(job.id) });
    this.logger.log(`Visual web job queued with ID: ${job.id}`);
    return { jobId: job.id, executionId: saved.id, status: 'queued' };
  }
}
