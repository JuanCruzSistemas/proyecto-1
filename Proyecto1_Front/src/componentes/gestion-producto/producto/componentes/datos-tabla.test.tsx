import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DatosTabla } from "./datos-tabla";

vi.mock("../../../herramientas/tablas/tabla-flexible-ag-grid", () => ({
  TablaAGGrid: ({ data, actions }: any) => (
    <div data-testid="grid">
      {data[0]?.denominacion}
      {actions ? actions(data[0]) : <span>Sin acciones</span>}
    </div>
  ),
}));

describe("DatosTabla", () => {
  const producto = { id: 2, denominacion: "Producto tabla" } as never;
  const callbacks = () => ({ onEditar: vi.fn(), onInfo: vi.fn(), onDelete: vi.fn() });

  it("muestra acciones para usuarios autorizados", () => {
    const handlers = callbacks();
    render(<DatosTabla productos={[producto]} columns={[]} puedeAccionar {...handlers} />);
    fireEvent.click(screen.getByTitle("Editar producto"));
    expect(handlers.onEditar).toHaveBeenCalledWith(2);
    expect(screen.getByTitle("Ver información")).toBeInTheDocument();
  });

  it("no expone acciones si el usuario no puede accionar", () => {
    render(<DatosTabla productos={[producto]} columns={[]} puedeAccionar={false} {...callbacks()} />);
    expect(screen.getByText("Sin acciones")).toBeInTheDocument();
    expect(screen.queryByTitle("Editar producto")).not.toBeInTheDocument();
  });
});