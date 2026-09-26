import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DatosCard } from "./datos-card";

const callbacks = () => ({
  onEditar: vi.fn(),
  onInfo: vi.fn(),
  onDelete: vi.fn(),
  onMovimientos: vi.fn(),
  onCambioPrecios: vi.fn(),
  onHistorial: vi.fn(),
});

describe("DatosCard", () => {
  it("muestra producto, precios y observación cuando existe", () => {
    render(<DatosCard
      producto={{ id: 1, denominacion: "Gaseosa", codigoProveedor: "A-1", stock: 3, precioOcasionalConIva: 10, precioClienteConIva: 20, precioMayoristaConIva: 15, precioOfertaConIva: 8, observacion: "Frío" } as never}
      {...callbacks()}
    />);

    expect(screen.getByText("Gaseosa")).toBeInTheDocument();
    expect(screen.getByText("Frío")).toBeInTheDocument();
    expect(screen.getByText("Precio Ocasional")).toBeInTheDocument();
    expect(screen.getByText("Precio Oferta")).toBeInTheDocument();
  });

  it("oculta observación y permite notificar si hay callback", () => {
    const onNotificar = vi.fn();
    render(<DatosCard producto={{ id: 5, denominacion: "Producto", stock: -1 } as never} {...callbacks()} onNotificar={onNotificar} />);

    expect(screen.queryByText("Observación")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTitle("Enviar notificación"));
    expect(onNotificar).toHaveBeenCalledWith(expect.objectContaining({ id: 5 }));
  });
});