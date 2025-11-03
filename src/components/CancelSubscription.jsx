import BackHeader from "./BackHeader";

export const CancelSubscription = () => {
  return (
    <div className="min-h-screen bg-black pb-6">
      {/* Flecha estándar, misma posición en todas las pantallas */}
      <BackHeader />

      {/* Contenido centrado */}
      <div className="px-4 flex justify-center items-start">
        <div className="w-full max-w-3xl shadow-md border border-[#0A84FF] rounded-xl overflow-hidden">
          <div className="bg-[#1C1C1C] px-6 py-4">
            <h2 className="text-2xl font-bold text-[#0A84FF]">
              Your experience is about to change
            </h2>
          </div>

          <div className="bg-[#1C1C1C] px-6 py-6 border-t border-[#0A84FF]">
            <h3 className="text-xl font-semibold text-[#0A84FF] mb-4">
              This is what you will lose when you cancel
            </h3>
            <ul className="list-disc list-inside text-left text-sm text-[#0A84FF] space-y-1">
              <li>Listen without ads</li>
              <li>Reproduction on demand</li>
              <li>Offline mode</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
