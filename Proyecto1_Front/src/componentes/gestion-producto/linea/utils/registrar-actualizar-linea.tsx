import { useEffect, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CardContent, CardFooter } from "../../../ui/Card";
import { Button } from "../../../ui/Button";
import FormInput from "../../../herramientas/formateo-de-campos/form-input";
import React from "react";
import { Card } from "../../../ui/Card";
import { FormValues, schema, transformData } from "../interfaces/interfaces-validaciones-linea";
import LineaService from "../services/linea-service";
import { Linea } from "../../../../interfaces/gestion-producto/linea/interfaces-linea";

import { Layers, PlusCircle } from "lucide-react";
import { parseApiError } from "../../../../utils/errores";
import { ResponsePost } from "../../../../interfaces/generales/interfaces-generales";
import CantidadesInput from "../../../herramientas/formateo-de-campos/cantidades-input";
import { getUsuarioId } from "../../../../utils/auth";
import EncabezadoFormularios from "../../../ui/encabezadoFormularios";
import {
  TipoAlertaConfirmacion,
  TituloAlertaConfirmacion,
  useConfirmation,
} from "../../../herramientas/alertas/alertas-confirmacion";

import SuperlineaService, { SuperlineaResumen } from "../../superlinea/services/superlinea-service";

export default function RegistrarActualizarLineaForm({
  linea,
  onClose,
  onSuccess,
}: {
  linea?: Linea;
  onClose: () => void;
  onSuccess: (mensajeAlerta: string) => void;
}) {
  const [superlineas, setSuperlineas] = useState<SuperlineaResumen[]>([]);
  const [loadingSuperlineas, setLoadingSuperlineas] = useState(true);
  const [superlineasError, setSuperlineasError] = useState("");
  const usuarioId = getUsuarioId();
  const { showConfirmation, AlertasConfirmacion } = useConfirmation();
  const [rStockCritico, setStockCritico] = useState(false);

  const methods = useForm<FormValues>({
    resolver: yupResolver(schema(rStockCritico)) as any,
    defaultValues: linea ? transformData(linea) : { superlineaId: 0, utilizaStockMinimo: false, stockMinimo: 0 },
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    watch,
    setError,
  } = methods;

 
  useEffect(() => {
    let active = true;
    SuperlineaService.listar()
      .then(rows => { if (active) setSuperlineas(rows); })
      .catch(error => { if (active) setSuperlineasError(parseApiError(error)); })
      .finally(() => { if (active) setLoadingSuperlineas(false); });
    return () => { active = false; };
  }, []);

  const stockMinimo = watch("stockMinimo");
  const utilizaStockMinimo = watch("utilizaStockMinimo");

  useEffect(() => {
    if (!utilizaStockMinimo) {
      setValue("stockMinimo", 0);
    }
  }, [utilizaStockMinimo, setValue]);

  useEffect(() => {
    setStockCritico(utilizaStockMinimo || false);
  }, [utilizaStockMinimo]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (linea) {
          setValue("denominacion", linea.denominacion || "");
          setValue("superlineaId", linea.superlineaId);
          setValue("observacion", linea.observacion || null);
          setValue("stockMinimo", linea.stockMinimo || 0);
          setValue("utilizaStockMinimo", linea.utilizaStockMinimo || false);
          
        }
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };
    fetchData();
  }, [linea, setValue]);

  const onSubmit = async (formData: FormValues) => {
    let response: ResponsePost;
    try {
     

      if (linea) {
        const payload = { ...formData, usuarioUpdatedId: usuarioId };
        response = await LineaService.actualizar(linea.id, payload);
      } else {
        const payload = { ...formData, usuarioCreatedId: usuarioId };
        response = await LineaService.nuevo(payload);
      }
      onClose();
      onSuccess(response.mensaje);
    } catch (error) {
      setError("root", { type: "manual", message: parseApiError(error) });
    }
  };

 

  

  
  const handleOnClose = async () => {
    const confirmed = await showConfirmation({
      type: TipoAlertaConfirmacion.DEFAULT,
      title: TituloAlertaConfirmacion.DEFAULT,
      message: "¿Estás seguro de que quieres cerrar el formulario? NO se guardaran los cambios.",
      confirmText: "Aceptar",
      cancelText: "Cancelar",
      onConfirm: () => {},
    });
    if (confirmed) onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 overflow-y-auto py-5">
      <Card className="relative w-full max-w-7xl bg-white mx-auto shadow-lg rounded-lg overflow-hidden mt-10 mb-12">
        <EncabezadoFormularios
          title={linea ? "Actualizar Línea" : "Registrar Línea"}
          subtitle={linea ? "Modifica los detalles de la línea." : "Ingresa los datos de la nueva línea."}
          icon={<Layers className="form-icon" />}
          onClose={handleOnClose}
        />

        <fieldset disabled={linea?.sistema === 1}>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 px-6 py-4">
                <div className="lg:col-span-2">
                  <label htmlFor="linea-superlinea" className="block font-medium">SuperLínea *</label>
                  {linea && <p className="text-sm text-gray-600 mb-2">
                    Asociación guardada: {linea.superlinea?.denominacion ?? "Sin información"}
                  </p>}
                  <select id="linea-superlinea" {...methods.register("superlineaId", { valueAsNumber: true })}
                    value={watch("superlineaId") ?? 0}
                    disabled={loadingSuperlineas} aria-invalid={!!errors.superlineaId} aria-describedby="linea-superlinea-error"
                    className="border rounded p-2 w-full">
                    <option value={0}>{loadingSuperlineas ? "Cargando…" : "Seleccioná una SuperLínea"}</option>
                    {superlineas.map(s => <option key={s.id} value={s.id}>{s.denominacion}</option>)}
                  </select>
                  <p id="linea-superlinea-error" role="alert" className="text-red-600">{errors.superlineaId?.message}</p>
                  {superlineasError && <p role="alert" className="text-red-600">{superlineasError}</p>}
                  {!loadingSuperlineas && !superlineasError && superlineas.length === 0 && <p>No hay SuperLíneas disponibles. Solicitá a un administrador que cree una.</p>}
                </div>
                <div className="lg:col-span-2">
                  <FormInput name="denominacion" label="Denominación" placeholder="Ingresa la denominación" />
                </div>

                <div className="lg:col-span-2">
                  <FormInput name="observacion" label="Observación" placeholder="Ingresa una observación (opcional)" />
                </div>

                <div className="flex items-end gap-2 lg:col-span-1">
                  <label className="flex items-center pb-2">
                    <input
                      type="checkbox"
                      {...methods.register("utilizaStockMinimo")}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>
                  <CantidadesInput
                    name="stockMinimo"
                    label="Stock Crítico"
                    value={stockMinimo || 0}
                    onChange={(value) => setValue("stockMinimo", Number(value))}
                    disabled={utilizaStockMinimo ? false : true}
                  />
                </div>
              </CardContent>
              {errors.root?.message && (
                <div className="text-red-600 text-center mb-4">{String(errors.root.message)}</div>
              )}

              <CardFooter className="flex justify-center">
                <Button type="submit" disabled={isSubmitting || loadingSuperlineas || !!superlineasError || superlineas.length === 0} className="btn btn-dark">
                  {isSubmitting ? (linea ? "Actualizando..." : "Registrando...") : linea ? "Actualizar" : "Registrar"}
                </Button>
              </CardFooter>
            </form>
          </FormProvider>
        </fieldset>
      </Card>

     
      <AlertasConfirmacion />
    </div>
  );
}
