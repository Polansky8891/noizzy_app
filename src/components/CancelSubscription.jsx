


export const CancelSubscription = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center items-start">
        <div className="bg-white rounded-xl shadow-md w-full max-2-3xl overflow-hidden">
            <div className="bg-gray-200 px-6 py-4">
                <h2 className="text-2xl font-bold text-gray-900">Your experience is about to change</h2>
            </div>

            <div className="bg-gray-50 px-6 py-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">This is what you will lose when you cancel</h3>
                <ul className="list-disc list-inside text-left text-sm text-gray-700 space-y-1">
                    <li>Listen without ads</li>
                    <li>Reproduction on demand</li>
                    <li>Offline mode</li>
                </ul>
            </div>

        </div>

    </div>
  )
}
