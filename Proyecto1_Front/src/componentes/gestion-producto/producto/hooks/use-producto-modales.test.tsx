import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useProductoModales } from "./use-producto-modales";

describe("useProductoModales", () => {
  it("inicia los modales cerrados, permite abrir y cerrar y cierra todos", () => {
    const { result } = renderHook(() => useProductoModales());
    expect(Object.values(result.current.abiertos).every((open) => !open)).toBe(true);

    act(() => {
      result.current.abrir("historial");
      result.current.abrir("actualizar");
    });
    expect(result.current.abiertos.historial).toBe(true);
    expect(result.current.abiertos.actualizar).toBe(true);

    act(() => result.current.cerrar("historial"));
    expect(result.current.abiertos.historial).toBe(false);
    expect(result.current.abiertos.actualizar).toBe(true);

    act(() => result.current.cerrarTodos());
    expect(Object.values(result.current.abiertos).every((open) => !open)).toBe(true);
  });
});