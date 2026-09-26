import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsEnum,
  IsNumber,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

export enum TipoActualizacion {
  PORCENTAJE = 'PORCENTAJE',
  MONTO = 'MONTO',
}

@ValidatorConstraint({ name: 'nonNegativePercentage', async: false })
class NonNegativePercentageConstraint implements ValidatorConstraintInterface {
  validate(value: number, args: ValidationArguments): boolean {
    const dto = args.object as AplicarCambiosMasivosDto;
    return dto.tipoActualizacion !== TipoActualizacion.PORCENTAJE || value >= 0;
  }

  defaultMessage(): string {
    return 'El porcentaje no puede ser negativo';
  }
}

export class AplicarCambiosMasivosDto {
  @ApiProperty({ 
    description: 'Lista de productos a simular provenientes de la grilla frontal',
    type: 'array'
  })
  @IsArray()
  items: any[]; // Recibe los ConsultarProductosCambioPreciosMasivo del frontend

  @ApiProperty({ example: 15, description: 'PORCENTAJE: nuevo margen que reemplaza al actual. MONTO: importe fijo a sumar al precio (puede ser negativo)' })
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Validate(NonNegativePercentageConstraint)
  valor: number;

  @ApiProperty({ enum: TipoActualizacion, example: TipoActualizacion.PORCENTAJE })
  @IsEnum(TipoActualizacion, { message: 'El tipo de actualización debe ser PORCENTAJE o MONTO' })
  tipoActualizacion: TipoActualizacion;
}