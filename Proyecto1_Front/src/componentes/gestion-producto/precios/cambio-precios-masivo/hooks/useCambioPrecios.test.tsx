import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCambioPrecios } from "./useCambioPrecios";

const service = vi.hoisted(() => ({
  obtener: vi.fn(),
  aplicarCambios: vi.fn(),
  guardarCambios: vi.fn(),
}));

vi.mock("../cambio-precios-masivo-service", () => ({ default: service }));

describe("useCambioPrecios", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("carga todo el catálogo en páginas de 500 productos", async () => {
    const firstPage = Array.from({ length: 500 }, (_, index) => ({ id: index + 1 }));
    service.obtener
      .mockResolvedValueOnce({ data: firstPage, total: 501 })
      .mockResolvedValueOnce({ data: [{ id: 501 }], total: 501 });
    const { result } = renderHook(() => useCambioPrecios(9));

    await act(async () => {
      await result.current.buscarProductos({ lineaId: 3 });
    });

    expect(service.obtener).toHaveBeenNthCalledWith(1, { lineaId: 3, skip: 0, take: 500 });
    expect(service.obtener).toHaveBeenNthCalledWith(2, { lineaId: 3, skip: 500, take: 500 });
    expect(result.current.productos).toHaveLength(501);
    expect(result.current.loading).toBe(false);
  });

  it("restablece loading y propaga un error de búsqueda", async () => {
    service.obtener.mockRejectedValueOnce(new Error("API sin conexión"));
    const { result } = renderHook(() => useCambioPrecios(9));

    await expect(act(async () => result.current.buscarProductos({}))).rejects.toThrow("API sin conexión");

    expect(result.current.loading).toBe(false);
  });

  it("aplica un cambio por porcentaje a los productos cargados", async () => {
    service.obtener.mockResolvedValueOnce({ data: [{ id: 1, precio: 100 }], total: 1 });
    service.aplicarCambios.mockResolvedValueOnce([{ id: 1, precio: 100, precioNuevo: 110 }]);
    const { result } = renderHook(() => useCambioPrecios(9));
    await act(async () => result.current.buscarProductos({ lineaId: 2 }));

    await act(async () => result.current.aplicarCambios(10, "PORCENTAJE"));

    expect(service.aplicarCambios).toHaveBeenCalledWith({
      items: [{ id: 1, precio: 100 }],
      valor: 10,
      tipoActualizacion: "PORCENTAJE",
    });
    expect(result.current.productos[0].precioNuevo).toBe(110);
  });

  it("guarda los productos junto con el usuario actual", async () => {
    service.obtener.mockResolvedValueOnce({ data: [{ id: 1, precio: 100 }], total: 1 });
    service.guardarCambios.mockResolvedValueOnce({ mensaje: "Guardado" });
    const { result } = renderHook(() => useCambioPrecios(12));
    await act(async () => result.current.buscarProductos({}));

    let response;
    await act(async () => {
      response = await result.current.guardarCambios();
    });

    expect(service.guardarCambios).toHaveBeenCalledWith({
      items: [{ id: 1, precio: 100 }],
      usuarioCreatedId: 12,
    });
    expect(response).toEqual({ mensaje: "Guardado" });
  });

  it("actualiza solo el producto local que coincide por id", async () => {
    service.obtener.mockResolvedValueOnce({ data: [{ id: 1 }, { id: 2 }], total: 2 });
    const { result } = renderHook(() => useCambioPrecios(null));
    await act(async () => result.current.buscarProductos({}));

    act(() => result.current.actualizarProductoLocal({ id: 2, precio: 80, precioNuevo: 90 } as never));

    expect(result.current.productos).toEqual([
      { id: 1 },
      { id: 2, precio: 80, precioNuevo: 90, dirty: true },
    ]);
  });
});