import { FormEvent, useEffect, useState } from 'react';
import { Layers, Plus, Pencil, Trash } from 'lucide-react';
import { Card, CardContent } from '../../ui/Card';
import { Button } from '../../ui/Button';
import SuperlineaService, { SuperlineaResumen } from './services/superlinea-service';
import { parseApiError } from '../../../utils/errores';
import { TipoAlertaConfirmacion, TituloAlertaConfirmacion, useConfirmation } from '../../herramientas/alertas/alertas-confirmacion';

export default function ConsultarSuperlinea() {
  const [rows, setRows] = useState<SuperlineaResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<SuperlineaResumen | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [denominacion, setDenominacion] = useState('');
  const [observacion, setObservacion] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { showConfirmation, AlertasConfirmacion } = useConfirmation();

  async function load() {
    setLoading(true);
    try { setRows(await SuperlineaService.listar()); }
    catch (e) { setError(parseApiError(e)); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  function open(row: SuperlineaResumen | null) {
    setEditing(row);
    setDenominacion(row?.denominacion ?? '');
    setObservacion(row?.observacion ?? '');
    setFieldError('');
    setError('');
    setMessage('');
    setFormOpen(true);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    const nombre = denominacion.trim();
    if (!nombre) { setFieldError('La denominación es obligatoria.'); return; }
    if (nombre.length > 255) { setFieldError('La denominación admite hasta 255 caracteres.'); return; }
    setSaving(true);
    setError('');
    setFieldError('');
    try {
      const payload = { denominacion: nombre, observacion: observacion.trim() || null };
      if (editing) await SuperlineaService.actualizar(editing.id, payload);
      else await SuperlineaService.crear(payload);
      setFormOpen(false);
      setMessage(editing ? 'SuperLínea actualizada.' : 'SuperLínea creada.');
      await load();
    } catch (e) { setError(parseApiError(e)); }
    finally { setSaving(false); }
  }

  async function remove(row: SuperlineaResumen) {
    const confirmed = await showConfirmation({
      type: TipoAlertaConfirmacion.DESTRUCTIVE,
      title: TituloAlertaConfirmacion.DESTRUCTIVE,
      message: '¿Dar de baja la SuperLínea “' + row.denominacion + '”? Dejará de estar disponible para nuevas asignaciones.',
      confirmText: 'Dar de baja', cancelText: 'Cancelar', onConfirm: () => {},
    });
    if (!confirmed) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await SuperlineaService.eliminar(row.id);
      setMessage('SuperLínea dada de baja.');
      await load();
    } catch (e) { setError(parseApiError(e)); }
    finally { setSaving(false); }
  }

  return (
    <div className="w-full p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><Layers /> SuperLíneas</h1>
          <p className="text-gray-600">Clasificaciones que agrupan tus líneas de productos.</p>
        </div>
        <Button className="btn btn-dark" disabled={saving} onClick={() => open(null)}><Plus size={18} /> Nueva SuperLínea</Button>
      </div>

      {message && <p role="status" className="text-green-700">{message}</p>}
      {error && <div role="alert" className="text-red-600">{error}</div>}

      {formOpen && <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">{editing ? 'Editar SuperLínea' : 'Crear SuperLínea'}</h2>
          <form onSubmit={save} noValidate className="space-y-4">
            <fieldset disabled={saving} className="space-y-4">
              <div>
                <label htmlFor="superlinea-denominacion" className="block font-medium">Denominación *</label>
                <input id="superlinea-denominacion" value={denominacion} onChange={e => setDenominacion(e.target.value)}
                  maxLength={255} aria-required="true" aria-invalid={!!fieldError} aria-describedby="superlinea-error"
                  className="border rounded p-2 w-full" autoFocus />
                <p id="superlinea-error" className="text-red-600" role="alert">{fieldError}</p>
              </div>
              <div>
                <label htmlFor="superlinea-observacion" className="block font-medium">Observación</label>
                <textarea id="superlinea-observacion" value={observacion} onChange={e => setObservacion(e.target.value)} className="border rounded p-2 w-full" />
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="btn btn-dark">{saving ? 'Guardando…' : 'Guardar'}</Button>
                <Button type="button" onClick={() => setFormOpen(false)}>Cancelar</Button>
              </div>
            </fieldset>
          </form>
        </CardContent>
      </Card>}

      <Card><CardContent className="p-4">
        {loading ? <p role="status">Cargando SuperLíneas…</p> :
          rows.length === 0 ? <p>No hay SuperLíneas activas. Creá una para poder asignarla a tus líneas.</p> :
          <div className="overflow-x-auto"><table className="w-full text-left">
            <thead><tr className="border-b"><th className="p-3">Denominación</th><th className="p-3">Observación</th><th className="p-3">Acciones</th></tr></thead>
            <tbody>{rows.map(row => <tr key={row.id} className="border-b">
              <td className="p-3">{row.denominacion}</td><td className="p-3">{row.observacion ?? '—'}</td>
              <td className="p-3"><div className="flex gap-2">
                <Button disabled={saving || row.sistema === 1} aria-label={'Editar ' + row.denominacion} onClick={() => open(row)}><Pencil size={18} /></Button>
                <Button disabled={saving || row.sistema === 1} aria-label={'Dar de baja ' + row.denominacion} onClick={() => remove(row)}><Trash size={18} /></Button>
              </div></td>
            </tr>)}</tbody>
          </table></div>}
        {!loading && error && <Button onClick={() => { setError(''); void load(); }}>Volver a cargar</Button>}
      </CardContent></Card>
      <AlertasConfirmacion />
    </div>
  );
}
