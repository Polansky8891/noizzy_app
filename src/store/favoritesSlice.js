import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";
import { logout } from "./auth/authSlice";

/* ───────────── cache helpers (por usuario) ───────────── */
const CACHE_PREFIX = "fav_cache_v1";

const getUserKey = (state) => {
  const a = state?.auth;
  const uid = a?.user?.id || a?.user?.uid || a?.uid || a?.email || "anon";
  return `${CACHE_PREFIX}:${uid}`;
};

const readCache = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.items) || !Array.isArray(parsed?.ids)) return null;
    return { items: parsed.items, ids: parsed.ids };
  } catch {
    return null;
  }
};

const writeCache = (key, items, ids) => {
  try {
    localStorage.setItem(key, JSON.stringify({ items, ids }));
  } catch {}
};

const clearCacheKey = (key) => {
  try { localStorage.removeItem(key); } catch {}
};

const clearAllFavCaches = () => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(k);
        i--; // porque cambia el length
      }
    }
  } catch {}
};

/* ───────────── estado ───────────── */
const initialState = {
  ids: [],
  items: [],
  loading: false,
  error: null,
  hasFetchedOnce: false,
};

/* ───────────── thunks ───────────── */
export const hydrateFavoritesFromCache = createAsyncThunk(
  "favorites/hydrateFromCache",
  async (_, { getState }) => {
    const state = getState();
    const key = getUserKey(state);
    const cached = readCache(key) || { items: [], ids: [] };
    return { ...cached, _cacheKey: key };
  }
);

export const fetchFavoriteTracks = createAsyncThunk(
  "favorites/fetchTracks",
  async (_ , { rejectWithValue, signal, getState }) => {
    try {
      const state = getState();
      const token = state?.auth?.token;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await api.get("/me/favorites", {
        signal,
        headers,
        validateStatus: (s) => (s >= 200 && s < 300) || s === 204,
      });

      if (res.status === 204) {
        return { items: [], ids: [], _cacheKey: getUserKey(state) };
      }

      const data = res.data;
      if (Array.isArray(data)) {
        const ids = data.map((t) => String(t._id || t.id));
        return { items: data, ids, _cacheKey: getUserKey(state) };
      }
      if (data && typeof data === "object") {
        const items = Array.isArray(data.items) ? data.items : [];
        const ids = Array.isArray(data.favoritesIds)
          ? data.favoritesIds.map(String)
          : items.map((t) => String(t._id || t.id));
        return { items, ids, _cacheKey: getUserKey(state) };
      }
      return { items: [], ids: [], _cacheKey: getUserKey(state) };
    } catch (err) {
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
        return rejectWithValue("canceled");
      }
      if (err?.response?.status === 401) {
        return rejectWithValue("unauthorized");
      }
      const msg = err?.response?.data?.message || err.message || "Error";
      return rejectWithValue(msg);
    }
  }
);

export const addFavorite = createAsyncThunk(
  "favorites/add",
  async (trackId, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const token = state?.auth?.token;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const { data } = await api.post(
        "/me/favorites",
        { trackId },
        { headers, validateStatus: (s) => s >= 200 && s < 300 }
      );
      if (data && Array.isArray(data.favoritesIds))
        return { ids: data.favoritesIds.map(String), _cacheKey: getUserKey(state) };
      return { id: String(trackId), _cacheKey: getUserKey(state) };
    } catch (err) {
      if (err?.response?.status === 401) return rejectWithValue("unauthorized");
      const msg = err?.response?.data?.message || err.message || "Error";
      return rejectWithValue(msg);
    }
  }
);

export const removeFavorite = createAsyncThunk(
  "favorites/remove",
  async (trackId, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const token = state?.auth?.token;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const { data } = await api.delete(`/me/favorites/${trackId}`, {
        headers,
        validateStatus: (s) => s >= 200 && s < 300,
      });
      if (data && Array.isArray(data.favoritesIds))
        return { ids: data.favoritesIds.map(String), _cacheKey: getUserKey(state) };
      return { id: String(trackId), _cacheKey: getUserKey(state) };
    } catch (err) {
      if (err?.response?.status === 401) return rejectWithValue("unauthorized");
      const msg = err?.response?.data?.message || err.message || "Error";
      return rejectWithValue(msg);
    }
  }
);

/* ───────────── slice ───────────── */
const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    toggleLocal(state, action) {
      const payload = action.payload;
      const id = String(payload?.id ?? payload);
      const track = typeof payload === "object" && payload.track ? payload.track : (typeof payload === "object" ? payload : null);

      // quitar de favoritos (ids + items)
      if (state.ids.includes(id)) {
        state.ids = state.ids.filter((x) => x !== id);
        state.items = state.items.filter((t) => String(t._id || t.id) !== id);
        return;
      }

      // añadir a favoritos (ids + items)
      state.ids = Array.isArray(state.ids) ? state.ids : [];
      if (!state.ids.includes(id)) state.ids.push(id);

      // si tenemos el track, lo metemos en items (optimista)
      if (track) {
        const sid = String(track._id || track.id || id);
        const exists = state.items.some((t) => String(t._id || t.id) === sid);
        const normalized = {
          _id: sid,
          id: sid,
          title: track.title || "Unknown",
          artist: track.artist || "",
          coverUrl: track.coverUrl || track.cover || track.image || null,
          ...track,
        };
        if (!exists) state.items.unshift(normalized);
      }

      // cache se sincroniza cuando llega el próximo fulfilled (o podrías escribir aquí si quisieras)
    },
    resetFavorites(state) {
      state.ids = [];
      state.items = [];
      state.error = null;
      state.loading = false;
      state.hasFetchedOnce = false;
      clearAllFavCaches();
    },
  },
  extraReducers: (builder) => {
    builder
      // Hidratar desde cache (no marca hasFetchedOnce)
      .addCase(hydrateFavoritesFromCache.fulfilled, (s, a) => {
        s.items = a.payload.items || [];
        s.ids = a.payload.ids || [];
        s.error = null;
        s.loading = false;
      })
      .addCase(fetchFavoriteTracks.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchFavoriteTracks.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload.items || [];
        s.ids = a.payload.ids || [];
        s.hasFetchedOnce = true;
        if (a.payload?._cacheKey) writeCache(a.payload._cacheKey, s.items, s.ids);
      })
      .addCase(fetchFavoriteTracks.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload === "canceled" ? null : a.payload || "Error";
        // si fue cancelado o unauthorized, no bloqueamos reintentos
        if (a.payload === "canceled" || a.payload === "unauthorized") return;
        s.hasFetchedOnce = true;
      })
      .addCase(addFavorite.fulfilled, (s, a) => {
        if (Array.isArray(a.payload?.ids)) {
          s.ids = a.payload.ids;
          s.items = s.items.filter((t) => s.ids.includes(String(t._id || t.id)));
        } else if (a.payload?.id) {
          const id = a.payload.id;
          if (!s.ids.includes(id)) s.ids.push(id);
        }
        if (a.payload?._cacheKey) writeCache(a.payload._cacheKey, s.items, s.ids);
      })
      .addCase(removeFavorite.fulfilled, (s, a) => {
        if (Array.isArray(a.payload?.ids)) {
          s.ids = a.payload.ids;
          s.items = s.items.filter((t) => s.ids.includes(String(t._id || t.id)));
        } else if (a.payload?.id) {
          const id = a.payload.id;
          s.ids = s.ids.filter((x) => x !== id);
          s.items = s.items.filter((t) => String(t._id || t.id) !== id);
        }
        if (a.payload?._cacheKey) writeCache(a.payload._cacheKey, s.items, s.ids);
      })
      .addCase(logout, (s) => {
        s.ids = [];
        s.items = [];
        s.error = null;
        s.loading = false;
        s.hasFetchedOnce = false;
        clearAllFavCaches();
      });
  },
});

export const { toggleLocal, resetFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;

export const selectFavoriteTracks = (s) => s.favorites.items;
export const selectFavoritesLoading = (s) => s.favorites.loading;
export const selectFavoritesHasFetchedOnce = (s) => s.favorites.hasFetchedOnce;
