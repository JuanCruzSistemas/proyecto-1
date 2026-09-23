import { Body, Controller, Patch } from '@nestjs/common';
import { AplicarCambiosMasivosDto } from '../../../producto/application/dto/aplicar-cambios-masivos.dto';
import { AplicarCambioMasivoUseCase } from '../../../producto/application/use-cases/aplicar-cambio-masivo.use-case';
import { GuardarCambioMasivoUseCase } from '../../../producto/application/use-cases/guardar-cambio-masivo.use-case';
import { MessageFrontUtils } from '../../../../common/utils/message/message-front.util';

@Controller('cambio-precios')
export class CambioPreciosController {
  constructor(
    private readonly aplicarCambioMasivoUseCase: AplicarCambioMasivoUseCase,
    private readonly guardarCambioMasivoUseCase: GuardarCambioMasivoUseCase,
  ) {}

  @Patch('aplicar-cambios')
  async aplicarCambios(@Body() dto: AplicarCambiosMasivosDto) {
    // Este endpoint solo calcula los nuevos precios y los devuelve para que el frontend los muestre en la grilla.
    return await this.aplicarCambioMasivoUseCase.execute(dto);
  }

  @Patch('guardar-cambios')
  async guardarCambios(@Body() body: { items: any[]; usuarioCreatedId: number }) {
    // Este endpoint recibe los productos ya validados por el usuario y los guarda en la base de datos.
    await this.guardarCambioMasivoUseCase.execute(body.items, body.usuarioCreatedId);
    
    // Retornamos el formato de mensaje estándar que espera el frontend
    return MessageFrontUtils.createActualizacionPrecioMasiva('los productos seleccionados');
  }
}