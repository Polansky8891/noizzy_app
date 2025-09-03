import { useEffect, useState, useMemo, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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
      if (!token) {
        throw new Error("No hay token de autenticación. ¿Has iniciado sesión?");
      }

      const API = import.meta.env.VITE_API_BASE_URL || '';
      const res = await fetch(`${API}/api/stats/summary?days=7`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        signal,
      });

      // Manejo de estados HTTP
      if (res.status === 204) {
        // Sin contenido: setea vacío para que la UI no quede colgada
        setData(emptySummary);
        return;
      }
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Error API ${res.status} ${res.statusText}` +
            (text ? ` – Detalle: ${text}` : "")
        );
      }

      // Asegura JSON válido
      const json = await res.json();
      if (!json || typeof json !== "object") {
        throw new Error("Respuesta de API no válida (no es JSON).");
      }
      setData({
        days: json?.days ?? 0,
        minutes: Math.round((json?.minutes ?? 0)),
        plays: json?.plays ?? 0,
        uniqueTracks: json?.uniqueTracks ?? 0,
        topGenres: Array.isArray(json?.topGenres) ? json.topGenres : [],
        daily: Array.isArray(json?.daily) ? json.daily : [],
      });
    } catch (err) {
      console.error("[Stats] fetch error:", err);
      setError(err.message || "Error desconocido obteniendo estadísticas.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

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
      <h1 className="text-xl font-semibold">Tus estadísticas (últimos 7 días)</h1>

      {/* KPIs básicos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi title="Minutos" value={data.minutes} />
        <Kpi title="Reproducciones" value={data.plays} />
        <Kpi title="Pistas únicas" value={data.uniqueTracks} />
        <Kpi title="Días con escucha" value={data.days} />
      </div>

      {/* Gráfico diario */}
      <section className="bg-white/5 rounded-xl p-4">
        <h2 className="mb-3 font-medium">Minutos por día</h2>
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
        <h2 className="mb-3 font-medium">Top géneros por tiempo</h2>
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
            <li className="text-gray-400">Sin datos de géneros aún.</li>
          )}
        </ul>
      </section>
    </div>
  );
}

function Kpi({ title, value }) {
  return (
    <div className="bg-white/5 rounded-xl p-4">
      <div className="text-sm text-gray-300">{title}</div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
