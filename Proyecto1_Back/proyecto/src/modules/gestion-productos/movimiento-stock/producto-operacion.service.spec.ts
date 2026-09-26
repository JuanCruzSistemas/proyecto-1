import { ProductoOperacionService } from './producto-operacion.service';

// El servicio es el scaffold de Nest CLI: todavía no tiene lógica ni persistencia (ver INFORME.md).
describe('ProductoOperacionService', () => {
  const service = new ProductoOperacionService();

  it('create() devuelve el texto de ejemplo', () => {
    expect(service.create({})).toBe('This action adds a new productoOperacion');
  });

  it('findAll() devuelve el texto de ejemplo', () => {
    expect(service.findAll()).toBe('This action returns all productoOperacion');
  });

  it('findOne(), update() y remove() incluyen el id recibido', () => {
    expect(service.findOne(3)).toBe('This action returns a #3 productoOperacion');
    expect(service.update(4, {})).toBe('This action updates a #4 productoOperacion');
    expect(service.remove(5)).toBe('This action removes a #5 productoOperacion');
  });
});
