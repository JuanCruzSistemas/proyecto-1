import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProductoActions } from "./producto-action";

describe("ProductoActions", () => {
  it("envía el id a información, edición y eliminación", () => {
    const onEditar = vi.fn();
    const onInfo = vi.fn();
    const onDelete = vi.fn();
    render(<ProductoActions producto={{ id: 12 } as never} onEditar={onEditar} onInfo={onInfo} onDelete={onDelete} />);

    fireEvent.click(screen.getByTitle("Ver información"));
    fireEvent.click(screen.getByTitle("Editar producto"));
    fireEvent.click(screen.getByTitle("Eliminar producto"));

    expect(onInfo).toHaveBeenCalledWith(12);
    expect(onEditar).toHaveBeenCalledWith(12);
    expect(onDelete).toHaveBeenCalledWith(12);
  });

  it("aplica alineación compacta cuando se solicita", () => {
    const { container } = render(<ProductoActions producto={{ id: 2 } as never} onEditar={vi.fn()} onInfo={vi.fn()} onDelete={vi.fn()} compact />);
    expect(container.firstElementChild?.className).toContain("justify-end");
  });
});