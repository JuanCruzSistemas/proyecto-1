export interface Presentacion {
  id: number;
  denominacion: string;
  observacion: string | null;
  deletedAt: string | null;
}

export interface DtoConsultarPresentacion {
  data: ConsultarPresentacion[];
  total: number;
}

export interface ConsultarPresentacion {
  id: number;
  denominacion: string;
  deletedAt?: string | null;
}

export interface SelectPresentacion {
  id: number;
  denominacion: string;
}
