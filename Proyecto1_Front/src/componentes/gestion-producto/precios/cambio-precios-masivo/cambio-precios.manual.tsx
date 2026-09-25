import { ConsultarProductosCambioPreciosMasivo } from "../../../../interfaces/gestion-producto/producto/interfaces-producto";
import { Card, CardContent, CardFooter, } from "../../../ui/Card";
import { Button } from "../../../ui/Button";
import * as yup from "yup";
import { FormProvider, Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Layers } from "lucide-react";
import PriceInput from "../../../herramientas/formateo-de-campos/price-input";
import { useEffect } from "react";



interface FormValues {
  precioNuevo: number;
}

const schema: yup.ObjectSchema<FormValues> = yup.object({
  precioNuevo: yup
    .number()
    .typeError("El precio debe ser un número válido.")
    .min(0, "El precio no puede ser negativo.")
    .required("El precio es obligatorio."),
});

export default function CambioPreciosManual({
  producto,
  onSuccess,
  onClose,
}: {
  producto: ConsultarProductosCambioPreciosMasivo;
  onSuccess: (productoActualizado: ConsultarProductosCambioPreciosMasivo) => void;
  onClose: () => void;
}) {
  //===================== CONSTANTES VARIAS ============================================

  const methods = useForm<FormValues>({
    resolver: yupResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      precioNuevo: 0,
    },
  });
  
  const {
    handleSubmit,
    setValue,
    setError,
    watch,
  } = methods;


  const precioNuevo = watch("precioNuevo");

  //=============================== FUNCIONALIDAD ==================================


   useEffect(() => {
    if (producto) {
      setValue("precioNuevo", producto.precioNuevo ?? producto.precio);
    }
  }, [producto, setValue]);

  const onSubmit = async (formData: FormValues) => {

    try {
      const productoActualizado: ConsultarProductosCambioPreciosMasivo = {
        ...producto,
        precioNuevo: formData.precioNuevo,
        dirty: true, // ✅ Marcamos el producto como modificado
      };

      onSuccess(productoActualizado);
    } catch (error) {
      setError("root", {
        type: "manual",
        message: String(error),
      });
    }
  };


    

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2 sm:p-4">
      <Card className="w-full max-w-7xl bg-white mx-auto shadow-lg rounded-2xl overflow-hidden relative mt-10 mb-12">
        {/* Botón de cierre del modal */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600"
        >
          &times;
        </button>

        {/* Título del formulario */}
        <div className="form-header">
          <button onClick={onClose} className="btn-onClose-title-form">
            &times;
          </button>

          <h2 className="form-title">
            <Layers className="form-icon" />
            <span>Cambio Precio Manual</span>
          </h2>
          <p className="form-subtitle">
            Ingresa los precios manuales a asignarle al producto.
          </p>
        </div>

        {/* Contenido con scroll si es necesario */}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-3 px-4 sm:px-6 md:px-10 py-3 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                <div className="flex flex-row gap-4 col-span-full">
                  {/* Campo Código (más chico y primero) */}
                  <div className="flex flex-col w-1/5">
                    <label className="text-sm font-medium text-gray-700">Código</label>
                    <input
                      type="text"
                      value={producto.codigoProveedor}
                      onChange={() => {}}
                      className="bg-white text-black border rounded px-2 py-1 w-full"
                      disabled
                    />
                  </div>

                  {/* Campo Producto (más grande y después) */}
                  <div className="flex flex-col flex-grow">
                    <label className="text-sm font-medium text-gray-700">Producto</label>
                    <input
                      type="text"
                      value={producto.denominacion}
                      onChange={() => {}}
                      className="bg-white text-black border rounded px-2 py-1 w-full"
                      disabled
                    />
                  </div>
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PriceInput
                  name="precioActual"
                  label="Precio actual"
                  value={producto.precio}
                  onChange={() => {}}
                  disabled
                />
                <PriceInput
                  name="precioNuevo"
                  label="Precio nuevo"
                  value={precioNuevo}
                  onChange={(value) => setValue("precioNuevo", Number(value))}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Observación</label>
                <textarea
                  value={producto.observacion}
                  onChange={() => {}}
                  className="bg-white text-black border rounded px-2 py-1 min-h-[80px]"
                  disabled
                />
              </div>
            </CardContent>
          

            {/* Footer */}
            <CardFooter className="flex justify-center py-3">
              <Button
                type="submit"
                className="btn btn-dark"
              >
                Confirmar
              </Button>
            </CardFooter>
          </form>
        </FormProvider>
      </Card>

    </div>
  );

}
