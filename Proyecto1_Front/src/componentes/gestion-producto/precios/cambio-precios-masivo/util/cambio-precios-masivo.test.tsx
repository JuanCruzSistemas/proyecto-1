import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CambioPreciosMasivo from "./cambio-precios-masivo";

const mocks = vi.hoisted(() => ({
  filtros: {
    setFiltrosNecesarios: vi.fn(),
    valoresFiltros: { denominacionMarca: "", denominacionLinea: "", marcaId: undefined, lineaId: undefined },
    setValoresFiltros: vi.fn(),
    limpiarFiltros: vi.fn(),
    setBuscar: vi.fn(),
    buscarMarcas: 0,
    buscarLineas: 0,
  },
  catalogos: { marcas: [], lineas: [], setLineas: vi.fn(), setMarcas: vi.fn() },
  hook: {
    productos: [{ id: 1, precio: 100, denominacion: "Producto uno" }],
    loading: false,
    setProductos: vi.fn(),
    buscarProductos: vi.fn(),
    refrescarProductos: vi.fn(),
    aplicarCambios: vi.fn(),
    guardarCambios: vi.fn(),
    actualizarProductoLocal: vi.fn(),
  },
  addAlert: vi.fn(),
  removeAlert: vi.fn(),
  showConfirmation: vi.fn(),
  obtenerTotales: vi.fn(),
}));

vi.mock("../../../../sistema/ConfiguracionSistemaContext", () => ({ useConfiguracionSistema: () => ({ configuracion: { caracteresParaBusqueda: 3 } }) }));
vi.mock("../../../../../context/filtros-contesxt", () => ({ useFiltrosContext: () => mocks.filtros }));
vi.mock("../../../../../context/catalogos-context", () => ({ useCatalogosContext: () => mocks.catalogos }));
vi.mock("../../../../../utils/auth", () => ({ getUsuarioId: () => 5 }));
vi.mock("../cambio-precios-masivo-service", () => ({ default: { obtenerTotales: mocks.obtenerTotales } }));
vi.mock("../hooks/useCambioPrecios", () => ({ useCambioPrecios: () => mocks.hook }));
vi.mock("../../../../herramientas/alertas/alertas", () => ({
  Alertas: ({ alerts }: any) => <div>{alerts.map((alert: any, index: number) => <p key={index}>{alert.message}</p>)}</div>,
  TipoAlerta: { SUCCESS: "success", ERROR: "error" },
  TituloAlerta: { SUCCESS: "ok", ERROR: "error" },
  useAlerts: () => ({ alerts: [], addAlert: mocks.addAlert, removeAlert: mocks.removeAlert }),
}));
vi.mock("../../../../herramientas/alertas/alertas-confirmacion", () => ({
  TipoAlertaConfirmacion: { DESTRUCTIVE: "destructive" },
  TituloAlertaConfirmacion: { DESTRUCTIVE: "confirm" },
  useConfirmation: () => ({ showConfirmation: mocks.showConfirmation, AlertasConfirmacion: () => <div /> }),
}));
vi.mock("../componentes/filtros-cambio-precios", () => ({
  default: (props: any) => <div>
    <button onClick={props.onBuscar}>Buscar productos</button>
    <button onClick={() => props.onAplicarCambios(-10, "MONTO")}>Aplicar monto negativo</button>
    <button onClick={props.onGuardarCambios}>Guardar cambios</button>
    <button onClick={props.fetchMarcas}>Buscar marcas</button>
    <button onClick={props.fetchLineas}>Buscar líneas</button>
    <button onClick={props.onLimpiarFiltros}>Limpiar filtros</button>
  </div>,
}));
vi.mock("../componentes/tabla-cambio-precios", () => ({
  default: ({ productos, onEditar, onEliminar }: any) => <div>
    <span>{productos.map((producto: any) => producto.denominacion).join(",")}</span>
    <button onClick={() => onEditar(productos[0])}>Editar fila</button>
    <button onClick={() => onEliminar(productos[0].id)}>Eliminar fila</button>
  </div>,
}));
vi.mock("../cambio-precios.manual", () => ({
  default: ({ producto, onSuccess, onClose }: any) => <div>
    <span>Edición: {producto.denominacion}</span>
    <button onClick={() => onSuccess({ ...producto, precioNuevo: 125 })}>Confirmar edición</button>
    <button onClick={onClose}>Cerrar edición</button>
  </div>,
}));

describe("CambioPreciosMasivo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.filtros.valoresFiltros = { denominacionMarca: "", denominacionLinea: "", marcaId: undefined, lineaId: undefined };
    mocks.hook.productos = [{ id: 1, precio: 100, denominacion: "Producto uno" }];
    mocks.hook.loading = false;
    mocks.showConfirmation.mockResolvedValue(true);
    mocks.hook.buscarProductos.mockResolvedValue(undefined);
    mocks.hook.aplicarCambios.mockResolvedValue(undefined);
    mocks.hook.guardarCambios.mockResolvedValue({ mensaje: "Precios guardados" });
    mocks.hook.refrescarProductos.mockResolvedValue(undefined);
  });

  it("busca global al abrir y ejecuta acciones con los filtros actuales", async () => {
    render(<CambioPreciosMasivo />);
    await waitFor(() => expect(mocks.hook.buscarProductos).toHaveBeenCalledWith({}));
    expect(mocks.filtros.setFiltrosNecesarios).toHaveBeenCalledWith({ marca: true, linea: true, sublinea: false });

    fireEvent.click(screen.getByRole("button", { name: "Buscar productos" }));
    fireEvent.click(screen.getByRole("button", { name: "Aplicar monto negativo" }));
    await waitFor(() => expect(mocks.hook.aplicarCambios).toHaveBeenCalledWith(-10, "MONTO"));

    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    await waitFor(() => expect(mocks.hook.guardarCambios).toHaveBeenCalledTimes(1));
    expect(mocks.hook.refrescarProductos).toHaveBeenCalledTimes(1);
  });

  it("muestra alertas para fallos de guardado y cálculo", async () => {
    mocks.hook.guardarCambios.mockRejectedValueOnce({ response: { data: { message: "Lote rechazado" } } });
    mocks.hook.aplicarCambios.mockRejectedValueOnce(new Error("Cálculo fallido"));
    render(<CambioPreciosMasivo />);

    fireEvent.click(screen.getByRole("button", { name: "Aplicar monto negativo" }));
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    await waitFor(() => expect(mocks.addAlert).toHaveBeenCalledWith(expect.objectContaining({ message: "Lote rechazado" })));
    expect(mocks.addAlert).toHaveBeenCalledWith(expect.objectContaining({ message: "No se pudieron calcular los nuevos precios." }));
    expect(mocks.hook.refrescarProductos).not.toHaveBeenCalled();
  });

  it("abre modal, actualiza fila, borra con confirmación y limpia filtros", async () => {
    render(<CambioPreciosMasivo />);
    fireEvent.click(screen.getByRole("button", { name: "Editar fila" }));
    expect(screen.getByText("Edición: Producto uno")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar edición" }));
    expect(mocks.hook.actualizarProductoLocal).toHaveBeenCalledWith(expect.objectContaining({ id: 1, precioNuevo: 125 }));

    fireEvent.click(screen.getByRole("button", { name: "Eliminar fila" }));
    await waitFor(() => expect(mocks.showConfirmation).toHaveBeenCalledTimes(1));
    expect(mocks.hook.setProductos).toHaveBeenCalledWith(expect.any(Function));

    fireEvent.click(screen.getByRole("button", { name: "Limpiar filtros" }));
    expect(mocks.catalogos.setMarcas).toHaveBeenCalledWith([]);
    expect(mocks.catalogos.setLineas).toHaveBeenCalledWith([]);
  });

  it("muestra estado de carga y error de búsqueda global", async () => {
    mocks.hook.loading = true;
    const { unmount } = render(<CambioPreciosMasivo />);
    expect(screen.getByText("Cargando productos...")).toBeInTheDocument();
    unmount();

    mocks.hook.loading = false;
    mocks.hook.buscarProductos.mockRejectedValueOnce({ response: { data: { message: ["API", "caída"] } } });
    render(<CambioPreciosMasivo />);
    await waitFor(() => expect(screen.getByText("API caída")).toBeInTheDocument());
  });
});