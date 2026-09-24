import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsInt, IsNumber, IsString, Min } from 'class-validator';


export class HistorialPrecioDto {
  @ApiProperty({ 
    example: 1, 
    description: 'ID del registro de historial' 
  })
  @Type(() => Number)
  @IsInt()
  id: number;

  @ApiProperty({ 
    example: 150.50, 
    description: 'Precio anterior del producto' 
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precioAnterior: number;

  @ApiProperty({ 
    example: 175.75, 
    description: 'Precio nuevo del producto' 
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precioNuevo: number;

  @ApiProperty({ 
    example: 100.00, 
    description: 'Costo anterior del producto' 
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costoAnterior: number;

  @ApiProperty({ 
    example: 120.00, 
    description: 'Costo nuevo del producto' 
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costoNuevo: number;

  @ApiProperty({ 
    example: 0.50, 
    description: 'Margen de ganancia anterior (0.50 = 50%)' 
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  margenAnterior: number;

  @ApiProperty({ 
    example: 0.46, 
    description: 'Margen de ganancia nuevo (0.46 = 46%)' 
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  margenNuevo: number;

  @ApiProperty({ 
    example: 'Aumento de precios por inflación del proveedor', 
    description: 'Motivo del cambio de precio' 
  })
  @IsString()
  motivo: string;

  @ApiProperty({ 
    example: '2026-09-22T14:30:00.000Z', 
    description: 'Fecha y hora del cambio de precio' 
  })
  @Type(() => Date)
  @IsDate()
  fecha: Date;

  @ApiProperty({ 
    example: 'Juan Pérez', 
    description: 'Nombre del usuario que realizó el cambio' 
  })
  @IsString()
  usuarioNombre: string;

  @ApiProperty({ 
    example: 123, 
    description: 'ID del usuario que realizó el cambio' 
  })
  @Type(() => Number)
  @IsInt()
  usuarioId: number;
}
