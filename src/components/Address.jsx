


export const Address = () => {
  return (
    <div className="bg-gray-100 min-h-screen p-6 flex justify-start items-start">
        <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-2xl space-y-6">
            <h1 className="!text-lg font-bold text-gray-900 flex justify-start">Your address</h1>
            <h2 className="!text-sm font-bold text-gray-900 flex justify-start">Enter your billing address</h2>

            <div>
            <label className="flex justify-start text-sm font-medium text-gray-700 mb-1">Region</label>
            <select className="w-full p-3 border bg-gray-100 border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-400">
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
