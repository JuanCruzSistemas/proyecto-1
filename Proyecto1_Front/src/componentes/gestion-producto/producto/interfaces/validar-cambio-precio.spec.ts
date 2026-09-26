import { validarCambioPrecio } from './interfaces-validaciones-producto';
import { describe, it, expect } from 'vitest';


describe('validarCambioPrecio', () => {
  it('debe retornar error si el costo es menor o igual a 0', () => {
    expect(validarCambioPrecio(0, 'Motivo válido')).toBe('El precio debe ser mayor a 0');
    expect(validarCambioPrecio(-10, 'Motivo válido')).toBe('El precio debe ser mayor a 0');
  });

  it('debe retornar error si el motivo no fue ingresado o está en blanco', () => {
    expect(validarCambioPrecio(100, '')).toBe('Debe indicar un motivo');
    expect(validarCambioPrecio(100, '   ')).toBe('Debe indicar un motivo');
  });

  it('debe retornar null cuando todos los valores son correctos', () => {
    expect(validarCambioPrecio(150, 'Aumento de proveedor')).toBeNull();
  });
});