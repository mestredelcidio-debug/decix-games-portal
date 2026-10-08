/**
 * DECIX GAMES – Cache Service
 * Camada de cache em memória de alto desempenho com suporte a TTL configurável.
 * Preparada para migração transparente para Redis/Memcached/Postgres futuramente.
 */
export class CacheService {
    cache = new Map();
    defaultTtlSeconds;
    hits = 0;
    misses = 0;
    constructor(defaultTtlSeconds = 3600) {
        const envTtl = process.env.GAMEPIX_CACHE_TTL ? parseInt(process.env.GAMEPIX_CACHE_TTL, 10) : NaN;
        this.defaultTtlSeconds = !isNaN(envTtl) && envTtl > 0 ? envTtl : defaultTtlSeconds;
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            this.misses++;
            return null;
        }
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            this.misses++;
            return null;
        }
        this.hits++;
        return entry.value;
    }
    set(key, value, ttlSeconds) {
        const ttl = ttlSeconds !== undefined ? ttlSeconds : this.defaultTtlSeconds;
        const expiresAt = Date.now() + ttl * 1000;
        this.cache.set(key, { value, expiresAt });
    }
    delete(key) {
        return this.cache.delete(key);
    }
    deletePattern(prefix) {
        let deletedCount = 0;
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
                deletedCount++;
            }
        }
        return deletedCount;
    }
    flush() {
        this.cache.clear();
    }
    getStats() {
        const activeEntries = Array.from(this.cache.entries()).filter(([, entry]) => Date.now() <= entry.expiresAt).length;
        return {
            entries: activeEntries,
            hits: this.hits,
            misses: this.misses,
            defaultTtlSeconds: this.defaultTtlSeconds
        };
    }
}
export const globalCache = new CacheService();
