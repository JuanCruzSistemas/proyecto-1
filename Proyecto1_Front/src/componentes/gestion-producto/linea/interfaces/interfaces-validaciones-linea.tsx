import * as yup from "yup";
import { Linea } from "../../../../interfaces/gestion-producto/linea/interfaces-linea";

//===================== interfaces ============================================//

export interface FormValues {
  denominacion: string;
  observacion?: string | null;
  stockMinimo?: number;
  utilizaStockMinimo?: boolean;
}

export interface SublineasEnPayload {
  denominacion: string;
  observacion?: string | null;
  usuarioCreatedId: number;
}

//===================== schema de validacion ============================================//

export const schema = (utilizaStockMinimo: boolean) =>
  yup.object().shape({
    denominacion: yup
      .string()
      .trim()
      .lowercase()
      .required("La denominación es obligatoria.")
      .test("not-empty", "La denominación no puede estar vacía o contener solo espacios.", (value) => {
        return value !== undefined && value.trim().length > 0;
      })
      .max(255, "Máximo 255 caracteres.")
      .matches(/^[A-Za-z0-9 áéíóúÁÉÍÓÚñÑ]+$/, "Solo se permiten letras, números y espacios."),
    observacion: yup.string().optional().nullable(),
    stockMinimo: yup.number().when([], {
      is: () => utilizaStockMinimo,
      then: (schema) => schema.required("El stock mínimo es obligatorio.").min(0, "El stock mínimo no puede ser negativo."),
      otherwise: (schema) => schema.min(0, "El stock mínimo no puede ser negativo.").optional(),
    }),
    utilizaStockMinimo: yup.boolean().optional(),
   
  });

//===================== transform data ============================================//

export const transformData = (linea: Linea): FormValues => {
  return {
    denominacion: linea.denominacion,
    observacion: linea.observacion ?? null,
    stockMinimo: linea.stockMinimo ?? 0,
    utilizaStockMinimo: linea.utilizaStockMinimo ?? false,
  };
};

