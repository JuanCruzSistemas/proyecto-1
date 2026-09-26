import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useProductoFiltros } from "./use-producto-filtros";

const filtros = vi.hoisted(() => ({
  limpiarFiltros: vi.fn(),
  setBuscar: vi.fn(),
  setFiltrosNecesarios: vi.fn(),
  setValoresFiltros: vi.fn(),
  valoresFiltros: { marcaId: 1 },
  buscar: {},
  setBusquedaRapida: vi.fn(),
}));
vi.mock("../../../../context/filtros-contesxt", () => ({ useFiltrosContext: () => filtros }));
vi.mock("../../../../hooks/useFiltrosIniciales", () => ({ useFiltrosIniciales: () => ({ lineaId: 4 }) }));

describe("useProductoFiltros", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reinicia e inicializa los filtros para la consulta de productos", async () => {
    const { result } = renderHook(() => useProductoFiltros());

    await waitFor(() => expect(result.current.filtrosInicializados).toBe(true));
    expect(filtros.limpiarFiltros).toHaveBeenCalledTimes(1);
    expect(filtros.setBuscar).toHaveBeenCalledWith({ cont: 0, componente: "consultar-producto" });
    expect(filtros.setFiltrosNecesarios).toHaveBeenCalledWith({
      denominacion: true,
      codigoProveedor: true,
      linea: true,
      marca: true,
      proveedor: true,
      conStock: true,
    });
    expect(filtros.setValoresFiltros).toHaveBeenCalledWith({ lineaId: 4 });
  });
});