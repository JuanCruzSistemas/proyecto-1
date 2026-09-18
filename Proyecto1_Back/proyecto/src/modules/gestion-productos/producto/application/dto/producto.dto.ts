import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsNumber,
  IsInt,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReferenciaDto } from 'src/modules/common/dto/referencia.dto';
/*
Se Utiliza cuando se necesita la entidad producto
*/
export class ProductoDto {
  @ApiProperty({ example: 123 })
  @Type(() => Number)
  @IsInt()
  id: number;

  @ApiProperty({
    example: 'Caja de tornillos',
    description:
      'Denominación o nombre del producto. Esta formado por la linea y la marca',
  })
  @IsString()
  denominacion: string;

  @ApiProperty()
  @IsString()
  observacion?: string;

  @ApiProperty()
  @IsString()
  codigoProveedor: string;

  @ApiProperty()
  @IsString()
  codigoBarra?: string;

  @ApiProperty()
  @IsInt()
  stock: number;

  @ApiProperty()
  @IsNumber()
  costo: number;

  @ApiProperty()
  @IsNumber()
  precio: number;

  @ApiProperty()
  @IsNumber()
  porcentaje: number;

  @ApiProperty()
  @IsBoolean()
  destacado: boolean;

  @ApiProperty()
  @IsBoolean()
  envioGratis: boolean;

  @ApiProperty({
    type: () => ReferenciaDto,
    description: 'Linea asociada al producto',
    required: true,
  })
  @ValidateNested()
  @Type(() => ReferenciaDto)
  linea?: ReferenciaDto;

  @ApiProperty({
    type: () => ReferenciaDto,
    description: 'Marca asociada al producto',
    required: true,
  })
  @ValidateNested()
  @Type(() => ReferenciaDto)
  marca?: ReferenciaDto;

  @ApiProperty({
    type: () => ReferenciaDto,
    description: 'proveedor asociada al producto',
    required: true,
  })
  @ValidateNested()
  @Type(() => ReferenciaDto)
  proveedor?: ReferenciaDto;

  @ApiProperty()
  @IsString()
  ubicacion: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  utilizaStockMinimo: boolean;

  @ApiPropertyOptional()
  @IsInt()
  stockMinimo: number;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  utilizaPack: boolean;

  @ApiPropertyOptional()
  @IsInt()
  cantidadPorPack: number;

  @ApiProperty({ example: 123 })
  @Type(() => Number)
  @IsInt()
  sistema: number;

  @IsString()
  codigoReferencia?: string;

}
