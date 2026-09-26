import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useHistorialPrecio } from "./use-historial-precio";

const service = vi.hoisted(() => ({ obtenerHistorialPrecio: vi.fn() }));
vi.mock("../services/producto-service", () => ({ default: service }));

describe("useHistorialPrecio", () => {
  beforeEach(() => vi.clearAllMocks());

  it("ordena historial de más reciente a más antiguo", async () => {
    service.obtenerHistorialPrecio.mockResolvedValueOnce([
      { id: 1, fecha: "2025-01-01" },
      { id: 2, fecha: "2025-03-01" },
      { id: 3, fecha: "2025-02-01" },
    ]);
    const { result } = renderHook(() => useHistorialPrecio(7));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.historial.map((entry) => entry.id)).toEqual([2, 3, 1]);
    expect(result.current.error).toBeNull();
  });

  it("omite la carga con id inválido", async () => {
    const { result } = renderHook(() => useHistorialPrecio(0));
    await act(async () => result.current.recargar());
    expect(service.obtenerHistorialPrecio).not.toHaveBeenCalled();
    expect(result.current.historial).toEqual([]);
  });

  it("guarda el mensaje de error del servidor y siempre termina loading", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    service.obtenerHistorialPrecio.mockRejectedValueOnce({ response: { data: { message: "No autorizado" } } });
    const { result } = renderHook(() => useHistorialPrecio(7));

    await waitFor(() => expect(result.current.error).toBe("No autorizado"));
    expect(result.current.loading).toBe(false);
  });

  it("usa un mensaje fallback si el servidor no proporciona detalle", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    service.obtenerHistorialPrecio.mockRejectedValueOnce({});
    const { result } = renderHook(() => useHistorialPrecio(7));

    await waitFor(() => expect(result.current.error).toBe("No se pudo cargar el historial de precios."));
  });
});