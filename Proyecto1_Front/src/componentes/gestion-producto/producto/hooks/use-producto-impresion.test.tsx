import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useProductoImpresion } from "./use-producto-impresion";

const service = vi.hoisted(() => ({ imprimirTodo: vi.fn() }));
vi.mock("../services/producto-service", () => ({ default: service }));

describe("useProductoImpresion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:pdf") });
    vi.stubGlobal("open", vi.fn());
  });

  it("genera y abre el PDF de todos los productos", async () => {
    service.imprimirTodo.mockResolvedValueOnce(new Blob(["pdf"]));
    const { result } = renderHook(() => useProductoImpresion());

    await act(async () => result.current.handleImprimirTodo());

    expect(service.imprimirTodo).toHaveBeenCalledTimes(1);
    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(open).toHaveBeenCalledWith("blob:pdf", "_blank");
  });

  it("captura el error al imprimir todo", async () => {
    service.imprimirTodo.mockRejectedValueOnce(new Error("PDF no disponible"));
    const { result } = renderHook(() => useProductoImpresion());

    await expect(act(async () => result.current.handleImprimirTodo())).resolves.toBeUndefined();
    expect(open).not.toHaveBeenCalled();
  });

  it("imprime la página y captura fallos", async () => {
    service.imprimirTodo.mockResolvedValueOnce(new Blob(["pdf"]));
    const { result } = renderHook(() => useProductoImpresion());
    await act(async () => result.current.handleImprimirPagina());
    expect(open).toHaveBeenCalledWith("blob:pdf", "_blank");

    vi.clearAllMocks();
    service.imprimirTodo.mockRejectedValueOnce(new Error("offline"));
    await expect(act(async () => result.current.handleImprimirPagina())).resolves.toBeUndefined();
  });
});