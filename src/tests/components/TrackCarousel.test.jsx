import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ---------- Mocks hoisted ----------
const playerMock = vi.hoisted(() => ({
    playTrack: vi.fn(),
}));
vi.mock('../../components/PlayerContext', () => ({
    usePlayer: () => playerMock,
}));

// Permitimos controlar loading/items desde cada test
const cacheState = vi.hoisted(() => ({ items: [], loading: true }));
vi.mock('../../hooks/useCachedTracks', () => ({
    useCachedTracks: () => cacheState,
}));

vi.mock('../../api/axios', () => ({ default: { get: vi.fn() } }));

// Capturamos props de SmartImage (para asertar priority)
vi.mock('../../components/SmartImage', () => ({
    default: (props) => (
        <img   
            data-testid='smartimg'
            alt={props.alt}
            src={props.src || ''}
            data-priority={props.priority ? 'true' : 'false'}
        />
    ),
}));

import TrackCarousel from "../../components/TrackCarousel";

const sample = (n = 3) =>
    Array.from({ length: n }, (_, i) => ({
        id: `t${i + 1}`,
        title: `Track ${i + 1}`,
        artist: `Artist ${i + 1}`,
        coverUrl: `https://example.com/c${i + 1}.png`,
    }));

describe('<TrackCarousel />', () => {
    beforeEach(() => {
        playerMock.playTrack.mockReset();
        cacheState.items = [];
        cacheState.loading = true;
    });

    it('muestra el título si se proporciona', () => {
        render(<TrackCarousel title='Recomendados' feel='chill' />);
        expect(screen.getByText('Recomendados')).toBeInTheDocument();
    });

    it('en carga inicial sin items: NO muestra emptyText y NO renderiza tarjetas clicables', () => {
        cacheState.items = [];
        cacheState.loading = true;

        render(<TrackCarousel title='X' emptyText="Vacío" />);
        // no hay botones en TrackCard mientras solo hay Skeletons
        expect(screen.queryByRole('button')).toBeNull();
        // el estado vacío no debe aparecer mientras loading
        expect(screen.queryByText('Vacío')).toBeNull();
        // y no hay imágenes aún
        expect(screen.queryAllByTestId('smarting')).toHaveLength(0);
    });

    it('renderiza los items cuando termina la carga', () => {
        cacheState.items = sample(3);
        cacheState.loading = false;

        render(<TrackCarousel title='Top' feel='rock' />);

        // Hay 3 tarjetas (role="button" en TrackCard)
        const cards = cacheState.items.map((t) => screen.getByTitle(t.title));
        expect(cards).toHaveLength(3);

        // Imágenes con alt = título
        const imgs = screen.getAllByTestId('smartimg');
        expect(imgs).toHaveLength(3);
        expect(imgs[0]).toHaveAttribute('alt', 'Track 1');
    });

    it('las dos primeras imágenes tienen prioridad y las demás no', () => {
        cacheState.items = sample(4);
        cacheState.loading = false;

        render(<TrackCarousel feel='electro' />);

        const imgs = screen.getAllByTestId('smartimg');
        expect(imgs[0]).toHaveAttribute("data-priority", "true");
        expect(imgs[1]).toHaveAttribute("data-priority", "true");
        expect(imgs[2]).toHaveAttribute("data-priority", "false");
        expect(imgs[3]).toHaveAttribute("data-priority", "false");
    });

    it('al hacer click en una tarjeta se llama a playTrack con el track', async () => {
        const user = userEvent.setup();
        cacheState.items = sample(2);
        cacheState.loading = false;

        render(<TrackCarousel feel='pop' />);

        const firstCard = screen.getByTitle('Track 1');
        await user.click(firstCard);

        expect(playerMock.playTrack).toHaveBeenCalledTimes(1);
        expect(playerMock.playTrack).toHaveBeenCalledWith(cacheState.items[0]);
    });

    it('teclado: Enter y Space también disparan onPlay', async () => {
        const user = userEvent.setup();
        cacheState.items = sample(1);
        cacheState.loading = false;

        render(<TrackCarousel feel='jazz' />);

        const card = screen.getByTitle('Track 1');
        card.focus();
        await user.keyboard('{Enter}');
        await user.keyboard(' ');

        expect(playerMock.playTrack).toHaveBeenCalledTimes(2);
        expect(playerMock.playTrack).toHaveBeenLastCalledWith(cacheState.items[0]);
    });

    it('muestra el emptyText cuando no hay items y no está cargando', () => {
        cacheState.items = [];
        cacheState.loading = false;

        render(<TrackCarousel emptyText="No hay temas disponibles." />);
        expect(
            screen.getByText('No hay temas disponibles.')
        ).toBeInTheDocument();
    });
});