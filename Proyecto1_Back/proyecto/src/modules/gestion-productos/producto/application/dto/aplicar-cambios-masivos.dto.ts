import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsNumber, Min, ValidateIf } from "class-validator";

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

  @ApiProperty({ example: 15, description: 'Valor del ajuste (monto fijo o porcentaje; el monto puede ser negativo)' })
  @IsNumber()
  @ValidateIf((dto: AplicarCambiosMasivosDto) => dto.tipoActualizacion === TipoActualizacion.PORCENTAJE)
  @Min(0, { message: 'El porcentaje no puede ser negativo' })
  valor: number;

  @ApiProperty({ enum: TipoActualizacion, example: TipoActualizacion.PORCENTAJE })
  @IsEnum(TipoActualizacion, { message: 'El tipo de actualización debe ser PORCENTAJE o MONTO' })
  tipoActualizacion: TipoActualizacion;
}