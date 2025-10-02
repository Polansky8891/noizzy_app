import { useState } from "react";
import SelectField from "./SelectField";


const REGIONS = [
  "Melilla",
  "Canarias",
  "Peninsula and Balearic Islands",
  "Ceuta",
  ];

export const Address = () => {
  const [region, setRegion] = useState("Melilla");

  return (
    <div className="bg-black min-h-screen p-6 flex justify-start items-start">
      <div className="bg-[#1C1C1C] p-6 border border-[#0A84FF] rounded-xl shadow-md w-full max-w-2xl space-y-6">
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
  );
};