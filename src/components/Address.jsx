


export const Address = () => {
  return (
    <div className="bg-black min-h-screen p-6 flex justify-start items-start">
        <div className="bg-[#1C1C1C] p-6 border border-[#0A84FF] rounded-xl shadow-md w-full max-w-2xl space-y-6">
            <h1 className="!text-lg font-bold text-[#0A84FF] flex justify-start">Your address</h1>
            <h2 className="!text-sm font-bold text-[#0A84FF] flex justify-start">Enter your billing address</h2>

            <div>
            <label className="flex justify-start text-sm font-medium text-[#0A84FF] mb-1">Region</label>
            <select className="w-full p-3 border text-[#0A84FF] border-[#0A84FF] rounded-md focus:outline-none focus:ring ">
                <option>Melilla</option>
                <option>Canarias</option>
                <option>Peninsula and Balearic Islands</option>
                <option>Ceuta</option>

            </select>
        </div>


        </div>

        


    </div>
  )
}
