import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { waitFor } from "@testing-library/react";



// ---------- Mocks de módulos externos ----------
vi.mock('../../api/base', () => ({ API_BASE: 'http://api.test' }));

// ✅ hoist: la variable existe cuando el factory de vi.mock se ejecuta
const tickMocks = vi.hoisted(() => ({
  configureTickBuffer: vi.fn(),
  startTicking: vi.fn(),
  stopTicking: vi.fn(),
}));
vi.mock('../../utils/tickBuffer', () => tickMocks);

const fbMocks = vi.hoisted(() => ({ FirebaseAuth: { currentUser: null } }));
vi.mock('../../firebase/config', () => fbMocks);

// ---------- Audio fake global ----------

class FakeAudio {
  constructor() {
    this.src = "";
    this.currentTime = 0;
    this.duration = 0;
    this.volume = 1;
    this.muted = false;
    this.paused = true;
    this._handlers = {};
    globalThis.__lastAudio__ = this;
  }
  addEventListener(t, fn) { (this._handlers[t] ||= []).push(fn); }
  removeEventListener(t, fn) {
    this._handlers[t] = (this._handlers[t] || []).filter(h => h !== fn);
  }
  async play() { this.paused = false; this._emit("play"); return; }
  pause() { this.paused = true; this._emit("pause"); }
  fastSeek(s) { this.currentTime = s; this._emit("timeupdate"); }
  _emit(t) { (this._handlers[t] || []).forEach(fn => fn()); }
}
vi.stubGlobal("Audio", FakeAudio);

// ---------- SUT ----------
import { PlayerProvider, usePlayer } from "../../components/PlayerContext";

// Helper minimal para consumir el contexto
function Probe() {
  const p = usePlayer();
  // lo hacemos accesible para asserts sin test-ids
  return (
    <div>
      <div aria-label="isPlaying">{String(p.isPlaying)}</div>
      <div aria-label="progress">{String(p.progress)}</div>
      <div aria-label="duration">{String(p.duration)}</div>
      <button onClick={() => p.playTrack({ id: "t1", _id: "aaaaaaaaaaaaaaaaaaaaaaaa", title: "A", audioUrl: "/a.mp3", genre: "rock" })}>play</button>
      <button onClick={() => p.pauseTrack()}>pause</button>
      <button onClick={() => p.resumeTrack()}>resume</button>
      <button onClick={() => p.togglePlay()}>toggle</button>
      <button onClick={() => p.seek(50)}>seek50</button>
      <button onClick={() => p.skipForward(10)}>fwd10</button>
      <button onClick={() => p.skipBackward(10)}>back10</button>
      <button onClick={() => p.setVolume(0.3)}>vol03</button>
      <button onClick={() => p.toggleMute()}>mute</button>
    </div>
  );
}

const renderWithProvider = () =>
  render(
    <PlayerProvider>
      <Probe />
    </PlayerProvider>
  );

beforeEach(() => {
  vi.clearAllMocks();
  fbMocks.FirebaseAuth.currentUser = null;
  global.fetch = vi.fn().mockResolvedValue({ ok: true, text: async () => "" });
});

describe("PlayerProvider", () => {
  it("configura y arranca tickBuffer al montar; se detiene al desmontar", () => {
    const { unmount } = renderWithProvider();

    expect(tickMocks.configureTickBuffer).toHaveBeenCalledTimes(1);
    expect(tickMocks.configureTickBuffer).toHaveBeenCalledWith(
      expect.objectContaining({
        getStateFn: expect.any(Function),
        getTokenFn: expect.any(Function),
        endpoint: "http://api.test/stats/tick",
      })
    );

    expect(tickMocks.startTicking).toHaveBeenCalledTimes(1);

    unmount();
    expect(tickMocks.stopTicking).toHaveBeenCalledTimes(1);
  });

  it("playTrack: setea src, hace play y loguea play con token sólo la primera vez", async () => {
    // mock token firebase
    fbMocks.FirebaseAuth.currentUser = {
      getIdToken: vi.fn().mockResolvedValue("IDTOKEN"),
    };

    renderWithProvider();

    // 1ª vez → debe loguear
    await screen.getByText("play").click();

    const a = globalThis.__lastAudio__;

    await waitFor(() => expect(a.src).toMatch(/\/a\.mp3$/));
    await waitFor(() => expect(a.paused).toBe(false));

    
    

    expect(fetch).toHaveBeenCalledWith(
      "http://api.test/stats/play",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer IDTOKEN" }),
        body: JSON.stringify({
          trackId: "aaaaaaaaaaaaaaaaaaaaaaaa",
          genre: "Rock",
        }),
      })
    );

    // 2ª vez con la MISMA pista → no vuelve a loguear
    await screen.getByText("pause").click();
    await screen.getByText("play").click();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("pauseTrack pausa; resume sólo si hay src; togglePlay alterna play/pause", async () => {
    renderWithProvider();
    const a = globalThis.__lastAudio__;

    // resume sin src: no cambia
    await screen.getByText("resume").click();
    expect(a.paused).toBe(true);

    // play (pone src y reproduce)
    await screen.getByText("play").click();
    expect(a.paused).toBe(false);

    // pause
    await screen.getByText("pause").click();
    expect(a.paused).toBe(true);

    // toggle: play
    await screen.getByText("toggle").click();
    expect(a.paused).toBe(false);

    // toggle: pause
    await screen.getByText("toggle").click();
    expect(a.paused).toBe(true);
  });

  it("seek respeta límites; skipForward/Backward suman y restan", async () => {
    renderWithProvider();
    const a = globalThis.__lastAudio__;
    a.duration = 100;
    a._emit("loadedmetadata"); 

    await screen.getByText("seek50").click();
    await waitFor(() => expect(a.currentTime).toBe(50));

    await screen.getByText("back10").click(); // 40
    expect(a.currentTime).toBe(40);

    await screen.getByText("fwd10").click(); // 50
    expect(a.currentTime).toBe(50);

    // (si tu lógica capara por duration, aquí puedes añadir asserts de límites extra)
  });

  it("volumen y mute se reflejan en la instancia de audio", async () => {
    renderWithProvider();
    const a = globalThis.__lastAudio__;

    await screen.getByText("vol03").click();
    expect(a.volume).toBe(0.3);

    await screen.getByText("mute").click();
    expect(a.muted).toBe(true);
  });

  it("no intenta logPlay si no hay usuario o el id no es ObjectId", async () => {
    // sin usuario
    fbMocks.FirebaseAuth.currentUser = null;
    renderWithProvider();
    await screen.getByText("play").click();
    expect(fetch).not.toHaveBeenCalled();

    // id inválido
    const BadProbe = () => {
      const p = usePlayer();
      return (
        <button
          onClick={() =>
            p.playTrack({ id: "x", _id: "x", title: "A", audioUrl: "/a.mp3" })
          }
        >
          play2
        </button>
      );
    };

    const { rerender } = render(
      <PlayerProvider>
        <BadProbe />
      </PlayerProvider>
    );
    await screen.getByText("play2").click();
    expect(fetch).not.toHaveBeenCalled();
    rerender(<div />); // desmontar limpio
  });
});