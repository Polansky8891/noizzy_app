import { useState } from "react";
import SelectField from "./SelectField";
import BackHeader from "./BackHeader";


const REGIONS = [
  "Melilla",
  "Canarias",
  "Peninsula and Balearic Islands",
  "Ceuta",
  ];

export const Address = () => {
  const [region, setRegion] = useState("Melilla");

  return (
<div className="bg-black min-h-screen pb-6">
      <BackHeader />

      <div className="px-4 flex justify-center items-start">
        <div className="w-full max-w-2xl bg-[#1C1C1C] p-6 rounded-xl shadow-md space-y-6 border border-[#0A84FF]/60">
        <h1 className="!text-lg font-bold text-[#0A84FF] flex justify-start">Your address</h1>
        <h2 className="!text-sm font-bold text-[#0A84FF] flex justify-start">Enter your billing address</h2>

        {/* Region */}
        <SelectField
          label="Region"
          value={region}
          onChange={setRegion}
          options={REGIONS}
        />
      </div>
    </div>
</div>
  );
};