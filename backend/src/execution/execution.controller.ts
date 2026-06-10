import { Controller, Get, Post, Body, Param, HttpCode, UseGuards } from '@nestjs/common';
import { ExecutionService } from './execution.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('executions')
export class ExecutionController {
  constructor(private readonly executionService: ExecutionService) {}

  @Post('mobile')
  @HttpCode(200)
  async runMobile(@Body() body: {
    username: string;
    password: string;
  }) {
    return this.executionService.queueMobileTest(
      body.username,
      body.password,
    );
  }

  @Post('web')
  @HttpCode(200)
  async runWeb(@Body() body: {
    username: string;
    password: string;
    url: string;
    environment?: string;
  }) {
    return this.executionService.queueWebTest(
      body.username,
      body.password,
      body.url,
      body.environment,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.executionService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.executionService.findOne(+id);
  }

  @Post('web/visual')
  @HttpCode(200)
  async runVisualWeb(@Body() body: {
    username: string;
    password: string;
    url: string;
    environment?: string;
    engine: 'playwright' | 'selenium';
    featureTitle: string;
    scenarioTitle: string;
    steps: {
      keyword: string;
      title: string;
      description: string;
      captureScreenshot: boolean;
    }[];
  }) {
    return this.executionService.queueVisualWebTest(body);
  }
}