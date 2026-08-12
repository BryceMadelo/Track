import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ScheduleFrequency {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  CUSTOM = 'custom',
}

export enum SchedulePlatform {
  WEB = 'web',
  MOBILE = 'mobile',
}

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'enum', enum: SchedulePlatform })
  platform!: SchedulePlatform;

  @Column({
    type: 'enum',
    enum: ScheduleFrequency,
    default: ScheduleFrequency.DAILY,
  })
  frequency!: ScheduleFrequency;

  @Column({ nullable: true })
  cronExpression!: string;

  @Column({ nullable: true })
  environment!: string;

  @Column({ nullable: true })
  url!: string;

  @Column({ nullable: true })
  username!: string;

  @Column({ nullable: true })
  password!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  lastRunAt!: Date;

  @Column({ nullable: true })
  nextRunAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
