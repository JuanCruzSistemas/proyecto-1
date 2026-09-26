import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import MarcasSelector from "./marcas-selector";
import LineasSelector from "./lineas-selector";
import PresentacionesSelector from "./presentacion-selector";

vi.mock("../../../../herramientas/reutilizables/entidad-selector-base", () => ({
  default: ({ titulo, denominacion, setDenominacion, onAgregar, error }: any) => <section>
    <h2>{titulo}</h2><input aria-label={titulo} value={denominacion} onChange={(event) => setDenominacion(event.target.value)} />
    {error && <p>{error}</p>}<button onClick={onAgregar}>Agregar {titulo}</button>
  </section>,
}));

describe("selectors simples de producto", () => {
  it("pasa props de marca y presentación al selector base", () => {
    const setBrand = vi.fn();
    const addBrand = vi.fn();
    const addPresentation = vi.fn();
    render(<>
      <MarcasSelector denominacionMarca="Marca" setDenominacionMarca={setBrand} denominacionMarcaRef={createRef<HTMLInputElement>()}
        selectMarcaRef={createRef<HTMLDivElement>()} marcas={[]} selectedMarca={null} marcaId={0} onEnterMarca={vi.fn()}
        onChangeMarca={vi.fn()} onAgregarMarca={addBrand} error="Marca requerida" />
      <PresentacionesSelector denominacionPresentacion="Unidad" setDenominacionPresentacion={vi.fn()} denominacionPresentacionRef={createRef<HTMLInputElement>()}
        selectPresentacionRef={createRef<HTMLDivElement>()} presentaciones={[]} selectedPresentacion={null} presentacionId={0}
        onEnterPresentacion={vi.fn()} onChangePresentacion={vi.fn()} onAgregarPresentacion={addPresentation} />
    </>);

    expect(screen.getByText("Marca requerida")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Marcas"), { target: { value: "Marca nueva" } });
    fireEvent.click(screen.getByRole("button", { name: "Agregar Marcas" }));
    fireEvent.click(screen.getByRole("button", { name: "Agregar Presentaciones" }));
    expect(setBrand).toHaveBeenCalledWith("Marca nueva");
    expect(addBrand).toHaveBeenCalledTimes(1);
    expect(addPresentation).toHaveBeenCalledTimes(1);
  });

  it("recorta espacios iniciales, informa errores y respeta disabled en línea", () => {
    const onChange = vi.fn();
    const onAdd = vi.fn();
    render(<LineasSelector denominacionLinea="" setDenominacionLinea={vi.fn()} denominacionLineaRef={createRef<HTMLInputElement>()}
      selectLineaRef={createRef<HTMLDivElement>()} lineas={[]} selectedLinea={null} lineaId={0} disabled errors={{ lineaId: { message: "Línea requerida" } }}
      onEnterDenominacion={vi.fn()} onEnterLinea={vi.fn()} onLineaChange={onChange} onAgregarLinea={onAdd} />);

    const input = screen.getByPlaceholderText("Denominación");
    fireEvent.change(input, { target: { value: "  Línea" } });
    expect(input).toBeDisabled();
    expect(screen.getByText("Línea requerida")).toBeInTheDocument();
    expect(screen.getByTitle("Agregar Línea")).toBeDisabled();
    expect(onAdd).not.toHaveBeenCalled();
  });
});