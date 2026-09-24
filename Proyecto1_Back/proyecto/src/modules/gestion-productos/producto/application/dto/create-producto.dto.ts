import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  Matches,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsInt,
  IsPositive,
  Min,
} from 'class-validator';

export class CreateProductoDto {
  @IsOptional()
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsString({ message: 'La denominación debe ser una cadena de texto.' }) // Valida que sea string
  @MaxLength(255, { message: 'La denominación no puede estar vacía.' })
  /*  @Matches(/^[A-Za-z0-9 áéíóúÁÉÍÓÚñÑ.\-/]+$/, {
    message:
      'La denominación solo puede contener letras, números, espacios, puntos, guiones y barras.',
  }) */
  @Matches(/^[\w áéíóúÁÉÍÓÚñÑ.\-/%]+$/, {
    message: 'La denominación contiene caracteres inválidos ',
  })
  denominacion?: string;

  @IsOptional()
  @IsString()
  observacion?: string;

  // si no tiene poner vacio
  @IsOptional()
  @IsString()
  codigoProveedor?: string;

  @IsOptional()
  @IsString()
  codigoBarra?: string;

  @IsOptional()
  @IsString()
  codigoReferencia?: string;

  @IsOptional()
  @IsString()
  ubicacion?: string;

  @IsBoolean()
  utilizaStockMinimo: boolean;

  @IsOptional()
  @IsInt({ message: 'El stock mínimo debe ser un número entero.' })
  @Min(0, { message: 'El stock mínimo no puede ser negativo.' })
  stockMinimo?: number;

  @IsOptional()
  @IsInt({ message: 'El stock debe ser un número entero.' })
  @Min(0, { message: 'El stock no puede ser negativo.' })
  stock?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  destacado?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  envioGratis?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'El costo debe ser un número.' })
  @IsPositive({ message: 'El costo debe ser mayor a 0.' })
  costo?: number;

  @IsBoolean()
  utilizaPack: boolean;

  @IsOptional()
  @IsInt()
  cantidadPorPack?: number;

  @IsNotEmpty({ message: 'La linea es obligatoria.' })
  @IsInt({ message: 'La linea  debe ser un número entero.' })
  lineaId: number;

  @IsNotEmpty({ message: 'La marca es obligatoria.' })
  @IsInt({ message: 'La marca  debe ser un número entero.' })
  marcaId: number;

  @IsOptional()
  @IsInt({ message: 'La presentación debe ser un número entero.' })
  presentacionId?: number;

  @IsOptional()
  @IsNumber()
  porcentaje?: number;

  @IsOptional()
  @IsNumber()
  precio: number;

  createdAt?: Date;

  @IsNotEmpty({ message: 'El usuarioCreatedId es obligatorio.' })
  @IsInt({ message: 'El usuarioCreatedId debe ser un número entero.' })
  usuarioCreatedId: number;
}
