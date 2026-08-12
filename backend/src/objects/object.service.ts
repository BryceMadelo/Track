import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObjectEntity } from './object.entity';

@Injectable()
export class ObjectService {
  constructor(
    @InjectRepository(ObjectEntity)
    private readonly objectRepository: Repository<ObjectEntity>,
  ) {}

  async create(data: any): Promise<ObjectEntity> {
    const obj = this.objectRepository.create(data as Partial<ObjectEntity>);
    return this.objectRepository.save(obj);
  }

  async findAll(): Promise<ObjectEntity[]> {
    return this.objectRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<ObjectEntity> {
    const obj = await this.objectRepository.findOne({ where: { id } });
    if (!obj) throw new NotFoundException('Object not found');
    return obj;
  }

  async update(id: string, data: any): Promise<ObjectEntity> {
    const obj = await this.findOne(id);
    Object.assign(obj, data);
    return this.objectRepository.save(obj);
  }

  async remove(id: string): Promise<void> {
    const obj = await this.findOne(id);
    await this.objectRepository.remove(obj);
  }
}
