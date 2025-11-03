import BackHeader from "./BackHeader";

export const SubscriptionManagement = () => {
  return (
    <div className="min-h-screen bg-black pb-6">
      {/* Flecha estándar, misma posición en todas las pantallas */}
      <BackHeader />

      {/* Contenido centrado */}
      <div className="px-4 flex justify-center items-start">
        <div className="w-full max-w-3xl rounded-xl shadow-md overflow-hidden border border-[#0A84FF]">
          {/* Cabecera de la suscripción */}
          <div className="bg-[#1C1C1C] px-6 py-4">
            <h2 className="text-2xl font-bold text-[#0A84FF]">
              Administrar la suscripción
            </h2>
          </div>

          {/* Detalles del plan */}
          <div className="bg-black border-t border-[#0A84FF] px-6 py-6">
            <h3 className="text-xl font-semibold text-[#0A84FF] mb-4">
              Premium Individual
            </h3>
            <ul className="list-disc list-inside text-sm text-[#0A84FF] space-y-1">
              <li>1 cuenta Premium</li>
              <li>Cancela cuando quieras</li>
            </ul>
          </div>

          {/* Información de pago */}
          <div className="bg-[#1C1C1C] border-t border-[#0A84FF] px-6 py-6 flex justify-between flex-wrap gap-4">
            <div>
              <h4 className="text-lg font-semibold text-[#0A84FF] mb-2">Pago</h4>
              <p className="text-sm text-[#0A84FF]">
                Tu próxima factura es de <strong>10,99 €</strong> y se emite el{" "}
                <strong>28/7/25</strong>.
              </p>
              <div className="flex items-center mt-3 space-x-2">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
                  alt="Visa"
                  className="w-8 h-auto"
                />
                <div className="text-sm text-[#0A84FF]">
                  Visa acabada en <strong>0860</strong>
                  <br />
                  Caduca: 10/2031
                </div>
              </div>
            </div>

            <button
              disabled
              className="self-end text-sm font-medium text-[#0A84FF] cursor-not-allowed"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
