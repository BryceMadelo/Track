import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';

export enum Platform {
  WEB = 'web',
  MOBILE = 'mobile',
  API = 'api',
}

export enum Priority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum AutomationStatus {
  AUTOMATED = 'automated',
  MANUAL = 'manual',
  IN_PROGRESS = 'in_progress',
}

@Entity('test_cases')
export class TestCase {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ nullable: true, type: 'text' })
  description!: string;

  @Column({ type: 'enum', enum: Platform })
  platform!: Platform;

  @Column({ type: 'enum', enum: Priority, default: Priority.MEDIUM })
  priority!: Priority;

  @Column({
    type: 'enum',
    enum: AutomationStatus,
    default: AutomationStatus.MANUAL,
  })
  automationStatus!: AutomationStatus;

  @Column({ nullable: true })
  tags!: string;

  @Column({ type: 'json', nullable: true })
  steps!: { order: number; action: string; expected: string }[];

  @Column({ nullable: true, type: 'text' })
  expectedResult!: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
