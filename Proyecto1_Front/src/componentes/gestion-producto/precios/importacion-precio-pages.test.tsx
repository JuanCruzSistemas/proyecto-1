import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ImportacionPreciosIveco from "./iveco/importacion-precios-iveco";
import ConsultarImportacionPreciosIveco from "./iveco/consultar-importacion-precios-iveco";
import ImportacionPreciosNexPro from "./nex-pro/importacion-precios-nex-pro";
import ConsultarImportacionPreciosNexPro from "./nex-pro/consultar-importacion-precios-nex-pro";

vi.mock("./iveco/importacion-precios-iveco-form", () => ({
  default: ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => (
    <div>
      <button onClick={onSuccess}>Completar importación IVECO</button>
      <button onClick={onClose}>Cerrar formulario IVECO</button>
    </div>
  ),
}));

vi.mock("./nex-pro/importacion-precios-nex-pro-form", () => ({
  default: ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => (
    <div>
      <button onClick={onSuccess}>Completar importación NEXPRO</button>
      <button onClick={onClose}>Cerrar formulario NEXPRO</button>
    </div>
  ),
}));

describe.each([
  {
    name: "IVECO",
    container: ImportacionPreciosIveco,
    page: ConsultarImportacionPreciosIveco,
    heading: "Importación de Productos Iveco",
    closeButton: "Cerrar formulario IVECO",
  },
  {
    name: "NEXPRO",
    container: ImportacionPreciosNexPro,
    page: ConsultarImportacionPreciosNexPro,
    heading: "Importación de Productos NexPro",
    closeButton: "Cerrar formulario NEXPRO",
  },
])("Importación $name", ({ container: Container, page: Page, heading, closeButton }) => {
  it("renderiza su página y abre el formulario desde la acción principal", () => {
    render(<Container />);

    expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Comenzar Importación" })).toBeInTheDocument();
  });

  it("abre y cierra el formulario de importación", () => {
    render(<Page />);

    fireEvent.click(screen.getByRole("button", { name: "Comenzar Importación" }));
    expect(screen.getByRole("button", { name: closeButton })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: closeButton }));
    expect(screen.queryByRole("button", { name: closeButton })).not.toBeInTheDocument();
  });
});