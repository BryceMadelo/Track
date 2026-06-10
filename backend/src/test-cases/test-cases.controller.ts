import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards,
} from '@nestjs/common';
import { TestCasesService } from './test-cases.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Platform, Priority, AutomationStatus } from './test-case.entity';

@Controller('test-cases')
@UseGuards(JwtAuthGuard)
export class TestCasesController {
  constructor(private readonly testCasesService: TestCasesService) {}

  @Get()
  findAll() {
    return this.testCasesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testCasesService.findOne(+id);
  }

  @Post()
  create(@Body() body: {
    title: string;
    description?: string;
    platform: Platform;
    priority?: Priority;
    automationStatus?: AutomationStatus;
    tags?: string;
    steps?: { order: number; action: string; expected: string }[];
    expectedResult?: string;
  }) {
    return this.testCasesService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.testCasesService.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testCasesService.remove(+id);
  }
}