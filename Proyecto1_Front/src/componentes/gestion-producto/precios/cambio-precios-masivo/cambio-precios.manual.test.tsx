import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CambioPreciosManual from "./cambio-precios.manual";

describe("CambioPreciosManual", () => {
  const producto = {
    id: 7,
    codigoProveedor: "P-7",
    denominacion: "Producto siete",
    precio: 100,
    precioNuevo: 120,
    observacion: "Revisar",
  } as never;

  it("muestra precio actual y confirma el precio nuevo previsualizado", async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    render(<CambioPreciosManual producto={producto} onSuccess={onSuccess} onClose={onClose} />);

    expect(screen.getByDisplayValue("P-7")).toBeDisabled();
    expect(screen.getByDisplayValue("Producto siete")).toBeDisabled();
    expect(screen.getByText("Precio actual")).toBeInTheDocument();
    expect(screen.getByText("Precio nuevo")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({
      id: 7,
      precioNuevo: 120,
      dirty: true,
    })));

    fireEvent.click(screen.getAllByRole("button", { name: "×" })[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("rechaza un precio negativo ingresado mediante el control", async () => {
    const onSuccess = vi.fn();
    render(<CambioPreciosManual producto={{ ...producto, precioNuevo: undefined } as never} onSuccess={onSuccess} onClose={vi.fn()} />);
    const priceInput = document.querySelector<HTMLInputElement>('input[name="precioNuevo"]');
    expect(priceInput).not.toBeNull();
    fireEvent.change(priceInput!, { target: { value: "-5" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    await waitFor(() => expect(onSuccess).not.toHaveBeenCalled());
  });
});