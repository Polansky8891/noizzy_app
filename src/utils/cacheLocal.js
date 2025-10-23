const PREFIX = 'noizzy_cache_v1:';

export function cacheSet(key, data, ttlMs = 15 * 60 * 1000) {
  try {
    const entry = { data, exp: Date.now() + ttlMs };
    localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {}
}

export function cacheGet(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const { data, exp } = JSON.parse(raw);
    if (exp && exp < Date.now()) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}
