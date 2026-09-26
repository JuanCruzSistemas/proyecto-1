import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString } from "class-validator";


export class PresentacionDto {
  @ApiProperty({ example: 123, description: 'ID de la presentación' })
  @Type(() => Number)
  @IsInt()
  id: number;

  @ApiProperty({ example: 'CAJA X 12', description: 'Denominación de la presentación' })
  @IsString()
  denominacion: string;

  @ApiProperty({ example: '', description: 'Observaciones varias sobre la presentación' })
  @IsString()
  observacion: string;

  @ApiProperty({ example: null, description: 'Fecha de eliminación (null si está activa)', nullable: true })
  @IsOptional()
  deletedAt: string | null;
}
