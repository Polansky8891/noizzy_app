import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
    ids: [],
    loading: false,
    error: null
};

export const fetchFavorites = createAsyncThunk('favorites/fetch', async () => {
    const { data } = await axios.get('/api/me/favorites');
    return data.map((t) => t._id || t.id);
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
            } else {
                state.ids.push(id);
            }
        },
        resetFavorites(state) {
            state.ids = [];
            state.error = null;
            state.loading = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFavorites.pending, (s) => {
                s.loading = true;
                s.error = null;
            })
            .addCase(fetchFavorites.fulfilled, (s, a) => {
                s.loading = false;
                s.ids = a.payload;
            })
            .addCase(fetchFavorites.rejected, (s, a) => {
                s.loading = false;
                s.error = a.error.message || 'Error';
            })
            .addCase(addFavorite.fulfilled, (s, a) => {
                if (!s.ids.includes(a.payload)) s.ids.push(a.payload);
            })
            .addCase(removeFavorite.fulfilled, (s, a) => {
                s.ids = s.ids.filter(id => id !== a.payload);
            });
    }

});

export const { toggleLocal, resetFavorites } = favoritesSlice.actions;
export default favoritesSlice.reducer;