import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Importamos el componente con alias (más robusto que rutas relativas)
import { MusicPlayer } from '@/components/MusicPlayer';

// ───────────────────────────
// Mocks (usePlayer y FavButton)
// ───────────────────────────

const fns = {
  playTrack: vi.fn(),
  pauseTrack: vi.fn(),
  seek:       vi.fn(),
  skipForward: vi.fn(),
  skipBackward: vi.fn(),
  setVolume:  vi.fn(),
  toggleMute: vi.fn(),
};

let state;

// mock de usePlayer (lo haremos retornar `state`)
vi.mock('@/components/PlayerContext', () => ({
  usePlayer: () => state,
}));

// FavButton -> stub visual (que no interfiera)
vi.mock('@/components/FavButton', () => ({
  FavButton: ({ trackId }) => <button data-testid="fav-btn">fav-{String(trackId)}</button>,
}));

const renderPlayer = () => render(<MusicPlayer />);

beforeEach(() => {
  vi.clearAllMocks();

  // estado por defecto: sin pista
  state = {
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    duration: 0,
    volume: 1,
    muted: false,
    ...fns,
  };
});

// helper para mockear el rect de la barra de progreso
function mockRect(el, { left = 0, width = 200 } = {}) {
  el.getBoundingClientRect = () =>
    ({ left, width, top: 0, height: 10, right: left + width, bottom: 10 });
}

// ───────────────────────────
// TESTS
// ───────────────────────────

describe('MusicPlayer', () => {
  it('deshabilita controles si no hay pista', () => {
    renderPlayer();
    const playBtn = screen.getByRole('button', { name: /reproducir|pausar/i });
    const vol = screen.getByRole('slider', { name: /volumen/i });

    expect(playBtn).toBeDisabled();
    expect(vol).toBeDisabled();

    // progressbar accesible
    const bar = screen.getByRole('progressbar', { name: /barra de progreso/i });
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '0');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
  });

  it('muestra info de pista y permite play', () => {
    state.currentTrack = { _id: 't1', title: 'Song A', artist: 'Artist A', cover: '/c.png' };
    renderPlayer();

    const titles = screen.getAllByText('Song A');
    expect(titles.length).toBeGreaterThan(0);
    expect(titles[0]).toBeInTheDocument();

    const artists = screen.getAllByText('Artist A');
    expect(artists.length).toBeGreaterThan(0);
    


    const playBtn = screen.getByRole('button', { name: /reproducir|pausar/i });
    fireEvent.click(playBtn);
    expect(artists[0]).toBeInTheDocument();

    expect(fns.playTrack).toHaveBeenCalledWith(state.currentTrack);
    // se renderiza FavButton con trackId
    expect(screen.getAllByTestId('fav-btn')[0]).toHaveTextContent('fav-t1');
  });

  it('si está casi al final, al pulsar play hace seek(0) y luego playTrack', () => {
    state.currentTrack = { _id: 't2', title: 'End Song' };
    state.duration = 120;      // 2:00
    state.progress = 119.9;    // > 120 - 0.25
    renderPlayer();

    const playBtn = screen.getByRole('button', { name: /reproducir|pausar/i });
    fireEvent.click(playBtn);

    expect(fns.seek).toHaveBeenCalledWith(0);
    expect(fns.playTrack).toHaveBeenCalledWith(state.currentTrack);
  });

  it('si está reproduciendo, el botón central pausa', () => {
    state.currentTrack = { _id: 't3' };
    state.isPlaying = true;
    renderPlayer();

    const pauseBtn = screen.getByRole('button', { name: /pausar/i });
    fireEvent.click(pauseBtn);

    expect(fns.pauseTrack).toHaveBeenCalledTimes(1);
  });

  it('click en la barra de progreso hace seek proporcional', () => {
    state.currentTrack = { _id: 't4' };
    state.duration = 200;
    state.progress = 50;
    renderPlayer();

    const bar = screen.getByRole('progressbar', { name: /barra de progreso/i });
    mockRect(bar, { left: 0, width: 300 });

    // click al 50%
    fireEvent.click(bar, { clientX: 150 });
    expect(fns.seek).toHaveBeenCalled();
    const value = fns.seek.mock.calls.at(-1)[0];
    expect(value).toBeCloseTo(100, 1); // 50% de 200 => 100
  });

  it('cambia volumen con el slider y actualiza el %', () => {
    state.currentTrack = { _id: 't5' };
    state.volume = 0.3;
    renderPlayer();

    const slider = screen.getByRole('slider', { name: /volumen/i });
    fireEvent.change(slider, { target: { value: '0.8' } });

    expect(fns.setVolume).toHaveBeenCalledWith(0.8);
    // el % que pinta el componente depende del estado; aquí solo validamos el slider
  });

  it('toggle mute llama a toggleMute', () => {
    state.currentTrack = { _id: 't6' };
    renderPlayer();

    // el botón de mute está oculto en mobile; el selector tiene "hidden sm:block"
    // JSDOM no aplica media queries, pero el nodo existe en el DOM si se renderiza.
    const muteBtn = screen.getByRole('button', { name: /silenciar|quitar silencio/i });
    fireEvent.click(muteBtn);

    expect(fns.toggleMute).toHaveBeenCalledTimes(1);
  });

  it('botones de skip llaman a sus acciones', () => {
    state.currentTrack = { _id: 't7' };
    renderPlayer();

    const back = screen.getByRole('button', { name: /retroceder 10 segundos/i });
    const fwd  = screen.getByRole('button', { name: /avanzar 10 segundos/i });

    fireEvent.click(back);
    fireEvent.click(fwd);

    expect(fns.skipBackward).toHaveBeenCalledWith(10);
    expect(fns.skipForward).toHaveBeenCalledWith(10);
  });
});
