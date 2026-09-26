import ApiService from '../../../../utils/apiService';

export interface SuperlineaResumen {
  id: number;
  denominacion: string;
  observacion: string | null;
  sistema: number;
}
export interface SuperlineaPayload {
  denominacion: string;
  observacion: string | null;
}
const SuperlineaService = {
  listar: (): Promise<SuperlineaResumen[]> => ApiService.get('/superlinea'),
  crear: (data: SuperlineaPayload): Promise<SuperlineaResumen> => ApiService.post('/superlinea', data),
  actualizar: (id: number, data: SuperlineaPayload): Promise<SuperlineaResumen> => ApiService.put('/superlinea/' + id, data),
  eliminar: (id: number) => ApiService.delete('/superlinea/' + id),
};
export default SuperlineaService;
