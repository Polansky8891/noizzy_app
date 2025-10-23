import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { fetchWithCacheWeb } from "../utils/cacheWeb";
import { cacheGet, cacheSet } from "../utils/cacheLocal";

const FAV_KEY = (limit) => `fav:v1:list?limit=${limit || 200}`;

export default function useFavoritesCached({ limit = 200 }) {
  const cacheKey = useMemo(() => FAV_KEY(limit), [limit]);

  const [items, setItems] = useState(() => cacheGet(cacheKey) || []);
  const [loading, setLoading] = useState(items.length === 0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const url = new URL((api.defaults?.baseURL || "") + "/favorites", window.location.origin);
        url.searchParams.set("limit", String(limit));

        const fresh = await fetchWithCacheWeb(
          url.toString(),
          async () => {
            const { data } = await api.get("/favorites", { params: { limit } });
            return data?.items ?? [];
          },
          { ttlMs: 15 * 60 * 1000 }
        );

        if (!alive) return;
        setItems(fresh);
        cacheSet(cacheKey, fresh, 15 * 60 * 1000);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [cacheKey, limit]);

  return { items, loading };
}
