import { Superlinea } from '../../domain/entities/superlinea.entity';
import { SuperlineaDto } from '../dto/superlinea.dto';

export class SuperlineaDtoMapper {
  static toDto(entity: Superlinea): SuperlineaDto {
    return {
      id: entity.getId()!,
      denominacion: entity.getDenominacion(),
      observacion: entity.getObservacion(),
      sistema: entity.getSistema(),
    };
  }
}
