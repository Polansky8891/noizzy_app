import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FavButton } from "../../components/FavButton";

/* ─────────────────────────── mocks redux ─────────────────────────── */
const state = {
    auth: { status: 'authenticated' },
    favorites: { ids: [] },
};

// outcome de los thunks add/remove (resolve | reject)
let thunkOutcome = 'resolve';

// mock de actions del slice (módulo que importa el componente)
const slice = vi.hoisted(() => ({
    addFavorite: vi.fn((id) => ({ __thunk: true, kind: 'add', id})),
    removeFavorite: vi.fn((id) => ({ __thunk: true, kind: 'remove', id})),
    toggleLocal: vi.fn((id) => ({ type: 'favorites/toggleLocal', payload: id})),
}));
vi.mock('../../store/favoritesSlice', () => slice);

// mock de react-redux hooks
const dispatchSpy = vi.fn();
vi.mock('react-redux', () => ({
    useDispatch: () => (action) => {
        dispatchSpy(action);

        // Simulamos comportamiento del store para toggleLocal (optimista/reversión)
        if (action?.type === 'favorites/toggleLocal') {
            const id = action.payload;
            const exists = state.favorites.ids.includes(id);
            state.favorites.ids = exists  
                ? state.favorites.ids.filter((x) => x !== id)
                : state.favorites.ids.concat(id);
            return action;
        }

        // Thunks: devolvemos un objeto con unwrap()
        if (action?.__thunk) {
            return {
                unwrap: () =>
                    thunkOutcome === 'resolve'
                        ? Promise.resolve()
                        : Promise.reject(new Error('boom')),
            };
        }

        return action;
    },
    useSelector: (sel) => sel(state),
}));

/* ───────────────────────── helpers ───────────────────────── */
const OBJ_ID = "507f1f77bcf86cd799439011";

function renderFav(trackId = OBJ_ID) {
    return render(<FavButton trackId={trackId} />);
}

describe('<FavButton />', () => {
    beforeEach(() => {
        //reset
        state.auth.status = 'authenticated';
        state.favorites.ids = [];
        thunkOutcome = 'resolve';
        dispatchSpy.mockClear();

        slice.addFavorite.mockClear();
        slice.removeFavorite.mockClear();
        slice.toggleLocal.mockClear();
    });

    it('si NO es favorito, click: optimista + addFavorite()', async () => {
        const user = userEvent.setup();
        renderFav();

        const btn = screen.getByRole('button', { name: 'Añadir a favoritos'});
        await user.click(btn);

        // optimismo
        expect(slice.toggleLocal).toHaveBeenCalledWith(OBJ_ID);
        // persistencia
        expect(slice.addFavorite).toHaveBeenCalledWith(OBJ_ID);
        expect(slice.removeFavorite).not.toHaveBeenCalled();
    });

    it('si YA es favorito, click: optimista + removeFavorite()', async () => {
        const user = userEvent.setup();
        state.favorites.ids = [OBJ_ID];
        renderFav();

        const btn = screen.getByRole('button', { name: 'Quitar de favoritos'});
        await user.click(btn);

        expect(slice.toggleLocal).toHaveBeenCalledWith(OBJ_ID);
        expect(slice.removeFavorite).toHaveBeenCalledWith(OBJ_ID);
        expect(slice.addFavorite).not.toHaveBeenCalled();
    });

    it('si thunk falla, hace rollback (2 toggles: optimista + revertir)', async () => {
        const user = userEvent.setup();
        thunkOutcome = 'reject'; // fuerza fallo de API

        renderFav();
        const btn = screen.getByRole('button', { name: 'Añadir a favoritos' });
        await user.click(btn);

        // togle optimista + toggle de reversión
        expect(slice.toggleLocal).toHaveBeenCalledTimes(2);
        expect(slice.addFavorite).toHaveBeenCalledTimes(1);
    });

    it('si no está autenticado, no despacha nada', async () => {
        const user = userEvent.setup();
        state.auth.status = 'unauthenticated';

        renderFav();
        const btn = screen.getByRole('button', { name: 'Añadir a favoritos'});
        await user.click(btn);

        expect(slice.toggleLocal).not.toHaveBeenCalled();
        expect(slice.addFavorite).not.toHaveBeenCalled();
        expect(slice.removeFavorite).not.toHaveBeenCalled();
    });

    it('si el id NO es ObjectId válido, no despacha nada', async () => {
        const user = userEvent.setup();
        renderFav('abc'); // inválido

        const btn = screen.getByRole('button', { name: 'Añadir a favoritos'});
        await user.click(btn);

        expect(slice.toggleLocal).not.toHaveBeenCalled();
        expect(slice.addFavorite).not.toHaveBeenCalled();
        expect(slice.removeFavorite).not.toHaveBeenCalled();
    });

    it('stopPropagation: no burbujea el click al padre', async () => {
        const user = userEvent.setup();
        const parentClick = vi.fn();

        render(
            <div onClick={parentClick}>
                <FavButton trackId={OBJ_ID} />
            </div>
        );

        const btn = screen.getByRole('button', { name: 'Añadir a favoritos'});
        await user.click(btn);

        expect(parentClick).not.toHaveBeenCalled();
    });
});