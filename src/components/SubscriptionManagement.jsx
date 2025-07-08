


export const SubscriptionManagement = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-start">
      <div className="bg-white rounded-xl shadow-md w-full max-w-3xl overflow-hidden">
        {/* Cabecera de la suscripción */}
        <div className="bg-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-900">Administrar la suscripción</h2>
        </div>

        {/* Detalles del plan */}
        <div className="bg-gray-50 px-6 py-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Premium Individual</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>1 cuenta Premium</li>
            <li>Cancela cuando quieras</li>
          </ul>
        </div>

        {/* Información de pago */}
        <div className="bg-gray-100 border-t px-6 py-6 flex justify-between flex-wrap gap-4">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Pago</h4>
            <p className="text-sm text-gray-700">
              Tu próxima factura es de <strong>10,99 €</strong> y se emite el <strong>28/7/25</strong>.
            </p>
            <div className="flex items-center mt-3 space-x-2">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
                alt="Visa"
                className="w-8 h-auto"
              />
              <div className="text-sm text-gray-700">
                Visa acabada en <strong>0860</strong>
                <br />
                Caduca: 10/2031
              </div>
            </div>
          </div>

          {/* Botón de actualizar (desactivado) */}
          <button
            disabled
            className="self-end text-sm font-medium text-gray-400 hover:text-gray-600 cursor-not-allowed"
          >
            Actualizar
          </button>
        </div>
      </div>
    </div>
  );
};
