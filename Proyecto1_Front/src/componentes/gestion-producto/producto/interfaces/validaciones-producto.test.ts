import { describe, expect, it } from "vitest";
import { schema, transformData, transformarItemsProdAlternativo, transformarItemsProveedor, validarCambioPrecio } from "./interfaces-validaciones-producto";
import { schema as schemaProveedor, transformData as transformarProveedor } from "./interfaces-validaciones-item-proveedor";
import { schema as schemaAlternativo, transformData as transformarAlternativo } from "./interfaces-validaciones-item-prod-alternativo";

describe("validación y transformación de productos", () => {
  it("acepta producto válido y normaliza denominación vacía", async () => {
    const data = await schema(false, false, false).validate({
      denominacion: "  Producto Uno  ",
      costo: 100,
      stock: 0,
      marcaId: 1,
      lineaId: 2,
    });

    expect(data.denominacion).toBe("producto uno");
    expect(data.stock).toBe(0);
  });

  it("acepta guion, porcentaje y guion bajo en la denominación", async () => {
    await expect(schema(false, false, false).validate({
      denominacion: "Modelo-A_10%",
      costo: 100,
      marcaId: 1,
      lineaId: 2,
    })).resolves.toMatchObject({ denominacion: "modelo-a_10%" });
  });

  it("rechaza costo cero/negativo, stock negativo y denominación inválida", async () => {
    const productSchema = schema(false, false, false);
    await expect(productSchema.validate({ costo: 0, marcaId: 1, lineaId: 2 })).rejects.toThrow("mayor a 0");
    await expect(productSchema.validate({ costo: 10, stock: -1, marcaId: 1, lineaId: 2 })).rejects.toThrow("stock no puede ser negativo");
    await expect(productSchema.validate({ costo: 10, denominacion: "Artículo@", marcaId: 1, lineaId: 2 })).rejects.toThrow("Solo se permiten letras");
  });

  it("requiere stock mínimo y cantidad de pack cuando sus opciones están activas", async () => {
    const productSchema = schema(true, true, false);
    await expect(productSchema.validate({ costo: 10, marcaId: 1, lineaId: 2 })).rejects.toThrow();
    await expect(productSchema.validate({ costo: 10, marcaId: 1, lineaId: 2, stockMinimo: -1, cantidadPorPack: 1 })).rejects.toThrow("stock mínimo no puede ser negativo");
    await expect(productSchema.validate({ costo: 10, marcaId: 1, lineaId: 2, stockMinimo: 0, cantidadPorPack: 0 })).rejects.toThrow("debe ser mayor a 0");
    await expect(productSchema.validate({ costo: 10, marcaId: 1, lineaId: 2, stockMinimo: 0, cantidadPorPack: 2 })).resolves.toBeDefined();
  });

  it("transforma producto y elementos relacionados al formato del formulario/payload", () => {
    const product = {
      denominacion: "Artículo",
      observacion: null,
      codigoProveedor: null,
      codigoReferencia: null,
      codigoBarra: null,
      stock: 4,
      costo: 100,
      porcentaje: 25,
      marca: { id: 5 },
      linea: { id: 6 },
      presentacion: null,
      stockMinimo: 1,
      cantidadPorPack: 2,
      utilizaStockMinimo: true,
      utilizaPack: true,
    } as never;
    const proveedorItems = [{ id: 1, codigoProveedor: "ABC", proveedorId: 2, usuarioCreatedId: 3 }];
    const alternativeItems = [{ id: 4, productoAlternativoId: 7, usuarioCreatedId: 8 }];

    expect(transformData(product)).toMatchObject({ marcaId: 5, lineaId: 6, codigoProveedor: "", observacion: null });
    expect(transformarItemsProveedor(proveedorItems)).toEqual([{ id: 1, codigoProveedor: "ABC", proveedorId: 2, usuarioCreatedId: 3 }]);
    expect(transformarItemsProdAlternativo(alternativeItems)).toEqual([{ id: 4, productoAlternativoId: 7, usuarioCreatedId: 8 }]);
  });

  it.each([
    [100, "ajuste", null],
    [0, "ajuste", "El precio debe ser mayor a 0"],
    [100, "   ", "Debe indicar un motivo"],
  ])("valida cambio de precio costo=%s motivo=%s", (costo, motivo, expected) => {
    expect(validarCambioPrecio(costo, motivo)).toBe(expected);
  });
});

describe("validación de productos relacionados", () => {
  it("valida y transforma un proveedor", async () => {
    await expect(schemaProveedor.validate({ codigoProveedor: "ABC", proveedorId: 2 })).resolves.toBeDefined();
    await expect(schemaProveedor.validate({ codigoProveedor: "", proveedorId: 2 })).rejects.toThrow();
    expect(transformarProveedor({ codigoProveedor: "", proveedorId: 2 } as never)).toEqual({ codigoProveedor: "", proveedorId: 2 });
  });

  it("valida y transforma un producto alternativo", async () => {
    await expect(schemaAlternativo.validate({ productoAlternativoId: 4 })).resolves.toBeDefined();
    await expect(schemaAlternativo.validate({ productoAlternativoId: undefined })).rejects.toThrow();
    expect(transformarAlternativo({ productoAlternativoId: 4 } as never)).toEqual({ productoAlternativoId: 4 });
  });
});