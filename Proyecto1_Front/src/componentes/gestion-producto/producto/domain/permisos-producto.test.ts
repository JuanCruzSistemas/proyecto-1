import { describe, expect, it } from "vitest";
import { Rol } from "../../../../interfaces/generales/interfaces-generales";
import {
  puedeAgregarProducto,
  puedeEditarProducto,
  puedeEliminarProducto,
  puedeHacerAcciones,
  puedeVerPrecios,
  puedeVerProductos,
} from "./permisos-producto";

describe("permisos de producto", () => {
  it("permite al administrador administrar productos y precios", () => {
    const roles = [Rol.ADMINISTRADOR];

    expect(puedeAgregarProducto(roles)).toBe(true);
    expect(puedeEditarProducto(roles)).toBe(true);
    expect(puedeEliminarProducto(roles)).toBe(true);
    expect(puedeHacerAcciones(roles)).toBe(true);
    expect(puedeVerPrecios(roles)).toBe(true);
    expect(puedeVerProductos(roles)).toBe(true);
  });

  it.each([Rol.VENDEDOR, Rol.REPARTIDOR])("permite al rol %s consultar productos", (rol) => {
    expect(puedeVerProductos([rol])).toBe(true);
    expect(puedeVerPrecios([rol])).toBe(rol === Rol.VENDEDOR);
    expect(puedeEditarProducto([rol])).toBe(false);
    expect(puedeEliminarProducto([rol])).toBe(false);
    expect(puedeHacerAcciones([rol])).toBe(false);
    expect(puedeAgregarProducto([rol])).toBe(false);
  });

  it("deniega acciones a roles sin permisos de producto", () => {
    const roles = [Rol.COBRADOR];

    expect(puedeVerProductos(roles)).toBe(false);
    expect(puedeVerPrecios(roles)).toBe(false);
    expect(puedeAgregarProducto(roles)).toBe(false);
    expect(puedeEditarProducto(roles)).toBe(false);
    expect(puedeEliminarProducto(roles)).toBe(false);
    expect(puedeHacerAcciones(roles)).toBe(false);
  });
});