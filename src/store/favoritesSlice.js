import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    ids: [],
    items: [],
    loading: false,
    error: null
};

export const fetchFavoriteTracks = createAsyncThunk('favorites/fetchTracks', async () => {
    const { data } = await axios.get('/api/me/favorites');
    return data;
});

export const addFavorite = createAsyncThunk('favorites/add', async (trackId) => {
    await axios.post('/api/me/favorites', { trackId });
    return trackId;
});

export const removeFavorite = createAsyncThunk('favorites/remove', async (trackId) => {
    await axios.delete(`/api/me/favorites/${trackId}`);
    return trackId;
});

const favoritesSlice = createSlice({
    name: 'favorites',
    initialState,
    reducers: {
        
        toggleLocal(state, action) {
            const id = action.payload;
            if (state.ids.includes(id)) {
                state.ids = state.ids.filter(x => x !== id);
                state.items = state.items.filter(t => (t._id || t.id) !== id);
            } else {
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
                s.ids = a.payload;
            })
            .addCase(fetchFavoriteTracks.rejected, (s, a) => {
                s.loading = false;
                s.error = a.error.message || 'Error';
            })
            .addCase(addFavorite.fulfilled, (s, a) => {
                if (!s.ids.includes(a.payload)) s.ids.push(a.payload);
            })
            .addCase(removeFavorite.fulfilled, (s, a) => {
                const id = a.payload;
                s.ids = s.ids.filter(x => x !== id);
                s.items = s.items.filter(t => (t._id || t.id) !== id);
            });
    }

});

export const { toggleLocal, resetFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;

export const selectFavoriteTracks = (s) => s.favorites.items;
export const selectFavoritesLoading = (s) => s.favorites.loading;