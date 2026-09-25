import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UsePipes,
  Logger,
  Query,
  Put,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CreatePresentacionDto } from '../../../application/dto/create-presentacion.dto';
import { UpdatePresentacionDto } from '../../../application/dto/update-presentacion.dto';
import { NormalizeDenominacionPipe } from 'src/modules/common/pipes/normalize-denominations.pipe';
import { PaginationWithDenominacionDto } from 'src/modules/common/dto/busquedas/pagination-with-denominacion.dto';
import { Roles } from 'src/modules/gestion-usuario/auth/roles.decorator';
import { AuthGuard } from 'src/modules/gestion-usuario/auth/auth.guard';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PresentacionDto } from '../../../application/dto/presentacion.dto';
import { NormalizeDenominacionSearchPipe } from 'src/modules/common/pipes/normalize-denominations-search.pipe';
import { PresentacionService } from '../../../application/services/presentacion.service';

@ApiTags('Gestion Productos')
@Controller('presentacion')
@UseGuards(AuthGuard)
export class PresentacionController {
  private readonly logger = new Logger(PresentacionController.name);
  constructor(private readonly service: PresentacionService) {}

  private readonly ENTITY_NAME = 'Presentación';

  @Post()
  @Roles('Root', 'Administrador', 'Empleado')
  @UsePipes(NormalizeDenominacionPipe)
  create(@Body() createDto: CreatePresentacionDto) {
    this.logger.log(`Creando un nuevo ${this.ENTITY_NAME}...`);
    return this.service.create(createDto);
  }

  @Get()
  @Roles('Root', 'Administrador', 'Empleado')
  @UsePipes(NormalizeDenominacionSearchPipe)
  findBy(
    @Query() paginationDto: PaginationWithDenominacionDto,
  ) {
    this.logger.log(
      `Buscando ${this.ENTITY_NAME} con denominación: ${paginationDto.denominacion}`,
    );
    return this.service.findBy(paginationDto);
  }

  @Get('listado')
  @Roles('Root', 'Administrador', 'Empleado')
  findAllListado() {
    this.logger.log(`Listando ${this.ENTITY_NAME}...`);
    return this.service.findAllListado();
  }

  @Get(':id')
  @Roles('Root', 'Administrador', 'Empleado')
  @ApiOkResponse({ type: PresentacionDto })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<PresentacionDto> {
    this.logger.log(`Buscando ${this.ENTITY_NAME} con ID: ${id}`);
    return this.service.findDtoById(id);
  }

  @Put(':id')
  @Roles('Root', 'Administrador', 'Empleado')
  @UsePipes(NormalizeDenominacionPipe)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePresentacionDto,
  ) {
    this.logger.log(`Actualizando ${this.ENTITY_NAME} con ID: ${id}`);
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('Root', 'Administrador', 'Empleado')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Query('usuarioId', ParseIntPipe) usuarioId: number,
  ) {
    this.logger.warn(
      `Eliminando ${this.ENTITY_NAME} con ID: ${id} por usuario: ${usuarioId}`,
    );
    return this.service.remove(id, usuarioId);
  }
}
