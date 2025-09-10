import { useState } from "react";
import { Header } from "./Header";
import { SideBar } from "./SideBar";


export default function AppLayout({ children, player }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-dvh bg-black text-white">
           <div className="lg:hidden">
                <Header onOpenSideBar={() => setSidebarOpen(true)} />
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-[240px,1fr]">
                <aside className="hidden lg:block lg:h-dvh lg:sticky lg:top-0">
                    <SideBar />
                </aside>

                <main className="min-h-[calc(100dvh-96px)] px-3 sm:px-6 lg:px-8 py-4">
                    {children}
                </main>
           </div>

           {sidebarOpen && (
                <div className="lg:hidden fixed inset-0 z-40">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                    <div className="absolute inset-y-0 left-0 w-72 bg-[#111] shadow-xl p-4">
                        <button
                            className="mb-2 inline-flex items-center gap-2 text-sm text-gray-300"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span>x</span> Close
                        </button>
                        <SideBar onNavigate={() => setSidebarOpen(false)} />
                    </div>
                </div>
           )}

           <div className="fixed bottom-0 inset-x-0 z-30">
                {player}
           </div>
        </div>
    );
}