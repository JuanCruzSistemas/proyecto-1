import { ForbiddenException } from "@nestjs/common";

export function ensureNotSistemaEntity(sistema: number, entityName: string) {
  if (sistema === 1) {
    throw new ForbiddenException(`${entityName} marcado como del sistema y no puede ser modificado o eliminado`);
  }
}