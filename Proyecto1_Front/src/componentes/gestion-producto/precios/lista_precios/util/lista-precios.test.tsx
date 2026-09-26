import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ListaPrecios from "./lista-precios";

const mocks = vi.hoisted(() => ({
  filtros: {
    setFiltrosNecesarios: vi.fn(),
    valoresFiltros: { denominacionMarca: "", denominacionLinea: "", marcaId: undefined, lineaId: undefined, sublineaId: undefined },
    setValoresFiltros: vi.fn(),
    limpiarFiltros: vi.fn(),
    setBuscar: vi.fn(),
    buscarMarcas: 0,
    buscarLineas: 0,
  },
  catalogos: { marcas: [], lineas: [], sublineas: [], setLineas: vi.fn(), setMarcas: vi.fn(), setSublineas: vi.fn() },
  hook: {
    productos: [{ id: 1, denominacion: "Producto uno", precioOcasionalConIva: 100 }],
    loading: false,
    setProductos: vi.fn(),
    buscarProductos: vi.fn(),
  },
  addAlert: vi.fn(),
  removeAlert: vi.fn(),
  obtenerTotales: vi.fn(),
  obtenerTotalesPara: vi.fn(),
  imprimirListaPrecios: vi.fn(),
}));

vi.mock("../../../../sistema/ConfiguracionSistemaContext", () => ({ useConfiguracionSistema: () => ({ configuracion: { caracteresParaBusqueda: 3 } }) }));
vi.mock("../../../../../context/filtros-contesxt", () => ({ useFiltrosContext: () => mocks.filtros }));
vi.mock("../../../../../context/catalogos-context", () => ({ useCatalogosContext: () => mocks.catalogos }));
vi.mock("../../../../../utils/auth", () => ({ getUsuarioId: () => 5 }));
vi.mock("../service/lista-precios-service", () => ({ default: {
  obtenerTotales: mocks.obtenerTotales,
  obtenerTotalesPara: mocks.obtenerTotalesPara,
  imprimirListaPrecios: mocks.imprimirListaPrecios,
} }));
vi.mock("../hooks/useCambioPrecios", () => ({ useCambioPrecios: () => mocks.hook }));
vi.mock("../../../../herramientas/alertas/alertas", () => ({
  Alertas: () => <div />,
  TipoAlerta: { SUCCESS: "success", ERROR: "error" },
  TituloAlerta: { SUCCESS: "success", ERROR: "error" },
  useAlerts: () => ({ alerts: [], addAlert: mocks.addAlert, removeAlert: mocks.removeAlert }),
}));
vi.mock("../../../../herramientas/alertas/alertas-confirmacion", () => ({
  TipoAlertaConfirmacion: { DESTRUCTIVE: "destructive" },
  TituloAlertaConfirmacion: { DESTRUCTIVE: "confirm" },
  useConfirmation: () => ({ AlertasConfirmacion: () => <div /> }),
}));
vi.mock("../componentes/filtros-cambio-precios", () => ({
  default: (props: any) => <div>
    <button onClick={props.onBuscar}>Buscar lista</button>
    <button onClick={props.onLimpiarFiltros}>Limpiar lista</button>
    <button onClick={props.fetchMarcas}>Buscar marcas</button>
    <button onClick={props.fetchLineas}>Buscar líneas</button>
  </div>,
}));
vi.mock("../componentes/tabla-cambio-precios", () => ({ default: ({ productos }: any) => <div>{productos.map((p: any) => p.denominacion).join(",")}</div> }));
vi.mock("../../../../herramientas/reutilizables/columnas-imprimir", () => ({
  ColumnasImprimir: ({ columns, onImprimir }: any) => <button onClick={onImprimir}>Imprimir {columns.length}</button>,
}));

describe("ListaPrecios", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.filtros.valoresFiltros = { denominacionMarca: "", denominacionLinea: "", marcaId: undefined, lineaId: undefined, sublineaId: undefined };
    mocks.hook.loading = false;
    mocks.hook.productos = [{ id: 1, denominacion: "Producto uno", precioOcasionalConIva: 100 }];
    mocks.obtenerTotales.mockResolvedValue({ data: [{ id: 2, denominacion: "Catálogo" }] });
    mocks.obtenerTotalesPara.mockResolvedValue({ data: [] });
    mocks.imprimirListaPrecios.mockResolvedValue(new Blob(["pdf"]));
    vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:lista") });
    vi.stubGlobal("open", vi.fn());
  });

  it("busca por marca/línea y limpia filtros y productos", async () => {
    render(<ListaPrecios />);
    fireEvent.click(screen.getByRole("button", { name: "Buscar lista" }));
    expect(mocks.hook.buscarProductos).toHaveBeenCalledWith({ marcaId: undefined, lineaId: undefined, subLineaId: undefined });

    fireEvent.click(screen.getByRole("button", { name: "Limpiar lista" }));
    expect(mocks.filtros.setValoresFiltros).toHaveBeenCalledWith(expect.objectContaining({ marcaId: undefined, lineaId: undefined }));
    expect(mocks.catalogos.setSublineas).toHaveBeenCalledWith([]);
    expect(mocks.hook.setProductos).toHaveBeenCalledWith([]);
  });

  it("busca catálogos, imprime columnas seleccionadas y abre el PDF", async () => {
    mocks.filtros.valoresFiltros = { denominacionMarca: "MAR", denominacionLinea: "LIN", marcaId: 4, lineaId: 2, sublineaId: 3 };
    render(<ListaPrecios />);
    await waitFor(() => expect(mocks.obtenerTotales).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: /Imprimir/ }));

    await waitFor(() => expect(mocks.imprimirListaPrecios).toHaveBeenCalledWith(expect.objectContaining({
      marcaId: 4,
      lineaId: 2,
      subLineaId: 3,
      usuarioId: 5,
    })));
    expect(open).toHaveBeenCalledWith("blob:lista", "_blank");
  });

  it("muestra estado de carga y error de catálogo", async () => {
    mocks.hook.loading = true;
    const { unmount } = render(<ListaPrecios />);
    expect(screen.getByText("Cargando productos...")).toBeInTheDocument();
    unmount();

    mocks.hook.loading = false;
    mocks.filtros.valoresFiltros = { denominacionMarca: "MARCA", denominacionLinea: "", marcaId: undefined, lineaId: undefined };
    mocks.obtenerTotales.mockRejectedValueOnce(new Error("offline"));
    render(<ListaPrecios />);
    expect(await screen.findByText("No se pudieron cargar las marcas.")).toBeInTheDocument();
  });
});