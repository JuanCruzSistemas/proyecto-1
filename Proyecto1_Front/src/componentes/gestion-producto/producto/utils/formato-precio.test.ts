import { describe, expect, it } from "vitest";
import { calcularDiferenciaPorcentual, formatearPrecio } from "./formato-precio";

describe("formato y diferencias de precio", () => {
  it("formatea el precio en moneda argentina", () => {
    expect(formatearPrecio(1234.56)).toContain("1.234,56");
    expect(formatearPrecio(0)).toContain("0,00");
  });

  it("calcula aumentos y reducciones porcentuales", () => {
    expect(calcularDiferenciaPorcentual(100, 110)).toBe(10);
    expect(calcularDiferenciaPorcentual(100, 75)).toBe(-25);
  });

  it("devuelve Infinity si el precio anterior es cero", () => {
    expect(calcularDiferenciaPorcentual(0, 10)).toBe(Infinity);
  });
});