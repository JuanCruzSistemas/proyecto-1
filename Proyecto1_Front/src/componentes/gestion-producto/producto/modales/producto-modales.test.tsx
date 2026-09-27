import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductosModales } from "./producto-modales";

vi.mock("../utils/registrar-actualizar-producto", () => ({
  default: ({ producto }: any) => <div>{producto ? "Formulario edición" : "Formulario alta"}</div>,
}));
vi.mock("../../../herramientas/reutilizables/informacion-auditoria", () => ({
  default: () => <div>Modal auditoría</div>,
}));

vi.mock("./modal-cambiar-precio", () => ({
  default: ({ productoId }: any) => <div>Modal cambio precio {productoId}</div>,
}));
vi.mock("./modal-historial-precios", () => ({
  default: ({ productoId }: any) => <div>Modal historial {productoId}</div>,
}));

const baseProps = {
  isAltaOpen: false,
  mostrarActualizarProducto: false,
  mostrarInfoAuditoria: false,
  mostrarMovimientosStock: false,
  mostrarHistorialPrecios: false,
  mostrarCambioPrecios: false,
  mostrarProductosAlternativos: false,
  mostrarDeQuienEsAlternativo: false,
  productoSeleccionado: null,
  productoInfo: null,
  auditoria: null,
  onCloseAlta: vi.fn(),
  onCloseActualizar: vi.fn(),
  onCloseAuditoria: vi.fn(),
  onCloseMovimientosStock: vi.fn(),
  onCloseHistorialPrecios: vi.fn(),
  onCloseCambioPrecios: vi.fn(),
  onCloseProductosAlternativos: vi.fn(),
  onCloseDeQuienEsAlternativo: vi.fn(),
  onSuccessAlta: vi.fn(),
  onSuccessActualizar: vi.fn(),
  onRefetch: vi.fn(),
};

describe("ProductosModales", () => {
  it("no monta formularios si todos los modales están cerrados", () => {
    const { container } = render(<ProductosModales {...baseProps} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("muestra los formularios de alta/edición y auditoría según estado", () => {
    render(<ProductosModales
      {...baseProps}
      isAltaOpen
      mostrarActualizarProducto
      mostrarInfoAuditoria
      productoSeleccionado={{ id: 1 } as never}
      auditoria={{ id: 2 }}
    />);

    expect(screen.getByText("Formulario alta")).toBeInTheDocument();
    expect(screen.getByText("Formulario edición")).toBeInTheDocument();
    expect(screen.getByText("Modal auditoría")).toBeInTheDocument();
  });

  it("no muestra formulario de edición si no hay producto seleccionado", () => {
    render(<ProductosModales {...baseProps} mostrarActualizarProducto />);
    expect(screen.queryByText("Formulario edición")).not.toBeInTheDocument();
  });

  it("muestra una sola vez cambio de precio e historial usando productoInfo", () => {
    render(<ProductosModales
      {...baseProps}
      mostrarCambioPrecios
      mostrarHistorialPrecios
      productoInfo={{ id: 9, costo: 100, porcentaje: 30, denominacion: "Cola" }}
    />);

    expect(screen.getAllByText("Modal cambio precio 9")).toHaveLength(1);
    expect(screen.getAllByText("Modal historial 9")).toHaveLength(1);
  });

  it("no abre historial ni cambio de precio sin producto cargado", () => {
    const { container } = render(<ProductosModales
      {...baseProps}
      mostrarCambioPrecios
      mostrarHistorialPrecios
      productoInfo={{}}
    />);
    expect(container).toBeEmptyDOMElement();
  });
});
