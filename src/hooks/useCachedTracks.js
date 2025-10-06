// src/hooks/useCachedTracks.js
import { useEffect, useState } from "react";
import api from "../api/axios";
import { fetchWithCacheWeb } from "../utils/cacheWeb";

const buildKeyUrl = ({ genre, feel, limit }) => {
  const u = new URL((api.defaults?.baseURL || "") + "/tracks", window.location.origin);
  if (genre) u.searchParams.set("genre", genre);
  if (feel) u.searchParams.set("feel", feel);
  if (limit) u.searchParams.set("limit", String(limit));
  return u.toString();
};

export function useCachedTracks({ genre, feel, limit, ttlMs = 15 * 60 * 1000 } = {}) {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const keyUrl = buildKeyUrl({ genre, feel, limit });

    async function run() {
      setLoading(true);
      const { data: cached, promise } = await fetchWithCacheWeb(
        keyUrl,
        async () => {
          const { data } = await api.get("/tracks", { params: { genre, feel, limit } });
          return data?.items ?? [];
        },
        { ttlMs }
      );

      if (!ignore) {
        setItems(cached ?? []);
        setLoading(!cached); // si hay cache, no mostramos “loading”
      }

      if (promise) {
        try {
          const fresh = await promise;
          if (!ignore) {
            if (!sameList(fresh, cached)) setItems(fresh);
            setLoading(false);
          }
        } catch {
          if (!ignore) setLoading(false);
        }
      }
    }

    run();
    return () => { ignore = true; };
  }, [genre, feel, limit, ttlMs]);

  return { items: items ?? [], loading };
}

function sameList(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const A = a[i], B = b[i];
    if ((A._id || A.id) !== (B._id || B.id)) return false;
    if (A.title !== B.title || A.artist !== B.artist) return false;
    if (A.audioUrl !== B.audioUrl) return false;
    if ((A.coverUrl || A.cover || A.image) !== (B.coverUrl || B.cover || B.image)) return false;
  }
  return true;
}
