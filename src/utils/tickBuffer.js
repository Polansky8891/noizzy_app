const TICK_INTERVAL_MS = 15000;

let intervalId = null;
let queue = [];
let apiEndpoint = '/api/stats/tick';

let getState = null;
let getToken = null;

export function configureTickBuffer({ getStateFn, getTokenFn, endpoint } = {} ) {
    if (getStateFn) getState = getStateFn;
    if (getTokenFn) getToken = getTokenFn;
    if (endpoint) apiEndpoint = endpoint;
}

export function startTicking() {
    if (!intervalId) return;
    if (!getState) throw new Error('configureTickBuffer: falta getStateFn');

    intervalId = window.setInterval(() => {
        const { isPlaying, currentTrack } = getState() || {};
        if (!isPlaying || !currentTrack) return;

        queue.push({
            trackId: currentTrack._id,
            genre: currentTrack.genre,
            ms: TICK_INTERVAL_MS,
            at: new Date().toISOString(),
        });

        if (queue.length >= 4) flushTicks();
    }, TICK_INTERVAL_MS);

    const onBeforeUnload = () => {
        if (!queue.length) return;
        try {
            const payload = JSON.stringify({ ticks: queue });
            navigator.sendBeacon(apiEndpoint, new Blob([payload], { type: 'application/json'}));
        } catch (_) {}
        queue = [];
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) flushTicks();
    });
}

export async function flushTicks() {
    if (!queue.length) return;
    const batch = queue.slice();
    queue = [];
    try {
        const token = getToken ? getToken() : null;
        const headers = { 'Content-Type' : 'application/json'};
        if (token) headers.Authorization = `Bearer ${token}`;

        await fetch(apiEndpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({ ticks: batch }),
        });
    } catch (error) {
        queue.unshift(...batch);
    }
}

export function stopTicking() {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    flushTicks();
}


