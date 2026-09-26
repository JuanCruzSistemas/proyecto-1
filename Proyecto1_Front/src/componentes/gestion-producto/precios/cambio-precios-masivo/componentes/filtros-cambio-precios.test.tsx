import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FiltrosCambioPrecios from "./filtros-cambio-precios";

const baseProps = (overrides: Record<string, unknown> = {}) => ({
  valoresFiltros: { denominacionMarca: "", denominacionLinea: "", marcaId: undefined, lineaId: undefined },
  setValoresFiltros: vi.fn(),
  marcas: [{ id: 1, denominacion: "Marca Uno" }],
  lineas: [{ id: 2, denominacion: "Línea Uno" }],
  productosLength: 2,
  onBuscar: vi.fn(),
  onAplicarCambios: vi.fn(),
  onGuardarCambios: vi.fn(),
  onLimpiarFiltros: vi.fn(),
  ...overrides,
});

describe("FiltrosCambioPrecios masivo", () => {
  it("filtra por marca/línea y ofrece monto fijo firmado", () => {
    const props = baseProps();
    render(<FiltrosCambioPrecios {...props} />);

    fireEvent.keyDown(screen.getByRole("combobox", { name: "Marca" }), { key: "ArrowDown" });
    fireEvent.click(screen.getByText("Marca Uno"));
    expect(props.setValoresFiltros).toHaveBeenCalledWith(expect.objectContaining({ marcaId: 1 }));
    fireEvent.keyDown(screen.getByRole("combobox", { name: "Línea" }), { key: "ArrowDown" });
    fireEvent.click(screen.getByText("Línea Uno"));
    expect(props.setValoresFiltros).toHaveBeenCalledWith(expect.objectContaining({ lineaId: 2 }));

    fireEvent.click(screen.getByTitle("Buscar productos"));
    fireEvent.click(screen.getByTitle("Limpiar filtros"));
    expect(props.onBuscar).toHaveBeenCalledTimes(1);
    expect(props.onLimpiarFiltros).toHaveBeenCalledTimes(1);

    fireEvent.change(screen.getByRole("combobox", { name: "Tipo de actualización" }), { target: { value: "MONTO" } });
    fireEvent.click(screen.getByTitle("Aplicar cambios"));
    fireEvent.click(screen.getByTitle("Guardar cambios"));
    expect(props.onAplicarCambios).toHaveBeenCalledWith(0, "MONTO");
    expect(props.onGuardarCambios).toHaveBeenCalledTimes(1);
  });

  it("filtra las opciones del desplegable al escribir, sin mínimo de caracteres", () => {
    const props = baseProps({
      marcas: [{ id: 1, denominacion: "3M" }, { id: 7, denominacion: "Bosch" }],
    });
    render(<FiltrosCambioPrecios {...props} />);

    fireEvent.change(screen.getByRole("combobox", { name: "Marca" }), { target: { value: "3" } });
    expect(screen.getByText("3M")).toBeInTheDocument();
    expect(screen.queryByText("Bosch")).not.toBeInTheDocument();
  });

  it("permite quitar la marca seleccionada", () => {
    const props = baseProps({
      valoresFiltros: { marcaId: 1, lineaId: undefined },
    });
    const { container } = render(<FiltrosCambioPrecios {...props} />);

    const limpiarMarca = container.querySelector('[class*="indicatorContainer"]') as HTMLElement;
    fireEvent.mouseDown(limpiarMarca, { button: 0 });
    expect(props.setValoresFiltros).toHaveBeenCalledWith(expect.objectContaining({ marcaId: undefined }));
  });

  it("oculta acciones opcionales y bloquea aplicar/guardar sin productos", () => {
    const props = baseProps({ productosLength: 0, onAplicarCambios: undefined, onGuardarCambios: undefined });
    render(<FiltrosCambioPrecios {...props} />);

    expect(screen.queryByRole("combobox", { name: "Tipo de actualización" })).not.toBeInTheDocument();
    expect(screen.queryByTitle("Aplicar cambios")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Guardar cambios")).not.toBeInTheDocument();
    expect(screen.getByTitle("Buscar productos")).toBeEnabled();
  });
});