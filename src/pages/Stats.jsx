import { useEffect, useState, useMemo, useCallback} from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
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

const BLUE = "#0A84FF";
const AXIS = "#141414";

let lastStatsCache = null;

export const Stats = () => {
  const { status, token } = useSelector(selectAuth);

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // ✅ empieza en false
  const [reloadKey, setReloadKey] = useState(0);

  // Pinta al instante si hay cache en memoria (navegaciones dentro de la sesión)
  useEffect(() => {
    if (lastStatsCache) setData(lastStatsCache);
  }, []);

  useEffect(() => {
  if (status !== "authenticated") {
    lastStatsCache = null;
    setData(null);
  }
}, [status]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/stats/summary", {
        params: { days: 7 },
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: (s) => (s >= 200 && s < 300) || s === 204,
      });

      if (res.status === 204) {
        setData(emptySummary);
        lastStatsCache = emptySummary;
        return;
      }

      const json = res.data || {};
      const summary = {
        days: json.days ?? 7,
        minutes: Math.round(json.minutes ?? 0),
        plays: json.plays ?? 0,
        uniqueTracks: json.uniqueTracks ?? 0,
        topGenres: Array.isArray(json.topGenres) ? json.topGenres : [],
        daily: Array.isArray(json.daily) ? json.daily : [],
      };

      setData(summary);
      lastStatsCache = summary;
    } catch (err) {
      const msg = (err?.message || "").toLowerCase();
      if (
        err?.code === "ERR_CANCELED" ||
        err?.name === "CanceledError" ||
        err?.name === "AbortError" ||
        msg === "canceled"
      ) return;

      if (err?.response?.status === 401) setError("No autorizado. Inicia sesión de nuevo.");
      else setError(err?.message || "Error al cargar estadísticas");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // ✅ Dispara solo si estás autenticado y hay token
  useEffect(() => {
    if (status === "authenticated" && token && (!data || reloadKey)) {
      fetchStats();
    }
  }, [status, token, data, reloadKey, fetchStats]);

  const dailyMinutes = useMemo(() => {
    const d = data?.daily ?? [];
    return d.map((item) => ({
      date: (item?.date || "").slice(5), // mm-dd
      minutes: Math.round((item?.ms ?? 0) / 60000),
    }));
  }, [data]);

  // No mostramos textos de carga/login; solo pintamos cuando hay datos + auth
  const ready = Boolean(data) && status === "authenticated";

  if (!ready) {
    return <div className="p-6 min-h-[320px]" />;
  }

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

  return (
    <div className={`p-6 space-y-6 transition-opacity duration-200 ${loading ? "opacity-90" : "opacity-100"}`}>
      <h1 className="text-xl font-semibold text-[#0A84FF]">
        Your stats (last 7 days)
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[#0A84FF]">
        <Kpi title="Minutes" value={data.minutes} valueClassName="text-[#0A84FF]" />
        <Kpi title="Plays" value={data.plays} />
        <Kpi title="Unique songs" value={data.uniqueTracks} />
      </div>

      <section className="bg-[#080808] rounded-xl p-4">
        <h2 className="mb-3 font-medium text-[#0A84FF]">Minutes per day</h2>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={dailyMinutes}>
              <CartesianGrid vertical={false} stroke={AXIS} />
              <XAxis dataKey="date" tick={{ fill: BLUE, fontSize: 12 }} axisLine={{ stroke: AXIS }} tickLine={false} />
              <YAxis tick={{ fill: BLUE, fontSize: 12 }} axisLine={{ stroke: AXIS }} tickLine={false} />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                contentStyle={{ background: "#0A0C0D", border: `1px solid ${AXIS}`, color: BLUE }}
                labelStyle={{ color: BLUE }}
                itemStyle={{ color: BLUE }}
              />
              <Bar dataKey="minutes" fill={BLUE} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-white/5 rounded-xl p-4">
        <h2 className="mb-3 font-medium text-[#0A84FF]">Top genre by time</h2>
        <ul className="space-y-2">
          {(data.topGenres ?? []).slice(0, 10).map((g) => {
            const minutes = Math.round((g?.ms ?? 0) / 60000);
            return (
              <li key={g.genre} className="flex justify-between">
                <span className="truncate text-[#0A84FF]">{g.genre}</span>
                <span className="tabular-nums text-[#0A84FF]">{minutes} min</span>
              </li>
            );
          })}
          {(!data.topGenres || data.topGenres.length === 0) && (
            <li className="text-[#0A84FF]">No data genre yet</li>
          )}
        </ul>
      </section>
    </div>
  );
};