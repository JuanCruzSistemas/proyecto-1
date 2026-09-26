import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FILTROS_TEXTO_VACIOS, FiltrosBusquedaProducto } from "./filtros-busqueda-producto";

describe("FiltrosBusquedaProducto", () => {
  it("actualiza filtros, ejecuta búsqueda con Enter/formulario y permite limpiar", () => {
    const onChange = vi.fn();
    const onBuscar = vi.fn();
    const onLimpiar = vi.fn();
    render(<FiltrosBusquedaProducto valores={FILTROS_TEXTO_VACIOS} onChange={onChange} onBuscar={onBuscar} onLimpiar={onLimpiar} />);

    fireEvent.change(screen.getByLabelText("Denominación del producto"), { target: { value: "cola" } });
    expect(onChange).toHaveBeenCalledWith({ ...FILTROS_TEXTO_VACIOS, denominacion: "cola" });
    fireEvent.change(screen.getByLabelText("Línea"), { target: { value: "gaseosas" } });
    expect(onChange).toHaveBeenCalledWith({ ...FILTROS_TEXTO_VACIOS, lineaDenominacion: "gaseosas" });
    fireEvent.change(screen.getByLabelText("SuperLínea"), { target: { value: "bebidas" } });
    expect(onChange).toHaveBeenCalledWith({ ...FILTROS_TEXTO_VACIOS, superlineaDenominacion: "bebidas" });

    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
    fireEvent.click(screen.getByRole("button", { name: "Limpiar" }));
    expect(onBuscar).toHaveBeenCalledTimes(1);
    expect(onLimpiar).toHaveBeenCalledTimes(1);
  });
});