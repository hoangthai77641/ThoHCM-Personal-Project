/**
 * Caching Middleware for API responses
 * Reduces database load for frequently accessed data
 */

const { cache } = require('../config/redis');

/**
 * Cache middleware for GET requests
 * @param {number} duration - Cache duration in seconds (default: 300 = 5 minutes)
 * @param {function} keyGenerator - Optional custom key generator function
 */
const cacheMiddleware = (duration = 300, keyGenerator = null) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator 
      ? keyGenerator(req) 
      : `cache:${req.originalUrl || req.url}`;

    try {
      // Try to get from cache
      const cachedData = await cache.get(cacheKey);
      
      if (cachedData) {
        console.log(`✅ Cache HIT: ${cacheKey}`);
        return res.json(cachedData);
      }

      console.log(`❌ Cache MISS: ${cacheKey}`);

      // Store original res.json
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = (data) => {
        // Cache the response
        cache.set(cacheKey, data, duration).catch(err => {
          console.error('Failed to cache response:', err.message);
        });

        // Send the response
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error.message);
      // Continue without caching on error
      next();
    }
  };
};

/**
 * Cache invalidation middleware
 * Invalidates cache when data is modified (POST, PUT, DELETE)
 */
const invalidateCache = (patterns) => {
  return async (req, res, next) => {
    // Store original methods
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    // Override response methods to invalidate cache after successful operations
    const invalidateCachePatterns = async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const patternsToInvalidate = typeof patterns === 'function' 
          ? patterns(req) 
          : patterns;

        for (const pattern of patternsToInvalidate) {
          try {
            await cache.invalidatePattern(pattern);
            console.log(`🗑️  Cache invalidated: ${pattern}`);
          } catch (error) {
            console.error(`Failed to invalidate cache ${pattern}:`, error.message);
          }
        }
      }
    };

    res.json = (data) => {
      invalidateCachePatterns();
      return originalJson(data);
    };

    res.send = (data) => {
      invalidateCachePatterns();
      return originalSend(data);
    };

    next();
  };
};

/**
 * Predefined cache key generators
 */
const cacheKeys = {
  // Services list with query params
  services: (req) => {
    const { category, worker, isActive } = req.query;
    return `cache:services:${category || 'all'}:${worker || 'all'}:${isActive || 'all'}`;
  },

  // Single service
  service: (req) => `cache:service:${req.params.id}`,

  // User profile
  userProfile: (req) => `cache:user:${req.user?.id || 'guest'}`,

  // Bookings list
  bookings: (req) => {
    const { status, customer, worker } = req.query;
    return `cache:bookings:${customer || worker || 'all'}:${status || 'all'}`;
  },

  // Reviews
  reviews: (req) => `cache:reviews:${req.params.serviceId || req.query.service || 'all'}`,

  // Banners
  banners: (req) => `cache:banners:active`,

  // Stats
  stats: (req) => `cache:stats:${req.user?.role || 'guest'}`
};

/**
 * Cache invalidation patterns
 */
const invalidationPatterns = {
  services: () => ['cache:services:*', 'cache:service:*'],
  bookings: () => ['cache:bookings:*', 'cache:stats:*'],
  reviews: (req) => [`cache:reviews:${req.body.service || '*'}`, `cache:service:${req.body.service}`],
  users: (req) => [`cache:user:${req.params.id || '*'}`],
  banners: () => ['cache:banners:*']
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  cacheKeys,
  invalidationPatterns
};
