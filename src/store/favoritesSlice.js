import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../api/axiosInstance";

const initialState = {
    ids: [],
    items: [],
    loading: false,
    error: null
};

export const fetchFavoriteTracks = createAsyncThunk(
    'favorites/fetchTracks',
     async (__dirname, { rejectWithValue, signal }) => {
        try {
            const res = await axiosInstance.get('/me/favorites', {
                signal,
                meta: { skipAuthRedirect: true },
                validateStatus: (s) => (s >= 200 && s < 300) || s === 204,
            });
            if (res.status === 204) return [];
            return Array.isArray(res.data) ? res.data : [];
        } catch (err) {
            if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') {
                return rejectWithValue('canceled');
            }
            const msg = err?.response?.data?.message || err.message || 'Error';
            return rejectWithValue(msg);
        }
     } 
    );

export const addFavorite = createAsyncThunk(
  "favorites/add",
  async (trackId, { rejectWithValue }) => {
    try {
      await axiosInstance.post(
        "/me/favorites",
        { trackId },
        { meta: { skipAuthRedirect: true } }
      );
      return String(trackId);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Error";
      return rejectWithValue(msg);
    }
  }
);

export const removeFavorite = createAsyncThunk(
  "favorites/remove",
  async (trackId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/me/favorites/${trackId}`, {
        meta: { skipAuthRedirect: true },
      });
      return String(trackId);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Error";
      return rejectWithValue(msg);
    }
  }
);


const favoritesSlice = createSlice({
    name: 'favorites',
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
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFavoriteTracks.pending, (s) => {
                s.loading = true;
                s.error = null;
            })
            .addCase(fetchFavoriteTracks.fulfilled, (s, a) => {
                s.loading = false;
                s.items = a.payload;
                s.ids = a.payload.map((t) => String(t._id || t.id));
            })
            .addCase(fetchFavoriteTracks.rejected, (s, a) => {
                s.loading = false;
                s.error = a.payload === 'canceled' ? null : a.payload || 'Error';
            })
            .addCase(addFavorite.fulfilled, (s, a) => {
                const id = String(a.payload);
                if (!s.ids.includes(id)) s.ids.push(id);
            })
            .addCase(removeFavorite.fulfilled, (s, a) => {
                const id = String(a.payload);
                s.ids = s.ids.filter(x => x !== id);
                s.items = s.items.filter(t => String(t._id || t.id) !== id);
            });
    }

});

export const { toggleLocal, resetFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;

export const selectFavoriteTracks = (s) => s.favorites.items;
export const selectFavoritesLoading = (s) => s.favorites.loading;