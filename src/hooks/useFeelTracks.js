import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

export function useFeelTracks(feel, { limit = 24, cache = true } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const cacheKey = useMemo(() => `tracks:feel:${feel}:${limit}`, [feel, limit]);

  useEffect(() => {
    if (!feel) return;
    let cancelled = false;

    (async () => {
      // cache
      if (cache) {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (!cancelled) {
            setItems(parsed);
            setLoading(false);
          }
          return;
        }
      }

      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/tracks", { params: { feel, limit } });
        const list = data?.items ?? [];
        if (!cancelled) {
          setItems(list);
          setLoading(false);
        }
        if (cache) sessionStorage.setItem(cacheKey, JSON.stringify(list));
      } catch (e) {
        if (!cancelled) {
          setError(e?.response?.data?.message || e?.message || "Error loading tracks");
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [feel, limit, cacheKey, cache, reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);

  return { items, loading, error, reload };
}