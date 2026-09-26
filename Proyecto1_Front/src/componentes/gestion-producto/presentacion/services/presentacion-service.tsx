import { FormValues } from "../interfaces/interfaces-validaciones-presentacion";
import { createCrudService } from "../../../../utils/crudFactory";
import ApiService from "../../../../utils/apiService";

const baseService = createCrudService<FormValues>("presentacion");

const PresentacionService = {
  ...baseService,

  obtener: (filtros: any) => ApiService.get(`/presentacion`, filtros),
};

export default PresentacionService;
