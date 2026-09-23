import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNumber, Min } from "class-validator";

export enum TipoActualizacion {
  PORCENTAJE = 'PORCENTAJE',
  MONTO = 'MONTO',
}

export class AplicarCambiosMasivosDto {
  @ApiProperty({ 
    description: 'Lista de productos a simular provenientes de la grilla frontal',
    type: 'array'
  })
  @IsArray()
  items: any[]; // Recibe los ConsultarProductosCambioPreciosMasivo del frontend

  @ApiProperty({ example: 15, description: 'Valor del aumento (monto fijo o porcentaje)' })
  @IsNumber()
  @Min(0)
  valor: number;

  @ApiProperty({ enum: TipoActualizacion, example: TipoActualizacion.PORCENTAJE })
  @IsEnum(TipoActualizacion, { message: 'El tipo de actualización debe ser PORCENTAJE o MONTO' })
  tipoActualizacion: TipoActualizacion;
}