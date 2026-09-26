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
  fetchMarcas: vi.fn(),
  fetchLineas: vi.fn(),
  onLimpiarFiltros: vi.fn(),
  ...overrides,
});

describe("FiltrosCambioPrecios masivo", () => {
  it("filtra por marca/línea y ofrece monto fijo firmado", () => {
    const props = baseProps();
    render(<FiltrosCambioPrecios {...props} />);

    fireEvent.change(screen.getByPlaceholderText("Buscar marca..."), { target: { value: "Mar" } });
    expect(props.setValoresFiltros).toHaveBeenCalledWith(expect.objectContaining({ denominacionMarca: "Mar" }));
    fireEvent.keyDown(screen.getByPlaceholderText("Buscar marca..."), { key: "Enter" });
    fireEvent.keyDown(screen.getByPlaceholderText("Buscar línea..."), { key: "Enter" });
    expect(props.fetchMarcas).toHaveBeenCalledTimes(1);
    expect(props.fetchLineas).toHaveBeenCalledTimes(1);

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

  it("oculta acciones opcionales y bloquea aplicar/guardar sin productos", () => {
    const props = baseProps({ productosLength: 0, onAplicarCambios: undefined, onGuardarCambios: undefined });
    render(<FiltrosCambioPrecios {...props} />);

    expect(screen.queryByRole("combobox", { name: "Tipo de actualización" })).not.toBeInTheDocument();
    expect(screen.queryByTitle("Aplicar cambios")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Guardar cambios")).not.toBeInTheDocument();
    expect(screen.getByTitle("Buscar productos")).toBeEnabled();
  });
});