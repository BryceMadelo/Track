import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bug, BugStatus, BugSeverity, BugPriority } from './bug.entity';
import { User } from '../users/user.entity';

@Injectable()
export class BugsService {
  constructor(
    @InjectRepository(Bug)
    private bugsRepository: Repository<Bug>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Bug[]> {
    return this.bugsRepository.find({
      relations: { reportedBy: true, assignedTo: true, linkedTestCase: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Bug> {
    const bug = await this.bugsRepository.findOne({
      where: { id },
      relations: { reportedBy: true, assignedTo: true, linkedTestCase: true },
    });
    if (!bug) throw new NotFoundException(`Bug #${id} not found`);
    return bug;
  }

  async findByStatus(status: BugStatus): Promise<Bug[]> {
    return this.bugsRepository.find({
      where: { status },
      relations: { reportedBy: true, assignedTo: true },
      order: { createdAt: 'DESC' },
    });
  }

  async create(data: {
    title: string;
    description?: string;
    stepsToReproduce?: string;
    expectedBehavior?: string;
    actualBehavior?: string;
    severity?: BugSeverity;
    priority?: BugPriority;
    environment?: string;
    version?: string;
    assignedToId?: number;
    linkedTestCaseId?: number;
    reportedById?: number;
  }): Promise<Bug> {
    const bug = this.bugsRepository.create({
      title: data.title,
      description: data.description,
      stepsToReproduce: data.stepsToReproduce,
      expectedBehavior: data.expectedBehavior,
      actualBehavior: data.actualBehavior,
      severity: data.severity,
      priority: data.priority,
      environment: data.environment,
      version: data.version,
    });

    if (data.assignedToId) {
      const assignedTo = await this.usersRepository.findOne({
        where: { id: data.assignedToId },
      });
      if (assignedTo) bug.assignedTo = assignedTo;
    }

    if (data.reportedById) {
      const reportedBy = await this.usersRepository.findOne({
        where: { id: data.reportedById },
      });
      if (reportedBy) bug.reportedBy = reportedBy;
    }

    return this.bugsRepository.save(bug);
  }

  async updateStatus(id: number, status: BugStatus, resolution?: string): Promise<Bug> {
    const update: Partial<Bug> = { status };
    if (status === BugStatus.FIXED || status === BugStatus.CLOSED) {
      update.resolvedAt = new Date();
      if (resolution) update.resolution = resolution;
    }
    await this.bugsRepository.update(id, update);
    return this.findOne(id);
  }

  async update(id: number, data: any): Promise<Bug> {
    if (data.assignedToId) {
      const assignedTo = await this.usersRepository.findOne({
        where: { id: data.assignedToId },
      });
      const bug = await this.findOne(id);
      bug.assignedTo = assignedTo!;
      if (data.status) bug.status = data.status;
      if (data.priority) bug.priority = data.priority;
      if (data.severity) bug.severity = data.severity;
      if (data.resolution) bug.resolution = data.resolution;
      return this.bugsRepository.save(bug);
    }
    await this.bugsRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.bugsRepository.delete(id);
  }

  async getStats() {
    const total = await this.bugsRepository.count();
    const open = await this.bugsRepository.count({ where: { status: BugStatus.OPEN } });
    const inProgress = await this.bugsRepository.count({ where: { status: BugStatus.IN_PROGRESS } });
    const fixed = await this.bugsRepository.count({ where: { status: BugStatus.FIXED } });
    const critical = await this.bugsRepository.count({ where: { severity: BugSeverity.CRITICAL } });
    return { total, open, inProgress, fixed, critical };
  }
}