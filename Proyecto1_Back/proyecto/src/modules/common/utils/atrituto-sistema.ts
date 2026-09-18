import { ForbiddenException } from "@nestjs/common";

//export interface SistemaEntity {
//  sistema?: number;
//}

export function ensureNotSistemaEntity(sistema: number, entityName: string) {
  if (sistema === 1) {
    throw new ForbiddenException(`${entityName} marcado como del sistema y no puede ser modificado o eliminado`);
  }
}