// src/utils/tickBuffer.js
const TICK_INTERVAL_MS = 15000;

let intervalId = null;
let queue = [];
let apiEndpoint = "/api/stats/tick";

let getState = null;
let getToken = null;

let beforeUnloadHandler = null;
let visibilityHandler = null;

export function configureTickBuffer({ getStateFn, getTokenFn, endpoint } = {}) {
  if (getStateFn) getState = getStateFn;
  if (getTokenFn) getToken = getTokenFn;      // puede ser async
  if (endpoint) apiEndpoint = endpoint.replace(/\/$/, "");
}

export function startTicking() {
  if (intervalId) return;
  if (!getState) throw new Error("configureTickBuffer: falta getStateFn");

  intervalId = window.setInterval(() => {
    try {
      const { isPlaying, currentTrack } = getState() || {};
      if (!isPlaying || !currentTrack) return;

      queue.push({
        trackId: currentTrack._id,
        genre: currentTrack.genre,
        ms: TICK_INTERVAL_MS,
        at: new Date().toISOString(),
      });

      if (queue.length >= 4) flushTicks();
    } catch (_) {}
  }, TICK_INTERVAL_MS);

  beforeUnloadHandler = () => flushTicks({ keepalive: true });
  window.addEventListener("beforeunload", beforeUnloadHandler);

  visibilityHandler = () => {
    if (document.hidden) flushTicks({ keepalive: true });
  };
  document.addEventListener("visibilitychange", visibilityHandler);
}

export async function flushTicks({ keepalive = false } = {}) {
  if (!queue.length) return;

  const batch = queue.slice();
  queue = [];

  try {
    const token = typeof getToken === "function" ? await getToken() : null;
    if (!token) return; // sin token: no enviamos ⇒ evitamos 401

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,   // el backend valida esto
      // 'x-token': token, // (opcional) compatibilidad si tu back lo acepta
    };

    await fetch(apiEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ ticks: batch }),
      keepalive,
    });
  } catch (_) {
    // re-encola si falló
    queue.unshift(...batch);
  }
}

export function stopTicking() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (beforeUnloadHandler) {
    window.removeEventListener("beforeunload", beforeUnloadHandler);
    beforeUnloadHandler = null;
  }
  if (visibilityHandler) {
    document.removeEventListener("visibilitychange", visibilityHandler);
    visibilityHandler = null;
  }
  flushTicks({ keepalive: true });
}
