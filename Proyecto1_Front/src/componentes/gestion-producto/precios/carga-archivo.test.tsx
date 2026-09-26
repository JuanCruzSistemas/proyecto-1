import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CargaArchivo from "./carga-archivo";

describe("CargaArchivo", () => {
  it("envía el archivo seleccionado", () => {
    const onFile = vi.fn();
    const { container } = render(<CargaArchivo onFile={onFile} />);
    const file = new File(["datos"], "precios.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]');

    fireEvent.change(fileInput!, { target: { files: [file] } });

    expect(onFile).toHaveBeenCalledWith(file);
    expect(screen.queryByText("Error al subir el archivo.")).not.toBeInTheDocument();
  });

  it("muestra un mensaje cuando el callback falla sincrónicamente", () => {
    const onFile = vi.fn(() => { throw new Error("upload failed"); });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(<CargaArchivo onFile={onFile} />);
    const file = new File(["datos"], "precios.xlsx");
    const fileInput = container.querySelector<HTMLInputElement>('input[type="file"]');

    fireEvent.change(fileInput!, { target: { files: [file] } });

    expect(screen.getByText("Error al subir el archivo.")).toBeInTheDocument();
  });
});