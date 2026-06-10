import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards,
} from '@nestjs/common';
import { EnvironmentsService } from './environments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('environments')
@UseGuards(JwtAuthGuard)
export class EnvironmentsController {
  constructor(private readonly environmentsService: EnvironmentsService) {}

  @Get()
  findAll() {
    return this.environmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.environmentsService.findOne(+id);
  }

  @Post()
  create(@Body() body: {
    name: string;
    description?: string;
    webUrl: string;
    apiUrl?: string;
  }) {
    return this.environmentsService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.environmentsService.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.environmentsService.remove(+id);
  }
}