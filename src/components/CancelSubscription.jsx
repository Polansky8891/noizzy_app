


export const CancelSubscription = () => {
  return (
    <div className="min-h-screen bg-black p-6 flex justify-center items-start">
        <div className="  shadow-md w-full border border-[#0A84FF] rounded-xl max-2-3xl overflow-hidden">
            <div className="bg-black px-6 py-4">
                <h2 className="text-2xl font-bold text-[#0A84FF]">Your experience is about to change</h2>
            </div>

            <div className="bg-black px-6 py-6">
                <h3 className="text-xl font-semibold text-[#0A84FF] mb-4">This is what you will lose when you cancel</h3>
                <ul className="list-disc list-inside text-left text-sm text-[#0A84FF] space-y-1">
                    <li>Listen without ads</li>
                    <li>Reproduction on demand</li>
                    <li>Offline mode</li>
                </ul>
            </div>

        </div>

    </div>
  )
}
