import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

/* ───────── HOISTED mocks ───────── */

// Mock del PlayerContext
const playerMocks = vi.hoisted(() => ({
  state: {
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    duration: 0,
    volume: 0.7,
    muted: false,
  },
  playTrack: vi.fn(),
  pauseTrack: vi.fn(),
  seek: vi.fn(),
  skipForward: vi.fn(),
  skipBackward: vi.fn(),
  setVolume: vi.fn(),
  toggleMute: vi.fn(),
}));
vi.mock("../../components/PlayerContext", () => ({
  __esModule: true,
  usePlayer: () => ({
    currentTrack: playerMocks.state.currentTrack,
    isPlaying: playerMocks.state.isPlaying,
    progress: playerMocks.state.progress,
    duration: playerMocks.state.duration,
    playTrack: playerMocks.playTrack,
    pauseTrack: playerMocks.pauseTrack,
    seek: playerMocks.seek,
    skipForward: playerMocks.skipForward,
    skipBackward: playerMocks.skipBackward,
    volume: playerMocks.state.volume,
    setVolume: playerMocks.setVolume,
    muted: playerMocks.state.muted,
    toggleMute: playerMocks.toggleMute,
  }),
}));

// Mock FavButton simple (inspeccionamos props mínimas)
const favSpy = vi.hoisted(() => ({ lastProps: null }));
vi.mock("../../components/FavButton", () => ({
  __esModule: true,
  FavButton: (props) => {
    favSpy.lastProps = props;
    return <button data-testid="fav-btn">fav</button>;
  },
}));

// Import del componente DESPUÉS de mocks
import { MusicPlayer } from "../../components/MusicPlayer.jsx";

beforeEach(() => {
  vi.clearAllMocks();
  // estado por defecto
  playerMocks.state.currentTrack = null;
  playerMocks.state.isPlaying = false;
  playerMocks.state.progress = 0;
  playerMocks.state.duration = 0;
  playerMocks.state.volume = 0.7;
  playerMocks.state.muted = false;
});

afterEach(() => vi.restoreAllMocks());

describe("MusicPlayer", () => {
  it("deshabilita controles cuando no hay currentTrack", () => {
    render(<MusicPlayer />);

    expect(screen.getByRole("button", { name: /retroceder 10 segundos/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /reproducir|pausar/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /avanzar 10 segundos/i })).toBeDisabled();
    expect(screen.getByRole("slider", { name: /volumen/i })).toBeDisabled();
  });

  it("play: si no está reproduciendo, hace playTrack; si estaba al final, resetea con seek(0) antes", async () => {
    const user = userEvent.setup();
    playerMocks.state.currentTrack = { id: "t1", title: "S", artist: "A", cover: "c.jpg" };
    playerMocks.state.isPlaying = false;
    playerMocks.state.duration = 100;
    playerMocks.state.progress = 99.9; // >= duration - 0.25

    render(<MusicPlayer />);
    await user.click(screen.getByRole("button", { name: /reproducir/i }));

    expect(playerMocks.seek).toHaveBeenCalledWith(0);
    expect(playerMocks.playTrack).toHaveBeenCalledWith(
      expect.objectContaining({ id: "t1", title: "S" })
    );
  });

  it("pause: si está reproduciendo, hace pauseTrack", async () => {
    const user = userEvent.setup();
    playerMocks.state.currentTrack = { id: "t1" };
    playerMocks.state.isPlaying = true;
    playerMocks.state.duration = 100;
    playerMocks.state.progress = 10;

    render(<MusicPlayer />);
    await user.click(screen.getByRole("button", { name: /pausar/i }));

    expect(playerMocks.pauseTrack).toHaveBeenCalledTimes(1);
    expect(playerMocks.playTrack).not.toHaveBeenCalled();
  });

  it("skip ±10s llama a skipBackward/skipForward con 10", async () => {
    const user = userEvent.setup();
    playerMocks.state.currentTrack = { id: "t1" };

    render(<MusicPlayer />);

    await user.click(screen.getByRole("button", { name: /retroceder 10 segundos/i }));
    await user.click(screen.getByRole("button", { name: /avanzar 10 segundos/i }));

    expect(playerMocks.skipBackward).toHaveBeenCalledWith(10);
    expect(playerMocks.skipForward).toHaveBeenCalledWith(10);
  });

  it("click en la barra de progreso hace seek a la posición calculada", () => {
    playerMocks.state.currentTrack = { id: "t1" };
    playerMocks.state.duration = 200;
    playerMocks.state.progress = 50;

    render(<MusicPlayer />);

    const bar = screen.getByRole("progressbar", { name: /barra de progreso/i });
    // Mock del tamaño/posición de la barra
    vi.spyOn(bar, "getBoundingClientRect").mockReturnValue({
      left: 0,
      width: 200,
      top: 0,
      right: 200,
      bottom: 0,
      height: 0,
      x: 0, y: 0, toJSON: () => {},
    });

    // click a la mitad → ratio 0.5 → seek(100)
    fireEvent.click(bar, { clientX: 100 });
    expect(playerMocks.seek).toHaveBeenCalledWith(100);
  });

  it("mute y volumen: botón mute llama toggleMute; slider llama setVolume con número", async () => {
    const user = userEvent.setup();
    playerMocks.state.currentTrack = { id: "t1" };
    playerMocks.state.muted = false;
    playerMocks.state.volume = 0.3;

    render(<MusicPlayer />);

    // botón mute (aria-label depende de muted/volume)
    const muteBtn = screen.getByRole("button", { name: /silenciar|quitar silencio/i });
    await user.click(muteBtn);
    expect(playerMocks.toggleMute).toHaveBeenCalledTimes(1);

    // slider volumen
    const slider = screen.getByRole("slider", { name: /volumen/i });
    // change a 0.55
    fireEvent.change(slider, { target: { value: 0.55 } });
    expect(playerMocks.setVolume).toHaveBeenLastCalledWith(0.55);
  });

  it("renderiza FavButton con trackId correcto y pinta cover en desktop/mobile", () => {
    playerMocks.state.currentTrack = { id: "abc", title: "Song", artist: "Art", cover: "c.jpg" };

    render(<MusicPlayer />);

    // FavButton mock recibió props
    expect(favSpy.lastProps).toMatchObject({ trackId: "abc", track: expect.any(Object) });

    // La cover (al menos una de las imágenes) está en el DOM
    expect(screen.getAllByRole("img", { name: /cover|song/i }).length).toBeGreaterThan(0);
  });
});
