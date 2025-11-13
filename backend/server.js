require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const compression = require('compression');
const { Server } = require('socket.io');
const { setupSecurity } = require('./middleware/security');
const { initializeRedis, getRedisClient } = require('./config/redis');

const app = express();
const server = http.createServer(app);

// Enable gzip compression for all responses (reduces bandwidth by 60-80%)
app.use(compression({
  level: 6, // Compression level (0-9, 6 is good balance)
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Secure CORS configuration
const additionalOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([
  // Local development
  'http://localhost:3000', // Web frontend
  'http://localhost:3001', // Web dev server  
  'http://localhost:5173', // Vite dev server
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:5173',
  // Production frontends (Firebase Hosting)
  'https://thohcm-application.web.app',
  'https://thohcm-frontend.web.app',
  'https://thohcm.web.app',
  ...additionalOrigins,
]));

// Initialize Redis (for caching and Socket.IO scaling)
let redisClient = null;
(async () => {
  try {
    redisClient = await initializeRedis();
  } catch (error) {
    console.warn('Redis initialization failed, continuing without cache:', error.message);
  }
})();

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    // Allow listed web origins and also native/mobile clients without an Origin header
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow mobile/native
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Socket.IO CORS blocked: ${origin}`), false);
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // Performance optimizations for 1000+ concurrent connections
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  maxHttpBufferSize: 1e6, // 1MB
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

// Setup Socket.IO Redis Adapter for horizontal scaling
(async () => {
  const redis = getRedisClient();
  if (redis) {
    try {
      const { createAdapter } = require('@socket.io/redis-adapter');
      const { createClient } = require('redis');
      
      const pubClient = createClient({ 
        socket: { 
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379')
        }
      });
      const subClient = pubClient.duplicate();
      
      await Promise.all([pubClient.connect(), subClient.connect()]);
      io.adapter(createAdapter(pubClient, subClient));
      console.log('✅ Socket.IO Redis adapter enabled - ready for horizontal scaling');
    } catch (error) {
      console.warn('⚠️  Socket.IO Redis adapter setup failed:', error.message);
    }
  }
})();

// Basic health endpoint (before security middleware)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Security middleware
setupSecurity(app, { allowedOrigins });

// CORS middleware with restricted origins
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true
}));

// Ensure CORS headers are present for all responses (including errors)
app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.header('Access-Control-Allow-Origin', requestOrigin);
    res.header('Vary', 'Origin');
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Secure static file serving with rate limiting
const path = require('path');
const rateLimit = require('express-rate-limit');

const staticLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 file requests per windowMs
  message: 'Too many file requests, please try again later.'
});

// Compatibility redirect for old mobile app URLs
app.use('/uploads/services', (req, res) => {
  let newPath;
  
  if (req.path.startsWith('/storage/services')) {
    // Case: /uploads/services/storage/services/file.jpg -> /storage/services/file.jpg
    // Remove the duplicate /storage/services part
    newPath = req.path;
  } else if (req.path.startsWith('//storage/services')) {
    // Case: /uploads/services//storage/services/file.jpg -> /storage/services/file.jpg  
    // Remove double slash and first /storage/services
    newPath = req.path.replace('//', '/').replace('/storage/services', '');
    newPath = `/storage/services${newPath}`;
  } else {
    // Case: /uploads/services/file.jpg -> /storage/services/file.jpg
    newPath = `/storage/services${req.path}`;
  }
  
  console.log(`🔄 Redirecting old URL: ${req.originalUrl} -> ${newPath}`);
  res.redirect(301, newPath);
});

// Serve static files with security headers and rate limiting
app.use('/storage', staticLimiter, (req, res, next) => {
  // Prevent directory traversal by rejecting suspicious paths early
  const normalizedPath = path.posix.normalize(req.path);
  if (normalizedPath.includes('..')) {
    return res.status(400).send('Invalid path');
  }

  // Ensure Express sees a normalized forward-slash path that keeps the leading slash
  req.url = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;

  // Add CORS headers for static files
  const requestOrigin = req.headers.origin;
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Add security headers for file serving
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  next();
}, express.static(process.env.NODE_ENV === 'production' ? '/tmp' : path.join(__dirname, 'storage'), {
  dotfiles: 'deny', // Deny access to dotfiles
  index: false, // Disable directory indexing 
  setHeaders: (res, filePath) => {
    // Set appropriate cache headers
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
  }
}));


// Import routes
const auth = require('./middleware/auth');
const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const enhancedRoutes = require('./routes/enhancedRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const workerScheduleRoutes = require('./routes/workerScheduleRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const walletRoutes = require('./routes/walletRoutes');

// Simple test route
app.get('/', (req, res) => {
  res.send('Thợ HCM backend is running!');
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/enhanced', enhancedRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/schedules', workerScheduleRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/banking', require('./routes/bankingRoutes'));

// Initialize NotificationService
const NotificationService = require('./services/NotificationService');
const notificationController = require('./controllers/notificationController');

const notificationService = new NotificationService(io);
notificationController.setNotificationService(notificationService);

// Socket.IO Authentication Middleware (Backward Compatible)
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  // Backward compatibility: Allow connections without token temporarily
  // TODO: Remove this after mobile app update (planned for 2 weeks)
  if (!token) {
    console.warn(`[Socket.IO Security] Unauthenticated connection from ${socket.id}`);
    console.warn('[Socket.IO Security] Client IP:', socket.handshake.address);
    console.warn('[Socket.IO Security] User-Agent:', socket.handshake.headers['user-agent']);
    
    // Mark as unauthenticated
    socket.isAuthenticated = false;
    socket.userId = null;
    socket.userRole = null;
    
    // Allow connection but log for monitoring
    return next();
  }
  
  // Verify JWT token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('[Socket.IO Security] Invalid token:', err.message);
      console.error('[Socket.IO Security] Socket ID:', socket.id);
      
      // Mark as unauthenticated but still allow (backward compatible)
      socket.isAuthenticated = false;
      socket.userId = null;
      socket.userRole = null;
      return next();
    }
    
    // Token valid - mark as authenticated
    socket.isAuthenticated = true;
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    
    console.log(`[Socket.IO Security] Authenticated connection:`, {
      socketId: socket.id,
      userId: decoded.id,
      role: decoded.role
    });
    
    next();
  });
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id, socket.isAuthenticated ? '(Authenticated)' : '(Unauthenticated - Legacy)');
  
  // Join room by user id if provided
  socket.on('join', (room) => {
    // Security check: Only authenticated users can join specific rooms
    if (!socket.isAuthenticated) {
      console.warn(`[Socket.IO Security] Unauthenticated user tried to join room: ${room}`);
      socket.emit('error', { 
        message: 'Authentication required to join rooms',
        code: 'AUTH_REQUIRED',
        action: 'Please update your app to the latest version'
      });
      return;
    }
    
    // Additional security: Users can only join their own room
    if (room !== socket.userId && socket.userRole !== 'admin') {
      console.warn(`[Socket.IO Security] User ${socket.userId} tried to join unauthorized room: ${room}`);
      socket.emit('error', { 
        message: 'Unauthorized room access',
        code: 'UNAUTHORIZED'
      });
      return;
    }
    
    socket.join(room);
    console.log(`Socket ${socket.id} (User: ${socket.userId}) joined room ${room}`);
  });
  
  // Handle admin room joining
  socket.on('join_admin', (userId) => {
    // Security check: Only authenticated admins can join admin room
    if (!socket.isAuthenticated) {
      console.warn(`[Socket.IO Security] Unauthenticated user tried to join admin room`);
      socket.emit('error', { 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
      return;
    }
    
    if (socket.userRole !== 'admin') {
      console.warn(`[Socket.IO Security] Non-admin user ${socket.userId} tried to join admin room`);
      socket.emit('error', { 
        message: 'Admin access required',
        code: 'FORBIDDEN'
      });
      return;
    }
    
    socket.join('admin_room');
    console.log(`Admin ${socket.userId} joined admin room via socket ${socket.id}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id, socket.isAuthenticated ? `(User: ${socket.userId})` : '(Unauthenticated)');
  });
});

// make io accessible in controllers via app
app.set('io', io);
app.set('notificationService', notificationService);

// Debug route removed for security - use admin dashboard instead

// MongoDB connection
// Cloud Run uses PORT environment variable, default to 8080 for Cloud Run, 5000 for local
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// Ensure a database name is present; default to 'thohcm' if omitted in SRV URI
function ensureDbName(uri, defaultDb = 'thohcm') {
  if (!uri) return `mongodb://localhost:27017/${defaultDb}`;
  // If it already contains a path segment between host/ and ? then keep as is
  // Handle both mongodb+srv and mongodb schemes
  const hasNet = uri.includes('.mongodb.net/');
  const hasLocal = uri.startsWith('mongodb://');
  if (!hasNet && !hasLocal) return uri; // unknown format

  const [left, right = ''] = uri.split('?');
  // left like: mongodb+srv://user:pass@cluster.mongodb.net/ or .../thohcm
  const pathPart = left.split('.mongodb.net/')[1] || left.split('mongodb://')[1];
  // If left already ends with /<dbname>
  const hasDb = hasNet
    ? left.match(/\.mongodb\.net\/.+$/) && !left.endsWith('/')
    : left.replace(/^mongodb:\/\//, '').split('/').length > 1 && !left.endsWith('/');

  if (hasDb) return uri; // db name present

  // Insert default db after trailing slash
  const withDb = left.endsWith('/') ? `${left}${defaultDb}` : `${left}/${defaultDb}`;
  return right ? `${withDb}?${right}` : withDb;
}

const MONGODB_URI = ensureDbName(process.env.MONGODB_URI, 'thohcm');
// Derive DB name from env or URI (fallback to 'thohcm').
let DB_NAME = process.env.MONGODB_DB;
if (!DB_NAME) {
  try {
    const m = MONGODB_URI.match(/mongodb(?:\+srv)?:\/\/[^/]+\/(.*?)(?:\?|$)/);
    DB_NAME = (m && m[1]) ? m[1] : undefined;
  } catch (_) {}
}
DB_NAME = DB_NAME || 'thohcm';

// Optimized MongoDB connection for 1000+ concurrent users
const mongooseOptions = {
  maxPoolSize: 50,        // Increased from default 10 (supports more concurrent connections)
  minPoolSize: 10,        // Keep 10 connections ready
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  serverSelectionTimeoutMS: 5000,
  heartbeatFrequencyMS: 10000,
  // Connection pool monitoring
  monitorCommands: process.env.NODE_ENV === 'development',
};

mongoose.connect(MONGODB_URI, mongooseOptions)
  .then(() => {
    const conn = mongoose.connection;
    console.log('MongoDB connected', { db: conn.name, host: conn.host });
    
    // Health endpoint to verify DB connection at runtime
    app.get('/api/health/db', async (req, res) => {
      try {
        const status = {
          db: conn.name,
          host: conn.host,
          readyState: conn.readyState,
          collections: Object.keys(conn.collections || {})
        };
        res.json(status);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Manual bootstrap endpoint for production (admin only)
    app.post('/api/admin/bootstrap', auth(['admin']), async (req, res) => {
      try {
        const bootstrap = require('./scripts/bootstrap');
        await bootstrap();
        res.json({ success: true, message: 'Bootstrap completed' });
      } catch (err) {
        console.error('[bootstrap API] failed:', err);
        res.status(500).json({ error: err.message });
      }
    });
    // Run lightweight bootstrap/migrations on start unless disabled
    const runBootstrap = (process.env.RUN_MIGRATIONS_ON_START || 'true').toLowerCase() !== 'false';
    if (runBootstrap) {
      try {
        const bootstrap = require('./scripts/bootstrap');
        bootstrap().catch(err => console.warn('[bootstrap] warning:', err.message));
      } catch (e) {
        console.warn('[bootstrap] not executed:', e.message);
      }
    } else {
      console.log('[bootstrap] disabled by RUN_MIGRATIONS_ON_START=false');
    }

    server.listen(PORT, HOST, () => {
      console.log(`Server listening at http://${HOST === '0.0.0.0' ? '0.0.0.0' : HOST}:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
