import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductoService from "../services/producto-service";
import ModalCambiarPrecio from "./modal-cambiar-precio";

vi.mock("../services/producto-service", () => ({ default: { actualizarPrecio: vi.fn() } }));

describe("ModalCambiarPrecio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("no renderiza cuando está cerrado", () => {
    const { container } = render(<ModalCambiarPrecio isOpen={false} productoId={1} onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("valida precio resultante y motivo antes de llamar la API", async () => {
    render(<ModalCambiarPrecio isOpen productoId={3} onClose={vi.fn()} onSuccess={vi.fn()} costoActual={0} porcentajeActual={0} />);
    fireEvent.change(screen.getByLabelText("Costo base:"), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText("Margen / Porcentaje (%):"), { target: { value: "10" } });
    fireEvent.submit(screen.getByRole("button", { name: "Guardar cambios" }).closest("form")!);
    expect(await screen.findByText("El precio resultante debe ser mayor a 0.")).toBeInTheDocument();
    expect(ProductoService.actualizarPrecio).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Costo base:"), { target: { value: "100" } });
    fireEvent.submit(screen.getByRole("button", { name: "Guardar cambios" }).closest("form")!);
    expect(await screen.findByText("Debe ingresar un motivo para registrar el cambio.")).toBeInTheDocument();
    expect(ProductoService.actualizarPrecio).not.toHaveBeenCalled();
  });

  it("actualiza precio con motivo y cierra al tener éxito", async () => {
    localStorage.setItem("UsuarioId", "9");
    vi.mocked(ProductoService.actualizarPrecio).mockResolvedValueOnce(undefined);
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    render(<ModalCambiarPrecio isOpen productoId={3} onClose={onClose} onSuccess={onSuccess} costoActual={100} porcentajeActual={10} />);
    fireEvent.change(screen.getByLabelText("Motivo del cambio (obligatorio):"), { target: { value: "   Revisión   " } });
    fireEvent.submit(screen.getByRole("button", { name: "Guardar cambios" }).closest("form")!);

    await waitFor(() => expect(ProductoService.actualizarPrecio).toHaveBeenCalledWith(3, 100, 10, "Revisión", 9));
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("muestra el error devuelto por la API y permanece abierto", async () => {
    vi.mocked(ProductoService.actualizarPrecio).mockRejectedValueOnce({ response: { data: { message: "No autorizado" } } });
    const onClose = vi.fn();
    render(<ModalCambiarPrecio isOpen productoId={3} onClose={onClose} onSuccess={vi.fn()} costoActual={100} porcentajeActual={10} />);
    fireEvent.change(screen.getByLabelText("Motivo del cambio (obligatorio):"), { target: { value: "Ajuste" } });
    fireEvent.submit(screen.getByRole("button", { name: "Guardar cambios" }).closest("form")!);

    expect(await screen.findByText("No autorizado")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});