import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductosHeader } from "./header-producto";
import { ProductosHeaderLg } from "./header-producto-lg";

vi.mock("../../../herramientas/reutilizables/estadisticas-simples", () => ({
  EstadisticasSimples: ({ filtrados, mostrados }: any) => <div>{`Estadísticas ${filtrados}/${mostrados}`}</div>,
}));
vi.mock("../../../herramientas/reutilizables/impresion-form", () => ({
  ImpresionForm: ({ onImprimirTodo, onImprimirPagina }: any) => <div>
    <button onClick={onImprimirTodo}>Todo</button><button onClick={onImprimirPagina}>Página</button>
  </div>,
}));

const props = (roles: number[]) => ({
  roles,
  codigo: "",
  exacto: true,
  onChangeCodigo: vi.fn(),
  onChangeExacto: vi.fn(),
  onBuscarRapido: vi.fn(),
  onNuevo: vi.fn(),
  total: 20,
  mostrados: 10,
  paginaActual: 2,
  onImprimirTodo: vi.fn(),
  onImprimirPagina: vi.fn(),
});

describe("headers de producto", () => {
  it("muestra alta al administrador y propaga búsqueda, checkbox e impresión", () => {
    const headerProps = props([1]);
    render(<ProductosHeader {...headerProps} />);
    fireEvent.change(screen.getByPlaceholderText("Código..."), { target: { value: "ABC" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Añadir" }));
    fireEvent.click(screen.getByRole("button", { name: "Todo" }));
    expect(headerProps.onChangeCodigo).toHaveBeenCalledWith("ABC");
    expect(headerProps.onChangeExacto).toHaveBeenCalledWith(false);
    expect(headerProps.onNuevo).toHaveBeenCalledTimes(1);
    expect(headerProps.onImprimirTodo).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Estadísticas 20/10")).toBeInTheDocument();
  });

  it("oculta alta a no administradores y soporta Enter en header grande", () => {
    const headerProps = props([4]);
    const { rerender } = render(<ProductosHeader {...headerProps} />);
    expect(screen.queryByRole("button", { name: "Añadir" })).not.toBeInTheDocument();
    rerender(<ProductosHeaderLg {...headerProps} />);
    fireEvent.keyDown(screen.getByPlaceholderText("Código..."), { key: "Enter" });
    expect(headerProps.onBuscarRapido).toHaveBeenCalledTimes(1);
    expect(headerProps.onNuevo).not.toHaveBeenCalled();
  });
});