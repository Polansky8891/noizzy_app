import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../api/axiosInstance";

const initialState = {
    ids: [],
    items: [],
    loading: false,
    error: null
};

export const fetchFavoriteTracks = createAsyncThunk('favorites/fetchTracks', async () => {
    const { data } = await axiosInstance.get('/me/favorites', { meta: { skipAuthRedirect: true }});
    return Array.isArray(data) ? data : [];
});

export const addFavorite = createAsyncThunk('favorites/add', async (trackId) => {
    await axiosInstance.post('/me/favorites', { trackId }, { meta: { skipAuthRedirect: true }});
    return String(trackId);
});

export const removeFavorite = createAsyncThunk('favorites/remove', async (trackId) => {
    await axiosInstance.delete(`/me/favorites/${trackId}`, { meta: { skipAuthRedirect: true }});
    return String(trackId);
});

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
                s.error = a.error.message || 'Error';
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