import { FormEvent } from 'react';
import { Search } from 'lucide-react';

export interface FiltrosTextoProducto {
  denominacion: string;
  lineaDenominacion: string;
  superlineaDenominacion: string;
}

export const FILTROS_TEXTO_VACIOS: FiltrosTextoProducto = {
  denominacion: '', lineaDenominacion: '', superlineaDenominacion: '',
};

interface Props {
  valores: FiltrosTextoProducto;
  onChange: (valores: FiltrosTextoProducto) => void;
  onBuscar: () => void;
  onLimpiar: () => void;
}

export function FiltrosBusquedaProducto({ valores, onChange, onBuscar, onLimpiar }: Props) {
  const campos = [
    ['denominacion', 'Denominación del producto', 'Ej.: cola'],
    ['lineaDenominacion', 'Línea', 'Ej.: gas'],
    ['superlineaDenominacion', 'SuperLínea', 'Ej.: bebidas'],
  ] as const;
  function submit(event: FormEvent) { event.preventDefault(); onBuscar(); }
  return <form onSubmit={submit} className="flex flex-wrap items-end gap-3 px-4 pb-3">
      {campos.map(([campo, etiqueta, ejemplo]) => <div key={campo} className="w-full sm:w-48">
        <label htmlFor={'filtro-producto-' + campo} className="block text-sm font-medium mb-1">{etiqueta}</label>
        <div className="relative">
        <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input id={'filtro-producto-' + campo} type="text" value={valores[campo]} placeholder={ejemplo}
          onChange={event => onChange({ ...valores, [campo]: event.target.value })}
          className="border rounded py-2 pl-9 pr-2 w-full dark:bg-slate-900 dark:border-slate-600" />
        </div>
      </div>)}
    <div className="flex gap-2">
      <button type="submit" className="rounded bg-blue-500 hover:bg-blue-600 text-white px-4 py-2">Buscar</button>
      <button type="button" onClick={onLimpiar} className="border rounded px-3 py-2">Limpiar</button>
    </div>
  </form>;
}
