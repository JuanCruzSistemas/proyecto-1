import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductoService from "../services/producto-service";
import RegistrarProveedorForm from "./registrar-item-proveedor";
import RegistrarProductoAlternativoForm from "./registrar-item-prod-alternativo";

const service = vi.hoisted(() => ({ obtenerTotales: vi.fn() }));
vi.mock("../services/producto-service", () => ({ default: service }));
vi.mock("../../../../utils/auth", () => ({ getUsuarioId: () => 22 }));
vi.mock("react-select", () => ({
  default: ({ options, value, onChange, placeholder, isDisabled }: any) => <select aria-label={placeholder}
    value={value?.id ?? ""} disabled={isDisabled} onChange={(event) => onChange(options.find((option: any) => String(option.id) === event.target.value) ?? null)}>
    <option value="">Seleccione</option>
    {options.map((option: any) => <option key={option.id} value={option.id}>{option.denominacion ?? option.codigoProveedorDenominacion}</option>)}
  </select>,
}));

describe("RegistrarProveedorForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    service.obtenerTotales.mockResolvedValue({ data: [{ id: 4, denominacion: "Proveedor Uno" }] });
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("busca catálogo y agrega proveedor seleccionado al payload y tabla", async () => {
    const onAddItem = vi.fn();
    const onItemSinAgregar = vi.fn();
    const { container } = render(<RegistrarProveedorForm itemsProveedor={[]} onAddItem={onAddItem} onDeleteItem={vi.fn()} onItemSinAgregar={onItemSinAgregar} />);
    fireEvent.change(screen.getByPlaceholderText("proveedor"), { target: { value: "Proveedor" } });
    fireEvent.click(container.querySelector("button.hidden")!);
    await waitFor(() => expect(screen.getByRole("option", { name: "Proveedor Uno" })).toBeInTheDocument());
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "4" } });
    fireEvent.change(screen.getByPlaceholderText("Codigo Proveedor"), { target: { value: "EXT-4" } });
    fireEvent.click(screen.getByRole("button", { name: /Agregar proveedor/ }));

    await waitFor(() => expect(onAddItem).toHaveBeenCalledWith({
      usuarioCreatedId: 22,
      codigoProveedor: "EXT-4",
      proveedorId: 4,
    }));
    expect(screen.getAllByText("Proveedor Uno").length).toBeGreaterThan(0);
    expect(onItemSinAgregar).toHaveBeenCalledWith(true);
  });

  it("rechaza proveedor duplicado y elimina un proveedor existente", async () => {
    const onAddItem = vi.fn();
    const onDeleteItem = vi.fn();
    const { container } = render(<RegistrarProveedorForm
      itemsProveedor={[{ proveedorId: 4, proveedor: "Proveedor Uno", codigoProveedor: "EXT", sistema: 0 } as never]}
      onAddItem={onAddItem} onDeleteItem={onDeleteItem} onItemSinAgregar={vi.fn()}
    />);
    fireEvent.change(screen.getByPlaceholderText("proveedor"), { target: { value: "Proveedor" } });
    fireEvent.click(container.querySelector("button.hidden")!);
    await waitFor(() => expect(screen.getByRole("option", { name: "Proveedor Uno" })).toBeInTheDocument());
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "4" } });
    fireEvent.change(screen.getByPlaceholderText("Codigo Proveedor"), { target: { value: "DUP" } });
    fireEvent.click(screen.getByRole("button", { name: /Agregar proveedor/ }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith("Este proveedor ya fue agregado en otro ítem."));
    expect(onAddItem).not.toHaveBeenCalled();

    fireEvent.click(screen.getAllByRole("button", { name: "❌" })[0]);
    expect(onDeleteItem).toHaveBeenCalledWith(0);
  });
});

describe("RegistrarProductoAlternativoForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    service.obtenerTotales.mockResolvedValue({ data: [{ id: 5, codigoProveedorDenominacion: "ALT-5 Alternativo", denominacion: "Alternativo", codigoProveedor: "ALT-5", proveedor: "Marca" }] });
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("busca y agrega el producto alternativo seleccionado", async () => {
    const onAddItem = vi.fn();
    const onItemSinAgregar = vi.fn();
    const { container } = render(<RegistrarProductoAlternativoForm itemsProdAlternativo={[]} onAddItem={onAddItem} onDeleteItem={vi.fn()} marcaId={3} productoId={9} onItemSinAgregar={onItemSinAgregar} />);
    fireEvent.change(screen.getByPlaceholderText("Codigo"), { target: { value: "ALT" } });
    fireEvent.click(container.querySelector("button.hidden")!);
    await waitFor(() => expect(screen.getByRole("option", { name: "Alternativo" })).toBeInTheDocument());
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: /Agregar alternativo/ }));

    await waitFor(() => expect(onAddItem).toHaveBeenCalledWith({ usuarioCreatedId: 22, productoAlternativoId: 5 }));
    expect(screen.getAllByText("Alternativo").length).toBeGreaterThan(0);
    expect(onItemSinAgregar).toHaveBeenCalledWith(true);
  });

  it("bloquea búsqueda sin marca y rechaza alternativo duplicado", async () => {
    const onAddItem = vi.fn();
    const { container, rerender } = render(<RegistrarProductoAlternativoForm itemsProdAlternativo={[]} onAddItem={onAddItem} onDeleteItem={vi.fn()} marcaId={0} productoId={9} onItemSinAgregar={vi.fn()} />);
    expect(screen.getByPlaceholderText("Codigo")).toBeDisabled();
    expect(container.querySelector("button.hidden")).toBeDisabled();

    rerender(<RegistrarProductoAlternativoForm itemsProdAlternativo={[{ productoAlternativoId: 5, productoAlternativo: "Alternativo", proveedor: "Marca", codigoProveedorProductoAlternativo: "ALT-5", sistema: 0 } as never]} onAddItem={onAddItem} onDeleteItem={vi.fn()} marcaId={3} productoId={9} onItemSinAgregar={vi.fn()} />);
    await waitFor(() => expect(screen.getByPlaceholderText("Codigo")).toBeEnabled());
    fireEvent.change(screen.getByPlaceholderText("Codigo"), { target: { value: "ALT" } });
    fireEvent.click(container.querySelector("button.hidden")!);
    await waitFor(() => expect(screen.getByRole("option", { name: "Alternativo" })).toBeInTheDocument());
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: /Agregar alternativo/ }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith("Este producto ya fue agregado en otro ítem."));
    expect(onAddItem).not.toHaveBeenCalled();
  });
});