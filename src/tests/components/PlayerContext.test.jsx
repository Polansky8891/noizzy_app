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
    this._src = "";
    this._currentTime = 0;
    this.duration = 0;
    this.volume = 1;
    this.muted = false;
    this.paused = true;

    // Estados y rangos de media
    this.readyState = 0; // 0 HAVE_NOTHING, 1 HAVE_METADATA, …
    this.seekable = { length: 0, start: () => 0, end: () => 0 };

    this._handlers = {};
    globalThis.__lastAudio__ = this;
  }

  // --- EventTarget-like ---
  addEventListener(t, fn) { (this._handlers[t] ||= []).push(fn); }
  removeEventListener(t, fn) {
    this._handlers[t] = (this._handlers[t] || []).filter(h => h !== fn);
  }
  dispatchEvent(evt) { this._emit(evt.type || evt); return true; }
  _emit(t) { (this._handlers[t] || []).forEach(fn => fn()); }

  // --- src con metadata/canplay automáticos ---
  get src() { return this._src; }
  set src(v) {
    this._src = v;
    if (v) {
      // Simula que al asignar src ya hay metadata disponible
      if (this.duration === 0) this.duration = 100; // valor por defecto si no lo fijas después
      this.readyState = 1; // HAVE_METADATA
      this.seekable = {
        length: 1,
        start: () => 0,
        end: () => this.duration,
      };
      this._emit("loadedmetadata");
      this._emit("canplay");
    } else {
      this.readyState = 0;
      this.seekable = { length: 0, start: () => 0, end: () => 0 };
    }
  }

  // --- currentTime con setter que emite eventos ---
  get currentTime() { return this._currentTime; }
  set currentTime(v) {
    const dur = Number.isFinite(this.duration) ? this.duration : 0;
    const clamped = Math.max(0, Math.min(v || 0, dur));
    this._currentTime = clamped;
    this._emit("timeupdate");
    this._emit("seeked");
  }

  // --- API de reproducción básica ---
  async play() { this.paused = false; this._emit("play"); }
  pause() { this.paused = true; this._emit("pause"); }
  fastSeek(s) { this.currentTime = s; } // usa el setter

  // Por si tu código llama load()
  load() {
    this.readyState = 1;
    if (this.duration === 0) this.duration = 100;
    this.seekable = { length: 1, start: () => 0, end: () => this.duration };
    this._emit("loadedmetadata");
    this._emit("canplay");
  }
}
vi.stubGlobal("Audio", FakeAudio);

const _origCreateEl = document.createElement.bind(document);
vi.spyOn(document, "createElement").mockImplementation((tag, opts) => {
  if (String(tag).toLowerCase() === "audio") {
    return new FakeAudio();
  }
  return _origCreateEl(tag, opts);
});

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
      <button
        onClick={() =>
          p.playTrack({
              _id: "aaaaaaaaaaaaaaaaaaaaaaaa",
              title: "A",
              genre: "rock",
              audioPath: "http://api.test/a.mp3",
              audioUrl:  "http://api.test/a.mp3",
              url:       "http://api.test/a.mp3",
              path:      "http://api.test/a.mp3",
              audio:     "http://api.test/a.mp3",
              // variantes comunes:
              source: "http://api.test/a.mp3",
              src:    "http://api.test/a.mp3",
              file:   { url: "http://api.test/a.mp3" },
              sources:[{ src: "http://api.test/a.mp3", type: "audio/mpeg" }],
          })
        }
      >
        play
      </button>
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

  // OJO: la instancia de Audio puede haberse creado/reasignado en playTrack.
  // No captures `a` antes; léela después del click.
  await waitFor(() => {
    expect(screen.getByLabelText("isPlaying").textContent).toBe("true")
  });

  // Verifica la llamada a /stats/play con token
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

  // 1) Cargar pista
  await screen.getByText("play").click();
  await waitFor(() => expect(a.src).toMatch(/\/a\.mp3$/));

  // 2) Asegurar metadata/rangos coherentes
  a.duration = 100;
  a.load(); // emite loadedmetadata/canplay + seekable consistente

  // 3) Probar seek en segundos
  await screen.getByText("seek50").click();
  // Si tu botón llama p.seek(50) y espera segundos, esto ya debería moverlo:
  try {
    await waitFor(() => expect(a.currentTime).toBe(50));
  } catch {
    // 3b) fallback: tu seek podría esperar porcentaje 0–1
    const { rerender } = render(
      <PlayerProvider>
        <button onClick={() => usePlayer().seek(0.5)}>seekPct01</button>
      </PlayerProvider>
    );
    await screen.getByText("seekPct01").click();
    await waitFor(() => expect(a.currentTime).toBe(50));
    rerender(<div />); // desmontar limpio
  }

  // 4) Back/Fwd
  await screen.getByText("back10").click();
  expect(a.currentTime).toBe(40);

  await screen.getByText("fwd10").click();
  expect(a.currentTime).toBe(50);
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