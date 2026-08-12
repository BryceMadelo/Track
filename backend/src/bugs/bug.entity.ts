import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../users/user.entity';
import { TestCase } from '../test-cases/test-case.entity';
import { Execution } from '../execution/execution.entity';

export enum BugStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  FIXED = 'fixed',
  CLOSED = 'closed',
  WONT_FIX = 'wont_fix',
}

export enum BugSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum BugPriority {
  URGENT = 'urgent',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

@Entity('bugs')
export class Bug {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'text', nullable: true })
  stepsToReproduce!: string;

  @Column({ type: 'text', nullable: true })
  expectedBehavior!: string;

  @Column({ type: 'text', nullable: true })
  actualBehavior!: string;

  @Column({
    type: 'enum',
    enum: BugStatus,
    default: BugStatus.OPEN,
  })
  status!: BugStatus;

  @Column({
    type: 'enum',
    enum: BugSeverity,
    default: BugSeverity.MEDIUM,
  })
  severity!: BugSeverity;

  @Column({
    type: 'enum',
    enum: BugPriority,
    default: BugPriority.MEDIUM,
  })
  priority!: BugPriority;

  @Column({ nullable: true })
  environment!: string;

  @Column({ nullable: true })
  version!: string;

  @Column({ nullable: true })
  screenshot!: string;

  @ManyToOne(() => User, { nullable: true })
  reportedBy!: User;

  @ManyToOne(() => User, { nullable: true, eager: true })
  assignedTo!: User;

  @ManyToOne(() => TestCase, { nullable: true })
  linkedTestCase!: TestCase;

  @ManyToOne(() => Execution, { nullable: true })
  linkedExecution!: Execution;

  @Column({ type: 'text', nullable: true })
  resolution!: string;

  @Column({ nullable: true })
  resolvedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
