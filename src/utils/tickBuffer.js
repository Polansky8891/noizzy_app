import { axiosInstance } from "../api/axiosInstance";

const TICK_INTERVAL_MS = 15000;

let intervalId = null;
let queue = [];

let apiEndpoint = '/stats/tick';

let getState = null;
let getToken = null;

let beforeUnloadHandler = null;
let visibilityHandler = null;

// helpers
const stripDoubleSlash = (a, b) => (a.endsWith('/') ? a.slice(0, -1) : a) + (b.startsWith('/') ? b : `/${b}`);
const isAbsoluteUrl = (u = '') => /^https?:\/\//i.test(u);
const normalizeForAxios = (endpoint = '/stats/tick') => {
    if (endpoint.startsWith('/api/')) return endpoint.slice(4) || '/';
    return endpoint;
};

const makeAbsoluteForFetch = (endpoint = '/stats/tick') => {
    if (isAbsoluteUrl(endpoint)) return endpoint;
    const base = axiosInstance.defaults?.baseURL || '';
    return stripDoubleSlash(base, normalizeForAxios(endpoint));
};

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
            trackId: String(currentTrack._id || currentTrack.id || ''),
            genre: currentTrack.genre || null,
            ms: TICK_INTERVAL_MS,
            at: new Date().toISOString(),
        });

        if (queue.length >= 4) {
            void flushTicks().catch(() => {});
        }
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
        const endpointRel = normalizeForAxios(apiEndpoint);

        if (keepalive) {
            const token = typeof getToken === 'function' ? getToken() : null;
            const absUrl = makeAbsoluteForFetch(apiEndpoint);
            const headers = {'Content-Type': 'application/json'};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            await fetch(absUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({ ticks: batch }),
                keepalive: true,
            });
            return;
        }

        await axiosInstance.post(
            endpointRel,
            { ticks: batch },
            { meta: { skipAuthRedirect: true }}
        );

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
    void flushTicks({ keepalive: true});
}


