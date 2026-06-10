import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToMany, JoinTable,
} from 'typeorm';
import { TestCase } from '../test-cases/test-case.entity';

export enum SuiteType {
  SMOKE = 'smoke',
  REGRESSION = 'regression',
  SANITY = 'sanity',
  RELEASE = 'release',
}

@Entity('test_suites')
export class TestSuite {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true, type: 'text' })
  description!: string;

  @Column({ type: 'enum', enum: SuiteType, default: SuiteType.REGRESSION })
  type!: SuiteType;

  @ManyToMany(() => TestCase)
  @JoinTable()
  testCases!: TestCase[];

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}