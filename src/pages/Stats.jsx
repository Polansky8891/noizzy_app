import { useEffect, useState, useMemo, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { API_BASE } from "../api/base";
import Kpi from "../components/Kpi";

function getAuthToken() {
  return localStorage.getItem("token");
}

const emptySummary = {
  days: 0,
  minutes: 0,
  plays: 0,
  uniqueTracks: 0,
  topGenres: [],
  daily: [],
};
export const Stats = () => {
    
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0); // para reintentos

  const token = getAuthToken();

  const fetchStats = useCallback(async (signal) => {
  setLoading(true);
  setError("");

  try {
    const token = getAuthToken(); // lee fresco en cada intento
    if (!token) {
      // No dispares fetch si aún no hay token
      setLoading(false);
      return;
    }

    const API = import.meta.env.VITE_API_BASE_URL || "";
    const res = await fetch(`${API_BASE}/stats/summary?days=7`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      signal,
    });

    if (res.status === 204) {
      setData({
        days: 7,
        minutes: 0,
        plays: 0,
        uniqueTracks: 0,
        topGenres: [],
        daily: [],
      });
      return;
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Error API ${res.status} ${res.statusText}` +
        (text ? ` – Detalle: ${text}` : "")
      );
    }

    const json = await res.json();
    setData({
      days: json?.days ?? 0,
      minutes: Math.round(json?.minutes ?? 0),
      plays: json?.plays ?? 0,
      uniqueTracks: json?.uniqueTracks ?? 0,
      topGenres: Array.isArray(json?.topGenres) ? json.topGenres : [],
      daily: Array.isArray(json?.daily) ? json.daily : [],
    });

  } catch (err) {
    // ⬇️ Abort no es un “error”; lo ignoramos silenciosamente
    if (err && err.name === "AbortError") {
      console.debug("[Stats] fetch aborted");
      return;
    }
    console.error("[Stats] fetch error:", err);
    setError(err.message || "Error desconocido obteniendo estadísticas.");
    setData(null);
  } finally {
    // ⬇️ No toques estado si ya está abortado (evita warnings/flip-flops)
    if (!signal?.aborted) setLoading(false);
  }
}, []);


  useEffect(() => {
    const ac = new AbortController();
    fetchStats(ac.signal);
    return () => ac.abort();
  }, [fetchStats, reloadKey]);

  const dailyMinutes = useMemo(() => {
    const d = data?.daily ?? [];
    return d.map((item) => ({
      date: (item?.date || "").slice(5), // mm-dd
      minutes: Math.round((item?.ms ?? 0) / 60000),
    }));
  }, [data]);

  if (loading) {
    return <div className="p-6 text-gray-300">Cargando stats…</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-400 mb-3">
          {error}
        </p>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="px-3 py-2 rounded bg-white/10 hover:bg-white/20"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-gray-300">
          No hay datos de estadísticas por ahora.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold text-[#1DF0D8]">Your stats (last 7 days)</h1>

      {/* KPIs básicos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[#1DF0D8]">
        <Kpi title="Minutes" value={data.minutes} valueClassName="text-[#1DF0D8]" />
        <Kpi title="Plays" value={data.plays} />
        <Kpi title="Unique songs" value={data.uniqueTracks} />
      </div>

      {/* Gráfico diario */}
      <section className="bg-white/5 rounded-xl p-4">
        <h2 className="mb-3 font-medium text-[#1DF0D8]">Minutes per day</h2>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={dailyMinutes}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="minutes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Top géneros */}
      <section className="bg-white/5 rounded-xl p-4">
        <h2 className="mb-3 font-medium text-[#1DF0D8]">Top genre by time</h2>
        <ul className="space-y-2">
          {(data.topGenres ?? []).slice(0, 10).map((g) => {
            const minutes = Math.round((g?.ms ?? 0) / 60000);
            return (
              <li key={g.genre} className="flex justify-between">
                <span className="truncate">{g.genre}</span>
                <span className="tabular-nums">{minutes} min</span>
              </li>
            );
          })}
          {(!data.topGenres || data.topGenres.length === 0) && (
            <li className="text-[#1DF0D8]">No data genre yet</li>
          )}
        </ul>
      </section>
    </div>
  );
}


