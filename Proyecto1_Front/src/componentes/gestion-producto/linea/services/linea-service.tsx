import { createCrudService } from "../../../../utils/crudFactory";
import { FormValues } from "../interfaces/interfaces-validaciones-linea";
import SuperlineaService, { SuperlineaResumen } from "../../superlinea/services/superlinea-service";
import type { Linea } from "../../../../interfaces/gestion-producto/linea/interfaces-linea";

const baseService = createCrudService<FormValues>("linea");

function conSuperlinea(linea: Linea, catalogo: SuperlineaResumen[]): Linea {
  const asociada = catalogo.find(s => Number(s.id) === Number(linea.superlineaId));
  return {
    ...linea,
    superlinea: asociada
      ? { id: asociada.id, denominacion: asociada.denominacion }
      : { id: linea.superlineaId, denominacion: linea.superlineaId
        ? `SuperLínea #${linea.superlineaId} (no disponible)` : "Sin asignación" },
  };
}

const LineaService = {
  ...baseService,
  obtener: async (filtros: any) => {
    const [resultado, catalogo] = await Promise.all([
      baseService.obtener(filtros), SuperlineaService.listar(),
    ]);
    return { ...resultado, data: resultado.data.map((linea: Linea) => conSuperlinea(linea, catalogo)) };
  },
  obtenerId: async (id: number) => {
    const [linea, catalogo] = await Promise.all([
      baseService.obtenerId(id), SuperlineaService.listar(),
    ]);
    return conSuperlinea(linea, catalogo);
  },
};

export default LineaService;
