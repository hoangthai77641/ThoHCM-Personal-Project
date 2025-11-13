/**
 * Redis Configuration for 1000+ concurrent users
 * Provides caching, session storage, and Socket.IO adapter
 */

const Redis = require('ioredis');

// Redis connection configuration
const getRedisConfig = () => {
  // For Google Cloud Memorystore Redis
  if (process.env.REDIS_HOST) {
    return {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: 0,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      enableOfflineQueue: true,
    };
  }

  // For local development (optional Redis)
  if (process.env.NODE_ENV === 'development' && process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }

  // No Redis configured - will use in-memory fallback
  return null;
};

let redisClient = null;
let isRedisAvailable = false;

const initializeRedis = async () => {
  const config = getRedisConfig();
  
  if (!config) {
    console.log('⚠️  Redis not configured - using in-memory storage (not recommended for production)');
    return null;
  }

  try {
    redisClient = new Redis(config);

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
      isRedisAvailable = true;
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis connection error:', err.message);
      isRedisAvailable = false;
    });

    redisClient.on('ready', () => {
      console.log('✅ Redis is ready to accept commands');
      isRedisAvailable = true;
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });

    // Test connection
    await redisClient.ping();
    console.log('✅ Redis ping successful');

    return redisClient;
  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error.message);
    console.log('⚠️  Continuing without Redis - performance may be degraded');
    return null;
  }
};

// Cache helper functions
const cache = {
  async get(key) {
    if (!redisClient || !isRedisAvailable) return null;
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis GET error:', error.message);
      return null;
    }
  },

  async set(key, value, ttl = 300) {
    if (!redisClient || !isRedisAvailable) return false;
    try {
      const serialized = JSON.stringify(value);
      if (ttl > 0) {
        await redisClient.setex(key, ttl, serialized);
      } else {
        await redisClient.set(key, serialized);
      }
      return true;
    } catch (error) {
      console.error('Redis SET error:', error.message);
      return false;
    }
  },

  async del(key) {
    if (!redisClient || !isRedisAvailable) return false;
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error.message);
      return false;
    }
  },

  async invalidatePattern(pattern) {
    if (!redisClient || !isRedisAvailable) return false;
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Redis INVALIDATE error:', error.message);
      return false;
    }
  }
};

module.exports = {
  initializeRedis,
  getRedisClient: () => redisClient,
  isRedisAvailable: () => isRedisAvailable,
  cache
};
