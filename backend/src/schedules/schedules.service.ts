import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import {
  Schedule,
  ScheduleFrequency,
  SchedulePlatform,
} from './schedule.entity';
import { ExecutionService } from '../execution/execution.service';

@Injectable()
export class SchedulesService {
  private readonly logger = new Logger(SchedulesService.name);

  constructor(
    @InjectRepository(Schedule)
    private schedulesRepository: Repository<Schedule>,
    private executionService: ExecutionService,
  ) {}

  async findAll(): Promise<Schedule[]> {
    return this.schedulesRepository.find({ where: { isActive: true } });
  }

  async findOne(id: number): Promise<Schedule> {
    const schedule = await this.schedulesRepository.findOne({ where: { id } });
    if (!schedule) throw new NotFoundException(`Schedule #${id} not found`);
    return schedule;
  }

  async create(data: {
    name: string;
    platform: SchedulePlatform;
    frequency: ScheduleFrequency;
    environment?: string;
    url?: string;
    username: string;
    password: string;
  }): Promise<Schedule> {
    const cronExpression = this.getCronExpression(data.frequency);
    const nextRunAt = this.getNextRunDate(data.frequency);

    const schedule = this.schedulesRepository.create({
      ...data,
      cronExpression,
      nextRunAt,
    });

    return this.schedulesRepository.save(schedule);
  }

  async remove(id: number): Promise<void> {
    await this.schedulesRepository.update(id, { isActive: false });
  }

  async toggleActive(id: number): Promise<Schedule> {
    const schedule = await this.findOne(id);
    await this.schedulesRepository.update(id, { isActive: !schedule.isActive });
    return this.findOne(id);
  }

  private getCronExpression(frequency: ScheduleFrequency): string {
    switch (frequency) {
      case ScheduleFrequency.HOURLY:
        return '0 * * * *';
      case ScheduleFrequency.DAILY:
        return '0 8 * * *';
      case ScheduleFrequency.WEEKLY:
        return '0 8 * * 1';
      default:
        return '0 8 * * *';
    }
  }

  private getNextRunDate(frequency: ScheduleFrequency): Date {
    const now = new Date();
    switch (frequency) {
      case ScheduleFrequency.HOURLY:
        return new Date(now.getTime() + 60 * 60 * 1000);
      case ScheduleFrequency.DAILY:
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(8, 0, 0, 0);
        return tomorrow;
      case ScheduleFrequency.WEEKLY:
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(8, 0, 0, 0);
        return nextWeek;
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  // Runs every hour and checks which schedules are due
  @Cron('0 * * * *')
  async runDueSchedules() {
    this.logger.log('Checking for due schedules...');
    const schedules = await this.schedulesRepository.find({
      where: { isActive: true },
    });
    const now = new Date();

    for (const schedule of schedules) {
      if (schedule.nextRunAt && new Date(schedule.nextRunAt) <= now) {
        this.logger.log(`Running scheduled test: ${schedule.name}`);
        try {
          if (schedule.platform === SchedulePlatform.WEB) {
            await this.executionService.queueWebTest(
              schedule.username,
              schedule.password,
              schedule.url,
              schedule.environment,
            );
          } else {
            await this.executionService.queueMobileTest(
              schedule.username,
              schedule.password,
            );
          }

          await this.schedulesRepository.update(schedule.id, {
            lastRunAt: now,
            nextRunAt: this.getNextRunDate(schedule.frequency),
          });
        } catch (error) {
          this.logger.error(
            `Failed to run schedule ${schedule.name}: ${error}`,
          );
        }
      }
    }
  }
}
