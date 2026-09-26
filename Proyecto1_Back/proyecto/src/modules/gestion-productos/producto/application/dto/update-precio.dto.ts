import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class UpdatePrecioDto {
  
  @ApiProperty({ example: 100.5, description: 'Costo en moneda local' })
  @IsNumber()
  @Min(0.01, { message: 'El costo debe ser mayor a 0' })
  costo: number;

  @ApiProperty({ example: 10, description: 'Porcentaje de aumento (margen de ganancia)' })
  @IsNumber()
  @Min(0, { message: 'El porcentaje debe ser un número positivo o 0' })
  porcentaje: number;

  @ApiProperty({ example: 3, description: 'ID del usuario que realiza la actualización' })
  @IsNumber()
  usuarioId: number;

 @ApiProperty({ 
    example: 'Aumento de precios por inflación del proveedor', 
    description: 'Motivo del cambio de precio (obligatorio)' 
  })
  @IsNotEmpty({ message: 'El motivo es obligatorio' })
  @IsString()
  motivo: string;
}