import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductoService from "../services/producto-service";
import ConsultarProductos from "./consultar-producto";

const mocks = vi.hoisted(() => ({
  service: {
    obtener: vi.fn(),
    obtenerRapido: vi.fn(),
    obtenerTotales: vi.fn(),
    obtenerId: vi.fn(),
    eliminar: vi.fn(),
    obtenerAuditoria: vi.fn(),
  },
  filtros: {
    setFiltrosNecesarios: vi.fn(),
    valoresFiltros: { codigoProveedor: "", codigoReferencia: "", marcaId: undefined, proveedorId: undefined },
    setValoresFiltros: vi.fn(),
    limpiarFiltros: vi.fn(),
    buscar: { cont: 0, componente: "" },
    setBuscar: vi.fn(),
    setBusquedaRapida: vi.fn(),
  },
  catalogos: { setLineas: vi.fn(), setMarcas: vi.fn(), setProveedores: vi.fn() },
  setEntidadesTotales: vi.fn(),
  handlePageChange: vi.fn(),
  resetearPaginacion: vi.fn(),
  addAlert: vi.fn(),
  removeAlert: vi.fn(),
  showConfirmation: vi.fn(),
  printAll: vi.fn(),
  printPage: vi.fn(),
}));

vi.mock("../services/producto-service", () => ({ default: mocks.service }));
vi.mock("../../../../context/filtros-contesxt", () => ({ useFiltrosContext: () => mocks.filtros }));
vi.mock("../../../../context/catalogos-context", () => ({ useCatalogosContext: () => mocks.catalogos }));
vi.mock("../../../sistema/ConfiguracionSistemaContext", () => ({ useConfiguracionSistema: () => ({ configuracion: { caracteresParaBusqueda: 3 } }) }));
vi.mock("../../../../hooks/useFiltrosIniciales", () => ({ useFiltrosIniciales: () => ({ codigoProveedor: "", codigoReferencia: "" }) }));
vi.mock("../../../../hooks/use-paginacion", () => ({ usePaginacion: () => ({
  paginaActual: 1,
  entidadesTotales: 1,
  skip: 0,
  take: 10,
  setEntidadesTotales: mocks.setEntidadesTotales,
  handlePageChange: mocks.handlePageChange,
  resetearPaginacion: mocks.resetearPaginacion,
}) }));
vi.mock("../../../../utils/auth", () => ({ getRoles: () => [1], getUsuarioId: () => 6 }));
vi.mock("../../../herramientas/alertas/alertas", () => ({
  Alertas: () => <div />,
  TipoAlerta: { SUCCESS: "success", ERROR: "error" },
  TituloAlerta: { SUCCESS: "success", ERROR: "error" },
  useAlerts: () => ({ alerts: [], addAlert: mocks.addAlert, removeAlert: mocks.removeAlert }),
}));
vi.mock("../../../herramientas/alertas/alertas-confirmacion", () => ({
  TipoAlertaConfirmacion: { DESTRUCTIVE: "destructive" },
  TituloAlertaConfirmacion: { DESTRUCTIVE: "confirm" },
  useConfirmation: () => ({ showConfirmation: mocks.showConfirmation, AlertasConfirmacion: () => <div /> }),
}));
vi.mock("../hooks/use-producto-impresion", () => ({ useProductoImpresion: () => ({ handleImprimirTodo: mocks.printAll, handleImprimirPagina: mocks.printPage }) }));
vi.mock("../componentes/header-producto", () => ({ ProductosHeader: (props: any) => <div>
  <button onClick={() => props.onChangeCodigo("ABC")}>Código header</button>
  <button onClick={props.onBuscarRapido}>Búsqueda rápida</button>
  <button onClick={props.onNuevo}>Nuevo producto</button>
</div> }));
vi.mock("../componentes/header-producto-lg", () => ({ ProductosHeaderLg: () => <div /> }));
vi.mock("../componentes/filtros-busqueda-producto", () => ({
  FILTROS_TEXTO_VACIOS: { denominacion: "", lineaDenominacion: "", superlineaDenominacion: "" },
  FiltrosBusquedaProducto: (props: any) => <div>
    <button onClick={() => props.onChange({ ...props.valores, denominacion: "  cola  " })}>Cambiar texto</button>
    <button onClick={props.onBuscar}>Buscar por filtros</button>
    <button onClick={props.onLimpiar}>Limpiar búsqueda</button>
  </div>,
}));
vi.mock("../componentes/datos-tabla", () => ({ DatosTabla: (props: any) => <div>
  <span>{props.productos.map((p: any) => p.denominacion).join(",")}</span>
  <button onClick={() => props.onDelete(props.productos[0]?.id)}>Eliminar producto</button>
  <button onClick={() => props.onInfo(props.productos[0]?.id)}>Ver auditoría</button>
  <button onClick={() => props.onEditar(props.productos[0]?.id)}>Editar producto</button>
</div> }));
vi.mock("../componentes/datos-card", () => ({ DatosCard: ({ producto, onNotificar }: any) => <button onClick={() => onNotificar(producto)}>Notificar {producto.denominacion}</button> }));
vi.mock("../modales/producto-modales", () => ({ ProductosModales: (props: any) => <div>
  {props.isAltaOpen && <span>Alta abierta</span>}
  <button onClick={() => props.onSuccessAlta("Creado")}>Alta completada</button>
</div> }));
vi.mock("../../../NotificacionModal/modales/NotificacionModal", () => ({ NotificacionModal: ({ producto, onClose }: any) => <div>
  <span>Notificar {producto.denominacion}</span><button onClick={onClose}>Cerrar notificación</button>
</div> }));
vi.mock("../../../herramientas/reutilizables/paginacion", () => ({ default: ({ onChange }: any) => <button onClick={() => onChange(2)}>Página siguiente</button> }));
vi.mock("../../../herramientas/reutilizables/filtros-aplicados", () => ({ default: () => <div>Filtros aplicados</div> }));

describe("ConsultarProductos", () => {
  const producto = { id: 7, denominacion: "Cola", stock: 2, codigoProveedor: "C-7" };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.filtros.valoresFiltros = { codigoProveedor: "", codigoReferencia: "", marcaId: undefined, proveedorId: undefined };
    mocks.filtros.buscar = { cont: 0, componente: "" };
    mocks.service.obtener.mockResolvedValue({ data: [producto], total: 1 });
    mocks.service.obtenerRapido.mockResolvedValue({ data: [producto], total: 1 });
    mocks.service.obtenerTotales.mockResolvedValue({ data: [] });
    mocks.service.obtenerId.mockResolvedValue({ id: 7, denominacion: "Cola" });
    mocks.service.eliminar.mockResolvedValue({ mensaje: "Eliminado" });
    mocks.service.obtenerAuditoria.mockResolvedValue({ id: 7 });
    mocks.showConfirmation.mockResolvedValue(true);
  });

  it("inicializa filtros y carga productos por búsqueda aplicada", async () => {
    render(<ConsultarProductos />);
    await waitFor(() => expect(mocks.service.obtener).toHaveBeenCalled());
    expect(mocks.filtros.limpiarFiltros).toHaveBeenCalled();
    expect(mocks.filtros.setFiltrosNecesarios).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Cambiar texto" }));
    fireEvent.click(screen.getByRole("button", { name: "Buscar por filtros" }));
    await waitFor(() => expect(mocks.service.obtener).toHaveBeenLastCalledWith(expect.objectContaining({ denominacion: "cola" })));
    expect(screen.getByText("Cola")).toBeInTheDocument();
  });

  it("ejecuta búsqueda rápida y pagina resultados", async () => {
    render(<ConsultarProductos />);
    await waitFor(() => expect(mocks.service.obtener).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Código header" }));
    fireEvent.click(screen.getByRole("button", { name: "Búsqueda rápida" }));
    await waitFor(() => expect(mocks.service.obtenerRapido).toHaveBeenCalledWith(expect.objectContaining({ codigo: "ABC", exacto: true })));

    fireEvent.click(screen.getByRole("button", { name: "Página siguiente" }));
    expect(mocks.handlePageChange).toHaveBeenCalledWith(2);
  });

  it("muestra estado vacío/error y reacciona a error de consulta", async () => {
    mocks.service.obtener.mockRejectedValueOnce(new Error("offline"));
    render(<ConsultarProductos />);
    expect(await screen.findByText("No se pudieron cargar los productos. Intentá buscar nuevamente.")).toBeInTheDocument();
  });

  it("confirma eliminación, muestra éxito y abre/cierra notificación", async () => {
    render(<ConsultarProductos />);
    await waitFor(() => expect(screen.getByText("Cola")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Notificar Cola" }));
    expect(screen.getByRole("button", { name: "Cerrar notificación" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cerrar notificación" }));

    fireEvent.click(screen.getByRole("button", { name: "Eliminar producto" }));
    await waitFor(() => expect(mocks.service.eliminar).toHaveBeenCalledWith(7, 6));
    expect(mocks.addAlert).toHaveBeenCalledWith(expect.objectContaining({ message: "Eliminado" }));
  });

  it("mantiene producto y alerta de error si falla la eliminación", async () => {
    mocks.service.eliminar.mockRejectedValueOnce(new Error("conflict"));
    render(<ConsultarProductos />);
    await waitFor(() => expect(screen.getByText("Cola")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Eliminar producto" }));
    await waitFor(() => expect(mocks.addAlert).toHaveBeenCalledWith(expect.objectContaining({ type: "error" })));
  });
});