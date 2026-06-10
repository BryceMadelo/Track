import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  QA_LEAD = 'qa_lead',
  QA_ENGINEER = 'qa_engineer',
  VIEWER = 'viewer',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  @Column({ nullable: true })
  fullName!: string;

  @Column({ nullable: true })
  email!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.QA_ENGINEER,
  })
  role!: UserRole;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  mustChangePassword!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}