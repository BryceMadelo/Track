import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne,
} from 'typeorm';
import { TestSuite } from '../test-suites/test-suite.entity';
import { User } from '../users/user.entity';

export enum ExecutionStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  PASSED = 'passed',
  FAILED = 'failed',
}

export enum ExecutionPlatform {
  WEB = 'web',
  MOBILE = 'mobile',
  API = 'api',
}

@Entity('executions')
export class Execution {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: ExecutionStatus, default: ExecutionStatus.QUEUED })
  status!: ExecutionStatus;

  @Column({ type: 'enum', enum: ExecutionPlatform })
  platform!: ExecutionPlatform;

  @Column({ nullable: true })
  environment!: string;

  @Column({ nullable: true })
  jobId!: string;

  @Column({ nullable: true, type: 'text' })
  output!: string;

  @Column({ nullable: true, type: 'text' })
  error!: string;

  @Column({ nullable: true })
  duration!: number;

  @ManyToOne(() => TestSuite, { nullable: true })
  testSuite!: TestSuite;

  @ManyToOne(() => User, { nullable: true })
  triggeredBy!: User;

  @CreateDateColumn()
  startedAt!: Date;

  @Column({ nullable: true })
  finishedAt!: Date;
}