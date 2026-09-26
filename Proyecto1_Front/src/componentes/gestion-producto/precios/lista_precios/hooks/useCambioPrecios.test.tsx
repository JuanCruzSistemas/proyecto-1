import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCambioPrecios } from "./useCambioPrecios";

const service = vi.hoisted(() => ({
  obtenerDesde: vi.fn(),
  aplicarCambios: vi.fn(),
  guardarCambios: vi.fn(),
}));

vi.mock("../service/lista-precios-service", () => ({ default: service }));

describe("useCambioPrecios de lista de precios", () => {
  beforeEach(() => vi.clearAllMocks());

  it("carga los productos filtrados", async () => {
    service.obtenerDesde.mockResolvedValueOnce({ data: [{ id: 2, precio: 50 }] });
    const { result } = renderHook(() => useCambioPrecios(7));

    await act(async () => result.current.buscarProductos({ lineaId: 4 }));

    expect(service.obtenerDesde).toHaveBeenCalledWith({ lineaId: 4 }, "productos");
    expect(result.current.productos).toEqual([{ id: 2, precio: 50 }]);
    expect(result.current.loading).toBe(false);
  });

  it("libera loading y propaga el error de búsqueda", async () => {
    service.obtenerDesde.mockRejectedValueOnce(new Error("fallo de búsqueda"));
    const { result } = renderHook(() => useCambioPrecios(7));

    await expect(act(async () => result.current.buscarProductos({}))).rejects.toThrow("fallo de búsqueda");

    expect(result.current.loading).toBe(false);
  });

  it("reemplaza los productos con la previsualización calculada", async () => {
    service.aplicarCambios.mockResolvedValueOnce([{ id: 2, precio: 50, precioNuevo: 55 }]);
    const { result } = renderHook(() => useCambioPrecios(7));
    act(() => result.current.setProductos([{ id: 2, precio: 50 }] as never));

    await act(async () => result.current.aplicarCambios(10, "PORCENTAJE"));

    expect(service.aplicarCambios).toHaveBeenCalledWith({
      items: [{ id: 2, precio: 50 }],
      valor: 10,
      tipoActualizacion: "PORCENTAJE",
    });
    expect(result.current.productos[0].precioNuevo).toBe(55);
    expect(result.current.loading).toBe(false);
  });

  it("libera loading y propaga el error al aplicar cambios", async () => {
    service.aplicarCambios.mockRejectedValueOnce(new Error("fallo de cálculo"));
    const { result } = renderHook(() => useCambioPrecios(7));

    await expect(act(async () => result.current.aplicarCambios(10, "MONTO"))).rejects.toThrow("fallo de cálculo");

    expect(result.current.loading).toBe(false);
  });

  it("guarda y limpia la marca dirty tras el éxito", async () => {
    service.guardarCambios.mockResolvedValueOnce({ mensaje: "guardado" });
    const { result } = renderHook(() => useCambioPrecios(7));
    act(() => result.current.setProductos([{ id: 2, dirty: true }] as never));

    let response;
    await act(async () => {
      response = await result.current.guardarCambios();
    });

    expect(service.guardarCambios).toHaveBeenCalledWith({
      items: [{ id: 2, dirty: true }],
      usuarioCreatedId: 7,
    });
    expect(response).toEqual({ mensaje: "guardado" });
    expect(result.current.productos).toEqual([{ id: 2, dirty: false }]);
    expect(result.current.loading).toBe(false);
  });

  it("libera loading y conserva los productos si falla el guardado", async () => {
    service.guardarCambios.mockRejectedValueOnce(new Error("fallo al guardar"));
    const { result } = renderHook(() => useCambioPrecios(7));
    const initialProducts = [{ id: 2, dirty: true }];
    act(() => result.current.setProductos(initialProducts as never));

    await expect(act(async () => result.current.guardarCambios())).rejects.toThrow("fallo al guardar");

    expect(result.current.productos).toEqual(initialProducts);
    expect(result.current.loading).toBe(false);
  });

  it("marca dirty solo el producto local con el mismo id", () => {
    const { result } = renderHook(() => useCambioPrecios(null));
    act(() => result.current.setProductos([{ id: 1 }, { id: 2 }] as never));

    act(() => result.current.actualizarProductoLocal({ id: 2, precio: 80 } as never));

    expect(result.current.productos).toEqual([
      { id: 1 },
      { id: 2, precio: 80, dirty: true },
    ]);
  });
});