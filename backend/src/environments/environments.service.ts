import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Environment } from './environment.entity';

@Injectable()
export class EnvironmentsService {
  constructor(
    @InjectRepository(Environment)
    private environmentsRepository: Repository<Environment>,
  ) {}

  async findAll(): Promise<Environment[]> {
    return this.environmentsRepository.find({ where: { isActive: true } });
  }

  async findOne(id: number): Promise<Environment> {
    const env = await this.environmentsRepository.findOne({ where: { id } });
    if (!env) throw new NotFoundException(`Environment #${id} not found`);
    return env;
  }

  async create(data: {
    name: string;
    description?: string;
    webUrl: string;
    apiUrl?: string;
  }): Promise<Environment> {
    const env = this.environmentsRepository.create(data);
    return this.environmentsRepository.save(env);
  }

  async update(id: number, data: Partial<Environment>): Promise<Environment> {
    await this.environmentsRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.environmentsRepository.update(id, { isActive: false });
  }

  async seedDefaults(): Promise<void> {
    const count = await this.environmentsRepository.count();
    if (count === 0) {
      const defaults = [
        {
          name: 'Staging',
          description: 'QA testing environment',
          webUrl: 'https://ppgisportalsqa02/PPGISWEB_HYBRID_OSS/',
        },
        {
          name: 'Prebau',
          description: 'User acceptance testing',
          webUrl: 'https://ppgisportalsuat/PPGISWEB_HYBRID_OSS/',
        },
        {
          name: 'Production',
          description: 'Live production environment',
          webUrl: 'https://ppgisportals/PPGISWEB_HYBRID_OSS/',
        },
      ];
      for (const env of defaults) {
        await this.create(env);
      }
      console.log('✅ Default environments seeded');
    }
  }
}
