import { describe, it, expect, vi, beforeEach } from "vitest";
import reducer, {
    toggleLocal,
    resetFavorites,
    hydrateFavoritesFromCache,
    fetchFavoriteTracks,
    addFavorite,
    removeFavorite,
} from "../../store/favoritesSlice";
import { logout } from "../../store/auth/authSlice";

const initial = () => reducer(undefined, { type: '@@INIT'});

beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
});

describe('favoritesSlice', () => {
    it('estado inicial correcto', () => {
        const s = initial();
        expect(s).toEqual({
            ids: [],
            items: [],
            loading: false,
            error: null,
            hasFetchedOnce: false,
        });
    });

    it('toggleLocal: añade id si no está y lo quita si está', () => {
        let s = initial();

        // añade
        s = reducer(s, toggleLocal('t1'));
        expect(s.ids).toEqual(['t1']);

        // quita
        s = reducer(s, toggleLocal('t1'));
        expect(s.ids).toEqual([]);
    });

    it('resetFavorites: limpia todo y borra caches', () => {
        // prepara caches simulados
        localStorage.setItem('fav_cache_v1:uid1', JSON.stringify({ items: [], ids: [] }));
        localStorage.setItem('otra', 'x');

        const removeSpy = vi.spyOn(Storage.prototype, 'removeItem');

        const pre = {
            ids: ['t1'],
            items: [{ _id: 't1', title: 'A'}],
            loading: true,
            error: 'err',
            hasFetchedOnce: true,
        };

        const s = reducer(pre, resetFavorites());

        expect(s.ids).toEqual([]);
        expect(s.items).toEqual([]);
        expect(s.loading).toBe(false);
        expect(s.error).toBe(null);
        expect(s.hasFetchedOnce).toBe(false);

        // debe intentar eliminar claves que empiecen por prefijo
        expect(removeSpy).toHaveBeenCalledWith('fav_cache_v1:uid1');
    });

    it('hydratedFavoritesFromCache.fulfilled: hidrata ids/items sin marcar hasFetchedOnce', () => {
        const payload = {
            items: [{ _id: '1', title: 'A' }, { _id: '2', title: 'B' }],
            ids: ['1', '2'],
            _cacheKey: 'fav_cache_v1:uid1',
        };
        const s = reducer(initial(), hydrateFavoritesFromCache.fulfilled(payload, 'req1', undefined));
        expect(s.items.map(t => t._id)).toEqual(['1', '2']);
        expect(s.ids).toEqual(['1', '2']);
        expect(s.loading).toBe(false);
        expect(s.error).toBe(null);
        expect(s.hasFetchedOnce).toBe(false);
    });

    it('fetchFavoriteTracks.pending: pone loading y limpia error', () => {
        const pre = { ...initial(), error: 'X', loading: false };
        const s = reducer(pre, fetchFavoriteTracks.pending('req1'));
        expect(s.loading).toBe(true);
        expect(s.error).toBe(null);
    });

    it('fetchFavoritetracks.fulfilled: guarda items/ids, marca hasFetchedOnce y escribe cache', () => {
        const setSpy = vi.spyOn(Storage.prototype, 'setItem');
        const payload = {
            items: [{ _id: '1', title: 'A'}, { _id: '2', title: 'B'}],
            ids: ['1', '2'],
            _cacheKey: 'fav_cache_v1:uidX',
        };
        const s = reducer(initial(), fetchFavoriteTracks.fulfilled(payload, 'req1', undefined));

        expect(s.loading).toBe(false);
        expect(s.items.map(t => t._id)).toEqual(['1', '2']);
        expect(s.ids).toEqual(['1', '2']);
        expect(s.hasFetchedOnce).toBe(true);
        expect(setSpy).toHaveBeenCalledWith(
            'fav_cache_v1:uidX',
            JSON.stringify({ items: s.items, ids: s.ids} )
        );
    });

    it("fetchFavoriteTracks.rejected: si payload='canceled' no marca hasFetchedOnce", () => {
        const r1 = reducer(initial(), fetchFavoriteTracks.rejected(
            { name: 'CanceledError' }, 'req1', undefined, 'canceled'
        ));
        expect(r1.loading).toBe(false);
        expect(r1.error).toBe(null);
        expect(r1.hasFetchedOnce).toBe(false);
    });

    it('fetchFavoriteTracks.rejected: si payload genérico marca hasFetchedOnce y setea error', () => {
        const r2 = reducer(initial(), fetchFavoriteTracks.rejected(
            { name: 'SomeError' }, 'req1', undefined, 'boom'
        ));
        expect(r2.loading).toBe(false);
        expect(r2.error).toBe('boom');
        expect(r2.hasFetchedOnce).toBe(true);
    });

    it('addFavorite.fulfilled con ids[]: reemplaza ids y filtra items', () => {
        const setSpy = vi.spyOn(Storage.prototype, 'setItem');
        const pre = {
            ids: ['1', '2', '3'],
            items: [
                { _id: '1', title: 'A' },
                { _id: '2', title: 'B' },
                { _id: '3', title: 'C' },
            ],
            loading: false,
            error: null,
            hasFetchedOnce: true,
        };
        const payload = { ids: ['1', '3'], _cacheKey: 'fav_cache_v1:uid1' };
        const s = reducer(pre, addFavorite.fulfilled(payload, 'req1', 'ignored'));

        expect(s.ids).toEqual(['1', '3']);
        expect(s.items.map(t => t._id)).toEqual(['1', '3']);
        expect(setSpy).toHaveBeenCalled();
    });

    it('removeFavorite.fulfilled con id único: elimina ese id e item', () => {
        const pre = {
            ids: ['1', '2'],
            items: [
                { _id: '1', title: 'A' },
                { _id: '2', title: 'B' },
            ],
            loading: false, 
            error: null,
            hasFetchedOnce: true,
        };
        const payload = { id: '1', _cacheKey: 'fav_cache_v1:uid1' };
        const s = reducer(pre, removeFavorite.fulfilled(payload, 'req1', '1'));

        expect(s.ids).toEqual(['2']);
        expect(s.items.map(t => t._id)).toEqual(['2']);
    });

    it('logout (extraReducer): limpia estado y borra caches con prefijo', () => {
        //prepara caches que deben eliminarse
        localStorage.setItem('fav_cache_v1:uid1', '{}');
        localStorage.setItem('fav_cache_v1:uid2', '{}');
        localStorage.setItem('otra', '{}');

        const removeSpy = vi.spyOn(Storage.prototype, 'removeItem');

        const pre = {
            ids: ['1'],
            items: [{ _id: '1', title: 'A' }],
            loading: false,
            error: null,
            hasFetchedOnce: true,
        };

        const s = reducer(pre, logout());

        expect(s.ids).toEqual([]);
        expect(s.items).toEqual([]);
        expect(s.loading).toBe(false);
        expect(s.error).toBe(null);
        expect(s.hasFetchedOnce).toBe(false);

        // se deben haber intentado eliminar las claves con prefijo
        expect(removeSpy).toHaveBeenCalledWith('fav_cache_v1:uid1');
        expect(removeSpy).toHaveBeenCalledWith('fav_cache_v1:uid2');
    });
});