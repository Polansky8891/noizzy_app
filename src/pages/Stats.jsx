import { useEffect, useState, useMemo, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import api from "../api/axios";
import Kpi from "../components/Kpi";
import { selectAuth } from "../store/auth/authSlice";
import { useSelector } from "react-redux";


const emptySummary = {
  days: 0,
  minutes: 0,
  plays: 0,
  uniqueTracks: 0,
  topGenres: [],
  daily: [],
};

export const Stats = () => {
  const { status } = useSelector(selectAuth);

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/stats/summary", {
        params: { days: 7 },
        // aceptamos 204 como “ok sin contenido”
        validateStatus: (s) => (s >= 200 && s < 300) || s === 204,
      });

      if (res.status === 204) {
        setData(emptySummary);
        return;
      }

      const json = res.data || {};
      setData({
        days: json.days ?? 7,
        minutes: Math.round(json.minutes ?? 0),
        plays: json.plays ?? 0,
        uniqueTracks: json.uniqueTracks ?? 0,
        topGenres: Array.isArray(json.topGenres) ? json.topGenres : [],
        daily: Array.isArray(json.daily) ? json.daily : [],
      });
    } catch (err) {
      // Silenciar cancelaciones por si algún sitio cancela requests
      const msg = (err?.message || "").toLowerCase();
      if (
        err?.code === "ERR_CANCELED" ||
        err?.name === "CanceledError" ||
        err?.name === "AbortError" ||
        msg === "canceled"
      ) {
        return;
      }

      if (err?.response?.status === 401) {
        setError("No autorizado. Inicia sesión de nuevo.");
      } else {
        setError(err?.message || "Error al cargar estadísticas");
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🚦 Dispara SOLO cuando estás autenticado
  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }
    fetchStats();
  }, [status, fetchStats, reloadKey]);

  const dailyMinutes = useMemo(() => {
    const d = data?.daily ?? [];
    return d.map((item) => ({
      date: (item?.date || "").slice(5), // mm-dd
      minutes: Math.round((item?.ms ?? 0) / 60000),
    }));
  }, [data]);

  if (status === "checking") {
    return <div className="p-6 text-gray-300">Cargando stats…</div>;
  }

  if (status !== "authenticated") {
    return <div className="p-6 text-gray-300">Inicia sesión para ver tus estadísticas</div>;
  }

  if (loading) return <div className="p-6 text-gray-300">Cargando stats...</div>;

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-400 mb-3">{error}</p>
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
        <p className="text-gray-300">No hay datos de estadísticas por ahora.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold text-[#1DF0D8]">
        Your stats (last 7 days)
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[#1DF0D8]">
        <Kpi title="Minutes" value={data.minutes} valueClassName="text-[#1DF0D8]" />
        <Kpi title="Plays" value={data.plays} />
        <Kpi title="Unique songs" value={data.uniqueTracks} />
      </div>

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
};