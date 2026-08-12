import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ScheduleFrequency, SchedulePlatform } from './schedule.entity';

@Controller('schedules')
@UseGuards(JwtAuthGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  findAll() {
    return this.schedulesService.findAll();
  }

  @Post()
  create(
    @Body()
    body: {
      name: string;
      platform: SchedulePlatform;
      frequency: ScheduleFrequency;
      environment?: string;
      url?: string;
      username: string;
      password: string;
    },
  ) {
    return this.schedulesService.create(body);
  }

  @Patch(':id/toggle')
  toggle(@Param('id') id: string) {
    return this.schedulesService.toggleActive(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schedulesService.remove(+id);
  }
}
