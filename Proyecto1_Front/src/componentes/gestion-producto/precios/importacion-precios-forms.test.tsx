import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ImportacionPreciosService from "./precios-service";
import ImportacionPreciosIvecoForm from "./iveco/importacion-precios-iveco-form";
import ImportacionPreciosNexProForm from "./nex-pro/importacion-precios-nex-pro-form";

const services = vi.hoisted(() => ({ importarPreciosIveco: vi.fn(), importarPreciosNextPro: vi.fn() }));
vi.mock("./precios-service", () => ({ default: services }));
vi.mock("../../sistema/ConfiguracionSistemaContext", () => ({ useConfiguracionSistema: () => ({ configuracion: { maximoDolar: 2000 } }) }));
vi.mock("../../../utils/auth", () => ({ getUsuarioId: () => 13 }));
vi.mock("../../../utils/errores", () => ({ parseApiError: () => "Error del servidor" }));
vi.mock("../../herramientas/formateo-de-campos/price-input", () => ({
  default: ({ name, value, onChange }: any) => <input aria-label="Cotización" data-testid={name} value={value ?? ""} onChange={(event) => onChange(Number(event.target.value))} />,
}));
vi.mock("./carga-archivo", () => ({
  default: ({ onFile }: any) => <button type="button" onClick={() => onFile(new File(["precios"], "precios.xlsx"))}>Seleccionar archivo</button>,
}));

describe.each([
  ["IVECO", ImportacionPreciosIvecoForm, "importarPreciosIveco"],
  ["NEXPRO", ImportacionPreciosNexProForm, "importarPreciosNextPro"],
] as const)("Importación %s", (_name, Form, serviceName) => {
  beforeEach(() => vi.clearAllMocks());

  it("no permite importar sin archivo y muestra error de cotización inválida", async () => {
    render(<Form onClose={vi.fn()} onSuccess={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Importar Productos" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Seleccionar archivo" }));
    fireEvent.change(screen.getByTestId("cotizacionDolar"), { target: { value: "900" } });
    fireEvent.click(screen.getByRole("button", { name: "Importar Productos" }));
    await waitFor(() => expect(services[serviceName]).not.toHaveBeenCalled());
    expect(services[serviceName]).not.toHaveBeenCalled();
  });

  it("importa con cotización válida y muestra respuesta de API exitosa", async () => {
    services[serviceName].mockResolvedValueOnce({ ok: true });
    const onSuccess = vi.fn();
    render(<Form onClose={vi.fn()} onSuccess={onSuccess} />);
    fireEvent.click(screen.getByRole("button", { name: "Seleccionar archivo" }));
    fireEvent.change(screen.getByTestId("cotizacionDolar"), { target: { value: "1200" } });
    fireEvent.click(screen.getByRole("button", { name: "Importar Productos" }));

    await waitFor(() => expect(services[serviceName]).toHaveBeenCalledWith(expect.any(File), {
      cotizacionDolar: 1200,
      usuarioId: 13,
    }));
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("¡Importación exitosa!")).toBeInTheDocument();
  });

  it("muestra el error de la API cuando falla la importación", async () => {
    services[serviceName].mockRejectedValueOnce(new Error("network"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<Form onClose={vi.fn()} onSuccess={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Seleccionar archivo" }));
    fireEvent.change(screen.getByTestId("cotizacionDolar"), { target: { value: "1200" } });
    fireEvent.click(screen.getByRole("button", { name: "Importar Productos" }));

    expect(await screen.findByText("Error del servidor")).toBeInTheDocument();
  });
});