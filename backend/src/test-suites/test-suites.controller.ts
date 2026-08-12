import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TestSuitesService } from './test-suites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SuiteType } from './test-suite.entity';

@Controller('test-suites')
@UseGuards(JwtAuthGuard)
export class TestSuitesController {
  constructor(private readonly testSuitesService: TestSuitesService) {}

  @Get()
  findAll() {
    return this.testSuitesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.testSuitesService.findOne(+id);
  }

  @Post()
  create(
    @Body()
    body: {
      name: string;
      description?: string;
      type?: SuiteType;
      testCaseIds?: number[];
    },
  ) {
    return this.testSuitesService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.testSuitesService.update(+id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.testSuitesService.remove(+id);
  }
}
