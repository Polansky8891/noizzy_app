// src/tests/utils/tickBuffer.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.useFakeTimers();

const importTick = async () => await import("../../utils/tickBuffer.js");

const nextTicks = async (ms) => {
  vi.advanceTimersByTime(ms);
  await vi.waitFor(() => {}, { timeout: 0 });
};

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  global.fetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
  Object.defineProperty(document, "hidden", { value: false, configurable: true });
});

describe("tickBuffer", () => {
  it("configureTickBuffer: guarda getState/getToken/endpoint", async () => {
    const mod = await importTick();
    const getStateFn = vi.fn();
    const getTokenFn = vi.fn().mockResolvedValue("TKN");
    mod.configureTickBuffer({ getStateFn, getTokenFn, endpoint: "/api/stats/tick/" });

    getStateFn.mockReturnValue({
      isPlaying: true,
      currentTrack: { _id: "1", genre: "rock" },
    });
    mod.startTicking();

    await nextTicks(15000 * 4);

    expect(getTokenFn).toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith("/api/stats/tick", expect.any(Object));
  });

  it("startTicking: lanza si no se configuró getState", async () => {
    const mod = await importTick();
    expect(() => mod.startTicking()).toThrow(/configureTickBuffer/i);
  });

  it("mete ticks en cola solo si isPlaying=true y hay currentTrack; auto-flush al 4º", async () => {
    const mod = await importTick();

    const getStateFn = vi
      .fn()
      .mockReturnValueOnce({ isPlaying: false })
      .mockReturnValueOnce({ isPlaying: true, currentTrack: null })
      .mockReturnValue({ isPlaying: true, currentTrack: { _id: "t1", genre: "chill" } });

    const getTokenFn = vi.fn().mockResolvedValue("ABC");
    mod.configureTickBuffer({ getStateFn, getTokenFn, endpoint: "/tick" });
    mod.startTicking();

    await nextTicks(15000 * 6);

    expect(fetch).toHaveBeenCalled();
    const fourTickCall = fetch.mock.calls.find(([, opts]) => {
      try {
        const b = JSON.parse(opts.body);
        return Array.isArray(b.ticks) && b.ticks.length === 4;
      } catch {
        return false;
      }
    });
    expect(fourTickCall).toBeTruthy();
  });

  it("flushTicks: no envía si no hay token", async () => {
    const mod = await importTick();
    const getStateFn = vi.fn().mockReturnValue({
      isPlaying: true,
      currentTrack: { _id: "x", genre: "pop" },
    });
    const getTokenFn = vi.fn().mockResolvedValue(null);

    mod.configureTickBuffer({ getStateFn, getTokenFn, endpoint: "/tick" });
    mod.startTicking();

    await nextTicks(15000);
    await mod.flushTicks();

    expect(fetch).not.toHaveBeenCalled();
  });

  it("flushTicks: envía con Authorization Bearer <token>", async () => {
    const mod = await importTick();
    const getStateFn = vi.fn().mockReturnValue({
      isPlaying: true,
      currentTrack: { _id: "z", genre: "edm" },
    });
    const getTokenFn = vi.fn().mockResolvedValue("T0K3N");

    mod.configureTickBuffer({ getStateFn, getTokenFn, endpoint: "/tick" });
    mod.startTicking();

    await nextTicks(15000);
    await mod.flushTicks();

    expect(fetch).toHaveBeenCalled();
    const [, opts] = fetch.mock.calls.at(-1);
    expect(opts.headers).toMatchObject({
      "Content-Type": "application/json",
      Authorization: "Bearer T0K3N",
    });
  });

  it("flushTicks: si fetch falla, re-encola el batch", async () => {
    const mod = await importTick();
    const getStateFn = vi.fn().mockReturnValue({
      isPlaying: true,
      currentTrack: { _id: "r1", genre: "rock" },
    });
    const getTokenFn = vi.fn().mockResolvedValue("X");

    fetch.mockRejectedValueOnce(new Error("network"));

    mod.configureTickBuffer({ getStateFn, getTokenFn, endpoint: "/tick" });
    mod.startTicking();

    await nextTicks(15000 * 2);
    await mod.flushTicks();

    await mod.flushTicks();
    const [, opts] = fetch.mock.calls.at(-1);
    expect(JSON.parse(opts.body).ticks).toHaveLength(2);
  });

  it("eventos: beforeunload y visibilitychange → flush con keepalive=true", async () => {
    const mod = await importTick();
    const getStateFn = vi.fn().mockReturnValue({
      isPlaying: true,
      currentTrack: { _id: "k", genre: "jazz" },
    });
    const getTokenFn = vi.fn().mockResolvedValue("TKN");
    mod.configureTickBuffer({ getStateFn, getTokenFn, endpoint: "/tick" });
    mod.startTicking();

    await nextTicks(15000);
    fetch.mockClear();

    Object.defineProperty(document, "hidden", { value: true, configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("beforeunload"));

    await Promise.resolve();
    expect(fetch).toHaveBeenCalled();
    const anyKeepalive = fetch.mock.calls.some(([, opts]) => opts?.keepalive === true);
    expect(anyKeepalive).toBe(true);
  });

  it("stopTicking: limpia intervalos y listeners y hace flush final keepalive", async () => {
    const mod = await importTick();
    const getStateFn = vi.fn().mockReturnValue({
      isPlaying: true,
      currentTrack: { _id: "s", genre: "soul" },
    });
    const getTokenFn = vi.fn().mockResolvedValue("T");
    mod.configureTickBuffer({ getStateFn, getTokenFn, endpoint: "/tick" });
    mod.startTicking();

    await nextTicks(15000);
    fetch.mockClear();

    mod.stopTicking();

    await Promise.resolve();
    expect(fetch).toHaveBeenCalled();
    const [, opts] = fetch.mock.calls.at(-1);
    expect(opts.keepalive).toBe(true);

    fetch.mockClear();
    await nextTicks(15000 * 2);
    expect(fetch).not.toHaveBeenCalled();
  });
});
