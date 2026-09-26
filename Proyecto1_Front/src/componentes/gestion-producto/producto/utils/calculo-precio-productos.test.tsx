import { fireEvent, render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import CalculoPreciosProducto from "./calculo-precio-productos";

vi.mock("../../../herramientas/formateo-de-campos/price-input", () => ({
  default: ({ name, label, value, onChange, onKeyDown, disabled }: any) => (
    <label>
      {label}
      <input data-testid={name} value={value} disabled={disabled} onKeyDown={onKeyDown}
        onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  ),
}));
vi.mock("../../../herramientas/formateo-de-campos/porcentaje-input", () => ({
  default: ({ name, label, value, onChange, disabled }: any) => (
    <label>
      {label || name}
      <input data-testid={name} value={value} disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  ),
}));

function Harness({ producto, onCalculate }: { producto?: any; onCalculate: () => void }) {
  const methods = useForm({
    defaultValues: {
      costo: 100,
      precioOcasional: 110,
      precioMayorista: 120,
      precioCliente: 130,
      precioOferta: 90,
      porcentajeOcasional: 10,
      porcentajeMayorista: 20,
      porcentajeCliente: 30,
    },
  });
  return (
    <FormProvider {...methods}>
      <CalculoPreciosProducto producto={producto} onCalcularPrecios={onCalculate} />
      <output data-testid="costo-state">{methods.watch("costo")}</output>
      <output data-testid="ocasional-state">{methods.watch("precioOcasional")}</output>
    </FormProvider>
  );
}

describe("CalculoPreciosProducto", () => {
  it("actualiza valores y calcula tanto con botón como con Enter", () => {
    const onCalculate = vi.fn();
    render(<Harness onCalculate={onCalculate} />);

    fireEvent.change(screen.getByTestId("costo"), { target: { value: "150" } });
    fireEvent.change(screen.getByTestId("precioOcasional"), { target: { value: "165" } });
    expect(screen.getByTestId("costo-state")).toHaveTextContent("150");
    expect(screen.getByTestId("ocasional-state")).toHaveTextContent("165");

    fireEvent.click(screen.getByRole("button", { name: "Calcular" }));
    fireEvent.keyDown(screen.getByTestId("costo"), { key: "Enter" });
    expect(onCalculate).toHaveBeenCalledTimes(2);
  });

  it("deshabilita edición y cálculo cuando se edita un producto existente", () => {
    const onCalculate = vi.fn();
    render(<Harness producto={{ id: 3 }} onCalculate={onCalculate} />);

    expect(screen.getByTestId("costo")).toBeDisabled();
    expect(screen.getByTestId("porcentajeOcasional")).toBeDisabled();
    expect(screen.getByTestId("precioOcasional")).toBeDisabled();
    expect(screen.getByTestId("porcentajeMayorista")).toBeDisabled();
    expect(screen.getByTestId("precioMayorista")).toBeDisabled();
    expect(screen.getByTestId("porcentajeCliente")).toBeDisabled();
    expect(screen.getByTestId("precioCliente")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Calcular" })).toBeDisabled();
  });
});