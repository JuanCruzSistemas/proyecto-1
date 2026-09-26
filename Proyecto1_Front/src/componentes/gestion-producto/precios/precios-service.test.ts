import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import ImportacionPreciosService from "./precios-service";

vi.mock("axios", () => ({ default: { post: vi.fn() } }));
vi.mock("../../../utils/axiosConfig", () => ({ default: { apiUrl: "http://api.test/api" } }));

describe("ImportacionPreciosService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it.each([
    ["importarPreciosIveco", "http://api.test/api/importacion-lista-precios/upload-iveco"],
    ["importarPreciosNextPro", "http://api.test/api/importacion-lista-precios/upload-next-pro"],
  ])("envía archivo y metadatos a %s", async (method, url) => {
    localStorage.setItem("Token", "jwt-token");
    vi.mocked(axios.post).mockResolvedValueOnce({ data: { importacionId: 10 } });
    const file = new File(["contenido"], "precios.xlsx");
    const result = await ImportacionPreciosService[method as "importarPreciosIveco" | "importarPreciosNextPro"](
      file,
      { cotizacionDolar: 1200, usuarioId: 4 },
    );

    expect(result).toEqual({ importacionId: 10 });
    const [requestUrl, formData, config] = vi.mocked(axios.post).mock.calls[0];
    expect(requestUrl).toBe(url);
    expect(formData).toBeInstanceOf(FormData);
    expect((formData as FormData).get("file")).toBe(file);
    expect((formData as FormData).get("cotizacion")).toBe("1200");
    expect((formData as FormData).get("usuarioId")).toBe("4");
    expect(config).toEqual({ headers: { Authorization: "Bearer jwt-token" } });
  });

  it("omite autorización sin token y propaga el error del servidor", async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({ data: { ok: true } });
    await ImportacionPreciosService.importarPreciosIveco(new File(["x"], "x.xlsx"), {
      cotizacionDolar: 1,
      usuarioId: 2,
    });
    expect(vi.mocked(axios.post).mock.calls[0][2]).toEqual({ headers: {} });

    const error = new Error("formato inválido");
    vi.mocked(axios.post).mockRejectedValueOnce(error);
    await expect(ImportacionPreciosService.importarPreciosNextPro(new File(["x"], "x.xlsx"), {
      cotizacionDolar: 1,
      usuarioId: 2,
    })).rejects.toBe(error);
  });
});