const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const { uploadServiceMedia } = require('../middleware/upload-gcs');
const { cacheMiddleware, invalidateCache, cacheKeys, invalidationPatterns } = require('../middleware/cache');

// Create service (worker, driver, or admin) - invalidate cache on creation
router.post('/', 
  auth(['worker','driver','admin']), 
  uploadServiceMedia, 
  invalidateCache(invalidationPatterns.services),
  serviceController.createService
);

// Get categories - cache for 1 hour (rarely changes)
router.get('/categories', cacheMiddleware(3600), serviceController.getCategories);

// Public / customer / worker: list (with optional auth to compute effectivePrice)
// Cache for 5 minutes with custom key based on query params
router.get('/', optionalAuth, cacheMiddleware(300, cacheKeys.services), serviceController.getServices);

// Find service by type (for booking) - cache for 5 minutes
router.get('/type/:type', optionalAuth, cacheMiddleware(300), serviceController.findServiceByType);

// Detail - cache for 10 minutes per service
router.get('/:id', optionalAuth, cacheMiddleware(600, cacheKeys.service), serviceController.getService);

// Update & delete (worker, driver, or admin) - invalidate cache on modification
router.put('/:id', 
  auth(['worker','driver','admin']), 
  uploadServiceMedia, 
  invalidateCache(invalidationPatterns.services),
  serviceController.updateService
);

router.delete('/:id', 
  auth(['worker','driver','admin']), 
  invalidateCache(invalidationPatterns.services),
  serviceController.deleteService
);

module.exports = router;
