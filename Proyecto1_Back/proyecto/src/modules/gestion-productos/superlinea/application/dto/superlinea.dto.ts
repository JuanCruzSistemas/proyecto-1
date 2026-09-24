import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SaveSuperlineaDto {
  @ApiProperty({ example: 'Bebidas' })
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString({ message: 'La denominación debe ser texto.' })
  @IsNotEmpty({ message: 'La denominación es obligatoria.' })
  @MaxLength(255, { message: 'La denominación admite hasta 255 caracteres.' })
  denominacion: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  observacion?: string | null;
}

export class SuperlineaDto {
  id: number;
  denominacion: string;
  observacion: string | null;
  sistema: number;
}
