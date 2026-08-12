import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async createUser(
    username: string,
    password: string,
    fullName: string,
    email: string,
    role: UserRole = UserRole.QA_ENGINEER,
  ): Promise<User> {
    const existing = await this.findByUsername(username);
    if (existing) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      username,
      password: hashedPassword,
      fullName,
      email,
      role,
      mustChangePassword: true,
    });

    return this.usersRepository.save(user);
  }

  async changePassword(userId: number, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(userId, {
      password: hashedPassword,
      mustChangePassword: false,
    });
  }

  async seedAdmin(): Promise<void> {
    const existing = await this.findByUsername('admin');
    if (!existing) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = this.usersRepository.create({
        username: 'admin',
        password: hashedPassword,
        fullName: 'QATrack Admin',
        email: 'admin@qatrack.com',
        role: UserRole.ADMIN,
        mustChangePassword: false,
      });
      await this.usersRepository.save(admin);
      console.log('Admin user created: admin / admin123');
    }
  }
}
