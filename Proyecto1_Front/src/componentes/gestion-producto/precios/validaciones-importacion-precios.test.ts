import { describe, expect, it } from "vitest";
import { crearSchemaValidacion as crearSchemaIveco } from "./iveco/interfaces-validaciones-precio-iveco";
import { crearSchemaValidacion as crearSchemaNexPro } from "./nex-pro/interfaces-validaciones-precio-nex-pro";

describe.each([
  ["Iveco", crearSchemaIveco],
  ["Nex Pro", crearSchemaNexPro],
])("validación de cotización %s", (_brand, createSchema) => {
  it("acepta cotización dentro del rango", async () => {
    await expect(createSchema(2000).validate({ cotizacionDolar: 1000 })).resolves.toMatchObject({ cotizacionDolar: 1000 });
  });

  it("rechaza valores obligatorios, bajos o superiores al máximo", async () => {
    const validationSchema = createSchema(2000);
    await expect(validationSchema.validate({})).rejects.toThrow("obligatoria");
    await expect(validationSchema.validate({ cotizacionDolar: 999 })).rejects.toThrow();
    await expect(validationSchema.validate({ cotizacionDolar: 2001 })).rejects.toThrow("no puede ser mayor");
  });
});