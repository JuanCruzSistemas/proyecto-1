import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards, UseFilters } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/gestion-usuario/auth/auth.guard';
import { Roles } from 'src/modules/gestion-usuario/auth/roles.decorator';
import { SuperlineaService } from '../../../application/services/superlinea.service';
import { SaveSuperlineaDto } from '../../../application/dto/superlinea.dto';

import { SuperlineaDomainFilter } from '../superlinea-domain.filter';

@UseFilters(SuperlineaDomainFilter)
@ApiTags('SuperLíneas')
@Controller('superlinea')
@UseGuards(AuthGuard)
export class SuperlineaController {
  constructor(private readonly service: SuperlineaService) {}

  @Get()
  @Roles('Root', 'Administrador', 'Empleado')
  list() { return this.service.list(); }

  @Get(':id')
  @Roles('Root', 'Administrador', 'Empleado')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Post()
  @Roles('Root', 'Administrador')
  create(@Body() dto: SaveSuperlineaDto, @Req() request: { user: { id: number } }) {
    return this.service.create(dto, request.user.id);
  }

  @Put(':id')
  @Roles('Root', 'Administrador')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: SaveSuperlineaDto, @Req() request: { user: { id: number } }) {
    return this.service.update(id, dto, request.user.id);
  }

  @Delete(':id')
  @Roles('Root', 'Administrador')
  remove(@Param('id', ParseIntPipe) id: number, @Req() request: { user: { id: number } }) {
    return this.service.remove(id, request.user.id);
  }
}
