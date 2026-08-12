import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BugsService } from './bugs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BugStatus, BugSeverity, BugPriority } from './bug.entity';

@Controller('bugs')
@UseGuards(JwtAuthGuard)
export class BugsController {
  constructor(private readonly bugsService: BugsService) {}

  @Get()
  findAll(@Query('status') status?: BugStatus) {
    if (status) return this.bugsService.findByStatus(status);
    return this.bugsService.findAll();
  }

  @Get('stats')
  getStats() {
    return this.bugsService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bugsService.findOne(+id);
  }

  @Post()
  create(
    @Body()
    body: {
      title: string;
      description?: string;
      stepsToReproduce?: string;
      expectedBehavior?: string;
      actualBehavior?: string;
      severity?: BugSeverity;
      priority?: BugPriority;
      environment?: string;
      version?: string;
      assignedToId?: number;
      reportedById?: number;
    },
  ) {
    return this.bugsService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.bugsService.update(+id, body);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: BugStatus; resolution?: string },
  ) {
    return this.bugsService.updateStatus(+id, body.status, body.resolution);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bugsService.remove(+id);
  }
}
