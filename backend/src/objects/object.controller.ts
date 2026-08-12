import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ObjectService } from './object.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('objects')
@UseGuards(JwtAuthGuard)
export class ObjectController {
  constructor(private readonly objectService: ObjectService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.objectService.create(createDto);
  }

  @Get()
  findAll() {
    return this.objectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.objectService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.objectService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.objectService.remove(id);
  }
}
