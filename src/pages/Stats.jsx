import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const getAuthToken = () => localStorage.getItem('token');

export const Stats = () => {

    const [data, setData] = useState(null);

    useEffect(() => {
        const token = getAuthToken();
        fetch('/api/stats/summary?days=7', {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })
            .then(r => (r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status))))
            .then(setData)
            .catch(() => {});
    }, []);

    if (!data) return <div className="p-6 text-gray-300">Loading stats...</div>;

    const dailyMinutes = (data.daily || []).map(d => ({
        date: (d.date || '').slice(5),
        minutes: Math.round((d.ms || 0) / 60000),
    }));

    const topGenres = (data.topGenres || []).map(g => ({
        genre: g.genre || 'Unknown',
        minnutes: Math.round((g.ms || 0) / 60000),
    }));

  return (
    <div className="p-6 space-y-8">
        <h1 className="text-2cl font-semibold text-white">Your activity (last {data.days} days)</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPI label="Minutes playing" value={String(data.minutes)} />
            <KPI label="Plays" value={String(data.plays)} />
            <KPI label="Unique tracks" value={String(data.uniqueTracks)} />
            <KPI label="Top genre" value={(topGenres[0] && topGenres[0].genre) || '-'} />
        </div>

        <Card>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg text.white">Minutes per day</h2>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyMinutes}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="minutes" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>

        <Card>
            <h2 className="text-lg text-white mb-4">Top genres</h2>
            <ul className="space-y-2">
                {topGenres.map((g, i) => (
                    <li key={i} className="flex items-center justify-between text-gray-300">
                        <span>{g.genre}</span>
                        <span className="tabular-nums">{g.minutes} min</span>
                    </li>
                ))}
            </ul>
        </Card>
    </div>
  );
}

function KPI({ label, value }) {
    return (
        <div className="rounded-2xl bg-gray-800/70 border border-gray-700 p-4">
            <div className="text-sm text-gray-400">{label}</div>
            <div className="text-2xl font-semibold text-white mt-1">{value}</div>
        </div>
    );
}

function Card({ children }) {
    return <div className="rounded-2xl bg-gray-800/70 border border-gray-700 p-5">{children}</div>
}
