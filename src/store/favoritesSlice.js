import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

const initialState = {
    ids: [],
    items: [],
    loading: false,
    error: null
};

export const fetchFavoriteTracks = createAsyncThunk(
  "favorites/fetchTracks",
  async (_ , { rejectWithValue, signal }) => {
    try {
      const res = await api.get("/me/favorites", {
        signal,
        // 2xx o 204 son ok
        validateStatus: (s) => (s >= 200 && s < 300) || s === 204,
      });

      if (res.status === 204) return { items: [], ids: [] };

      const data = res.data;
      if (Array.isArray(data)) {
        const ids = data.map((t) => String(t._id || t.id));
        return { items: data, ids };
      }
      if (data && typeof data === "object") {
        const items = Array.isArray(data.items) ? data.items : [];
        const ids = Array.isArray(data.favoritesIds)
          ? data.favoritesIds.map(String)
          : items.map((t) => String(t._id || t.id));
        return { items, ids };
      }
      return { items: [], ids: [] };
    } catch (err) {
      // cancelación
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") {
        return rejectWithValue("canceled");
      }
      // si llegó aquí tras el retry del interceptor y sigue siendo 401, probablemente sesión inválida/revocada
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
  async (trackId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/me/favorites",
        { trackId },
        { validateStatus: (s) => s >= 200 && s < 300 }
      );
      if (data && Array.isArray(data.favoritesIds))
        return { ids: data.favoritesIds.map(String) };
      return { id: String(trackId) };
    } catch (err) {
      if (err?.response?.status === 401) return rejectWithValue("unauthorized");
      const msg = err?.response?.data?.message || err.message || "Error";
      return rejectWithValue(msg);
    }
  }
);

export const removeFavorite = createAsyncThunk(
  "favorites/remove",
  async (trackId, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/me/favorites/${trackId}`, {
        validateStatus: (s) => s >= 200 && s < 300,
      });
      if (data && Array.isArray(data.favoritesIds))
        return { ids: data.favoritesIds.map(String) };
      return { id: String(trackId) };
    } catch (err) {
      if (err?.response?.status === 401) return rejectWithValue("unauthorized");
      const msg = err?.response?.data?.message || err.message || "Error";
      return rejectWithValue(msg);
    }
  }
);

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    toggleLocal(state, action) {
      const id = String(action.payload);
      if (state.ids.includes(id)) {
        state.ids = state.ids.filter((x) => x !== id);
        state.items = state.items.filter((t) => String(t._id || t.id) !== id);
      } else {
        state.ids = Array.isArray(state.ids) ? state.ids : [];
        state.ids.push(id);
      }
    },
    resetFavorites(state) {
      state.ids = [];
      state.items = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavoriteTracks.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchFavoriteTracks.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload.items || [];
        s.ids = a.payload.ids || [];
      })
      .addCase(fetchFavoriteTracks.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload === "canceled" ? null : a.payload || "Error";
      })
      .addCase(addFavorite.fulfilled, (s, a) => {
        if (Array.isArray(a.payload?.ids)) s.ids = a.payload.ids;
        else if (a.payload?.id) {
          const id = a.payload.id;
          if (!s.ids.includes(id)) s.ids.push(id);
        }
      })
      .addCase(removeFavorite.fulfilled, (s, a) => {
        if (Array.isArray(a.payload?.ids)) {
          s.ids = a.payload.ids;
          s.items = s.items.filter((t) =>
            s.ids.includes(String(t._id || t.id))
          );
        } else if (a.payload?.id) {
          const id = a.payload.id;
          s.ids = s.ids.filter((x) => x !== id);
          s.items = s.items.filter((t) => String(t._id || t.id) !== id);
        }
      });
  },
});

export const { toggleLocal, resetFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;

export const selectFavoriteTracks = (s) => s.favorites.items;
export const selectFavoritesLoading = (s) => s.favorites.loading;