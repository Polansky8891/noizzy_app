const TICK_INTERVAL_MS = 15000;

let intervalId = null;
let queue = [];
let apiEndpoint = '/api/stats/tick';

let getState = null;
let getToken = null;

let beforeUnloadHandler = null;
let visibilityHandler = null;

export function configureTickBuffer({ getStateFn, getTokenFn, endpoint } = {} ) {
    if (getStateFn) getState = getStateFn;
    if (getTokenFn) getToken = getTokenFn;
    if (endpoint) apiEndpoint = endpoint.replace(/\/$/, '');
}

export function startTicking() {
    if (intervalId) return;
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

    beforeUnloadHandler = () => flushTicks({ keepalive: true });
    window.addEventListener('beforeunload', beforeUnloadHandler);

    visibilityHandler = () => {
        if (document.hidden) flushTicks({ keepalive: true});
    }
    document.addEventListener('visibilitychange', visibilityHandler);
}

export async function flushTicks({ keepalive = false }) {
    if (!queue.length) return;
    const batch = queue.slice();
    queue = [];
    try {
        const token = (typeof getToken === 'function' && getToken()) || localStorage.getItem('token');
        const headers = { 'Content-Type' : 'application/json'};
        if (token) headers['x-token'] = token;

        await fetch(apiEndpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({ ticks: batch }),
            keepalive
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
    if (beforeUnloadHandler) {
        window.removeEventListener('beforeunload', beforeUnloadHandler);
        beforeUnloadHandler = null;
    }
    if (visibilityHandler) {
        document.removeEventListener('visibilitychange', visibilityHandler);
        visibilityHandler = null;
    }
    flushTicks({ keepalive: true});
}


