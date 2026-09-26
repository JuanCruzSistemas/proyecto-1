import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductoService from "../services/producto-service";
import RegistrarActualizarProductoForm from "./registrar-actualizar-producto";

const service = vi.hoisted(() => ({ nuevo: vi.fn(), actualizar: vi.fn(), obtenerTotales: vi.fn() }));
vi.mock("../services/producto-service", () => ({ default: service }));
vi.mock("../../../sistema/ConfiguracionSistemaContext", () => ({ useConfiguracionSistema: () => ({ configuracion: {} }) }));
vi.mock("../../../herramientas/formateo-de-campos/movimiento-campos", () => ({ useEnterFocus: () => vi.fn() }));
vi.mock("../../../../utils/auth", () => ({ getUsuarioId: () => 17 }));
vi.mock("../../../../utils/errores", () => ({ parseApiError: () => "No se pudo guardar" }));
vi.mock("../../../herramientas/formateo-de-campos/form-input", () => ({
  default: ({ name, label, placeholder, disabled }: any) => <label>{label}<input name={name} placeholder={placeholder} disabled={disabled} /></label>,
}));
vi.mock("../../../herramientas/formateo-de-campos/price-input", () => ({
  default: ({ name, label, value, onChange, disabled }: any) => <label>{label}<input aria-label={label} data-testid={name} type="number" value={value} disabled={disabled} onChange={(event) => onChange(Number(event.target.value))} /></label>,
}));
vi.mock("../../../herramientas/formateo-de-campos/porcentaje-input", () => ({
  default: ({ name, label, value, onChange, disabled }: any) => <label>{label}<input aria-label={label} data-testid={name} type="number" value={value} disabled={disabled} onChange={(event) => onChange(Number(event.target.value))} /></label>,
}));
vi.mock("../../../herramientas/formateo-de-campos/cantidades-input", () => ({
  default: ({ name, label, value, onChange, disabled }: any) => <label>{label}<input aria-label={label} data-testid={name} type="number" value={value} disabled={disabled} onChange={(event) => onChange(Number(event.target.value))} /></label>,
}));
vi.mock("../componentes/configuracion/lineas-selector", () => ({ default: (props: any) => <button type="button" onClick={() => props.onLineaChange({ id: 2, stockMinimo: 0, utilizaStockMinimo: false })}>Elegir línea</button> }));
vi.mock("../componentes/configuracion/marcas-selector", () => ({ default: (props: any) => <button type="button" onClick={() => props.onChangeMarca({ id: 3 })}>Elegir marca</button> }));
vi.mock("../componentes/configuracion/presentacion-selector", () => ({ default: () => <div>Selector de presentación</div> }));
vi.mock("../../../ui/encabezadoFormularios", () => ({ default: ({ title, onClose }: any) => <header><h1>{title}</h1><button onClick={onClose}>Cerrar formulario</button></header> }));
vi.mock("../../marca/utils/registrar-actualizar-marca", () => ({ default: () => <div /> }));
vi.mock("../../linea/utils/registrar-actualizar-linea", () => ({ default: () => <div /> }));
vi.mock("../../presentacion/utils/registrar-actualizar-presentacion", () => ({ default: () => <div /> }));

describe("RegistrarActualizarProductoForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    service.obtenerTotales.mockResolvedValue({ data: [] });
    service.nuevo.mockResolvedValue({ mensaje: "Producto creado" });
  });

  it("crea producto con costo, marca y línea válidos", async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    render(<RegistrarActualizarProductoForm onSuccess={onSuccess} onClose={onClose} />);
    fireEvent.change(screen.getByTestId("costo"), { target: { value: "100" } });
    fireEvent.click(screen.getByRole("button", { name: "Elegir línea" }));
    fireEvent.click(screen.getByRole("button", { name: "Elegir marca" }));
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    await waitFor(() => expect(service.nuevo).toHaveBeenCalledWith(expect.objectContaining({
      costo: 100,
      lineaId: 2,
      marcaId: 3,
      usuarioCreatedId: 17,
    })));
    expect(onSuccess).toHaveBeenCalledWith("Producto creado");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("rechaza costo inválido y no llama al servicio", async () => {
    render(<RegistrarActualizarProductoForm onSuccess={vi.fn()} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Elegir línea" }));
    fireEvent.click(screen.getByRole("button", { name: "Elegir marca" }));
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    await waitFor(() => expect(service.nuevo).not.toHaveBeenCalled());
    expect(service.nuevo).not.toHaveBeenCalled();
  });

  it("muestra error de API cuando falla el alta", async () => {
    service.nuevo.mockRejectedValueOnce(new Error("conflict"));
    render(<RegistrarActualizarProductoForm onSuccess={vi.fn()} onClose={vi.fn()} />);
    fireEvent.change(screen.getByTestId("costo"), { target: { value: "100" } });
    fireEvent.click(screen.getByRole("button", { name: "Elegir línea" }));
    fireEvent.click(screen.getByRole("button", { name: "Elegir marca" }));
    fireEvent.click(screen.getByRole("button", { name: "Registrar" }));

    await waitFor(() => expect(screen.getByText("No se pudo guardar")).toBeInTheDocument());
  });
});