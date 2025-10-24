require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const { setupSecurity } = require('./middleware/security');

const app = express();
const server = http.createServer(app);

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

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

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

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Join room by user id if provided
  socket.on('join', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });
  
  // Handle admin room joining
  socket.on('join_admin', (userId) => {
    socket.join('admin_room');
    console.log(`Admin ${userId} joined admin room via socket ${socket.id}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// make io accessible in controllers via app
app.set('io', io);
app.set('notificationService', notificationService);

// Add debug route to check avatars
app.get('/debug/avatars', async (req, res) => {
  try {
    const User = require('./models/User');
    const users = await User.find({ avatar: { $exists: true, $ne: null } });
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const avatarInfo = users.map(user => ({
      userId: user._id,
      email: user.email,
      avatar: user.avatar,
      fullUrl: `${baseUrl}${user.avatar}`
    }));
    res.json(avatarInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

mongoose.connect(MONGODB_URI, { dbName: DB_NAME })
mongoose.connect(MONGODB_URI)
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
    app.post('/api/admin/bootstrap', async (req, res) => {
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
