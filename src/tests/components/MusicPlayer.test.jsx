import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { MusicPlayer } from "../../components/MusicPlayer";
import { usePlayer } from "../../components/PlayerContext";

// Mock del FavButton (no queremos lógica real aquí)
vi.mock('../../components/FavButton', () => ({
    FavButton: ({ trackId }) => <div data-testid='fav-btn'>fav:{String(trackId || '')}</div>,
}));

// Espías para el player
const player = {
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  playTrack: vi.fn(),
  pauseTrack: vi.fn(),
  seek: vi.fn(),
  skipForward: vi.fn(),
  skipBackward: vi.fn(),
  volume: 0.5,
  setVolume: vi.fn(),
  muted: false,
  toggleMute: vi.fn(),
};

// Mock del hook usePlayer (MusicPlayer lo importa localmente)
vi.mock('../../components/PlayerContext', () => ({
    usePlayer: () => player,
}));

/* ──────────────────────── Helpers ──────────────────────── */
const renderUI = () => render(<MusicPlayer />);

beforeEach(() => {
    vi.clearAllMocks();
    // reset estado "por defecto"
    player.currentTrack = null;
    player.isPlaying = false;
    player.progress = 0;
    player.duration = 0;
    player.volume = 0.5;
    player.muted = false;
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('MusicPlayer', () => {
    it('con NO pista: controles deshabilitados y tiempos 0:00', () => {
        renderUI();

        // Botón play/pause existente pero deshabilitado
        const playBtn = screen.getByRole('button', { name: /reproducir/i});
        expect(playBtn).toBeDisabled();

        // Skip back/forward deshabilitados
        expect(screen.getByRole('button', { name: /retroceder 10 segundos/i})).toBeDisabled();
        expect(screen.getByRole('button', { name: /avanzar 10 segundos/i})).toBeDisabled();

        // Slider volumen deshabilitado
        expect(screen.getByRole('slider', { name: /volumen/i })).toBeDisabled();

        // Tiempos
        const times = screen.getAllByText('0:00');
        expect(times).toHaveLength(2);
    });

    it('muestra datos básicos y FavButton cuando hay pista', () => {
        player.currentTrack = {
            id: 't1',
            title: 'Song A',
            artist: 'X',
            cover: '/cover.jpg',
        };
        renderUI();

        // Título/artista visibles
        expect(screen.getAllByText('Song A')[0]).toBeInTheDocument();
        expect(screen.getAllByText('X')[0]).toBeInTheDocument();

        // FavButton recibe trackId
        const favs = screen.getAllByTestId('fav-btn');
        expect(favs.length).toBeGreaterThan(0);
        favs.forEach( el => expect(el).toHaveTextContent('fav:t1'));

        // El botón play ahora NO está deshabilitado
        const playBtn = screen.getByRole('button', { name: /reproducir/i });
        expect(playBtn).not.toBeDisabled();
    });

    it('click en Reproducir llama a playTrack(currentTrack)', () => {
        player.currentTrack = { id: 't1', title: 'A' };
        renderUI();

        fireEvent.click(screen.getByRole('button', { name: /reproducir/i }));
        expect(player.playTrack).toHaveBeenCalledTimes(1);
        expect(player.playTrack).toHaveBeenCalledWith(player.currentTrack);
    });

    it('si está al final (progress≈duration), al darle a play hace seek(0) y playTrack', () => {
        player.currentTrack = { id: 't1', title: 'A'};
        player.isPlaying = false;
        player.duration = 120;
        player.progress = 119.9; // dentro del margen 0.25s
        renderUI();

        fireEvent.click(screen.getByRole('button', { name: /reproducir/i}));
        expect(player.seek).toHaveBeenCalledWith(0);
        expect(player.playTrack).toHaveBeenCalledWith(player.currentTrack);
    });

    it('click en barra de progreso hace seek a la posición calculada', () => {
        player.currentTrack = { id: 't1', title: 'A'};
        player.duration = 100;
        player.progress = 0;
        renderUI();

        const bar = screen.getByRole('progressbar', { name: /barra de progreso/i});

        // Mock del tamaño/posición de la barra
        const rectSpy = vi.spyOn(bar, 'getBoundingClientRect').mockReturnValue({
            left: 100, width: 200, top: 0, right: 300, bottom: 0, height: 0, x: 100, y: 0, toJSON: () => {},
        });

        // Clic en el punto medio -> 50% -> seek(50)
        fireEvent.click(bar, { clientX: 200 });
        expect(player.seek).toHaveBeenCalledWith(50);

        rectSpy.mockRestore();
    });

    it('skipBackward/skipForward llaman con 10s', () => {
        player.currentTrack = { id: 't1'};
        renderUI();

        fireEvent.click(screen.getByRole('button', { name: /retroceder 10 segundos/i}));
        expect(player.skipBackward).toHaveBeenCalledWith(10);

        fireEvent.click(screen.getByRole('button', { name: /avanzar 10 segundos/i }));
        expect(player.skipForward).toHaveBeenCalledWith(10);
    });

    it('toggleMute se dispara y respeta aria-pressed', () => {
        player.currentTrack = { id: 't1' };
        renderUI();

        const muteBtn = screen.getByRole('button', { name: /silenciar/i });
        expect(muteBtn).toHaveAttribute('aria-pressed', 'false');

        fireEvent.click(muteBtn);
        expect(player.toggleMute).toHaveBeenCalledTimes(1);
    });

    it('mover el slider de volumen llama a setVolume con el número correcto', () => {
        player.currentTrack = { id: 't1'};
        renderUI();

        const slider = screen.getByRole('slider', { name: /volumen/i });
        fireEvent.change(slider, { target: { value: '0.73' } });
        expect(player.setVolume).toHaveBeenCalledWith(0.73);
    });
})