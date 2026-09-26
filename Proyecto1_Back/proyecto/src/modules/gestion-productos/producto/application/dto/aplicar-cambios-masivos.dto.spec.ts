import { validate } from 'class-validator';
import { AplicarCambiosMasivosDto, TipoActualizacion } from './aplicar-cambios-masivos.dto';

describe('AplicarCambiosMasivosDto', () => {
  const crearDto = (valor: unknown, tipoActualizacion: TipoActualizacion) =>
    Object.assign(new AplicarCambiosMasivosDto(), {
      items: [],
      valor,
      tipoActualizacion,
    });

  it('acepta un monto fijo negativo', async () => {
    const errors = await validate(crearDto(-10, TipoActualizacion.MONTO));

    expect(errors).toHaveLength(0);
  });

  it('rechaza un porcentaje negativo', async () => {
    const errors = await validate(crearDto(-10, TipoActualizacion.PORCENTAJE));

    expect(errors.some((error) => error.property === 'valor')).toBe(true);
  });

  it('rechaza un monto que no sea numérico', async () => {
    const errors = await validate(crearDto('no-numérico', TipoActualizacion.MONTO));

    expect(errors.some((error) => error.property === 'valor')).toBe(true);
  });
});