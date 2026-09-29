const Redis = require('ioredis');
const env = require('./env');

class MemoryStoreFallback {
  constructor() {
    this.store = new Map();
    this.ttls = new Map();
    this.status = 'ready';
  }

  async get(key) {
    if (this.ttls.has(key) && Date.now() > this.ttls.get(key)) {
      this.store.delete(key);
      this.ttls.delete(key);
      return null;
    }
    return this.store.has(key) ? this.store.get(key) : null;
  }

  async mget(...keys) {
    const flatKeys = Array.isArray(keys[0]) ? keys[0] : keys;
    return Promise.all(flatKeys.map((k) => this.get(k)));
  }

  async set(key, value, mode, duration) {
    this.store.set(key, typeof value === 'string' ? value : JSON.stringify(value));
    if (mode === 'EX' && duration) {
      this.ttls.set(key, Date.now() + duration * 1000);
    } else if (mode === 'PX' && duration) {
      this.ttls.set(key, Date.now() + duration);
    }
    return 'OK';
  }

  async del(key) {
    const deleted = this.store.delete(key);
    this.ttls.delete(key);
    return deleted ? 1 : 0;
  }

  async incr(key) {
    let current = parseInt((await this.get(key)) || '0', 10);
    if (isNaN(current)) current = 0;
    current += 1;
    this.store.set(key, current.toString());
    return current;
  }

  async expire(key, seconds) {
    if (this.store.has(key)) {
      this.ttls.set(key, Date.now() + seconds * 1000);
      return 1;
    }
    return 0;
  }

  async ttl(key) {
    if (!this.store.has(key)) return -2;
    if (!this.ttls.has(key)) return -1;
    const remainingMs = this.ttls.get(key) - Date.now();
    return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : -2;
  }

  async exists(key) {
    const val = await this.get(key);
    return val !== null ? 1 : 0;
  }

  async keys(pattern = '*') {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const validKeys = [];
    for (const key of this.store.keys()) {
      if (await this.get(key) !== null) {
        if (regex.test(key)) validKeys.push(key);
      }
    }
    return validKeys;
  }

  async flushall() {
    this.store.clear();
    this.ttls.clear();
    return 'OK';
  }

  on() { return this; }
  once() { return this; }
  emit() { return true; }
  removeListener() { return this; }
  async quit() { return 'OK'; }
  async disconnect() { return 'OK'; }
}

let redisClient;
let isUsingMemoryFallback = false;

try {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy: () => null, // Do not spam reconnects if offline
    lazyConnect: true,
  });

  client.on('error', (err) => {
    if (!isUsingMemoryFallback) {
      console.log('ℹ️ Redis offline or unavailable. Switched to high-speed in-memory session/OTP store.');
      isUsingMemoryFallback = true;
    }
  });

  // Attempt async connect
  client.connect().catch(() => {
    isUsingMemoryFallback = true;
  });

  const memoryFallback = new MemoryStoreFallback();

  redisClient = new Proxy(client, {
    get(target, prop) {
      if (isUsingMemoryFallback || target.status !== 'ready') {
        if (typeof memoryFallback[prop] === 'function') {
          return memoryFallback[prop].bind(memoryFallback);
        }
        if (prop in memoryFallback) {
          return memoryFallback[prop];
        }
        return async () => null;
      }
      return typeof target[prop] === 'function' ? target[prop].bind(target) : target[prop];
    },
  });
} catch (e) {
  isUsingMemoryFallback = true;
  redisClient = new MemoryStoreFallback();
}

module.exports = redisClient;
