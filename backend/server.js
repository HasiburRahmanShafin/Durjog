const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const locationRoutes = require('./src/routes/locationRoutes');
const alertRoutes = require('./src/routes/alertRoutes');
const disasterRoutes = require('./src/routes/disasterRoutes');
const communityRoutes = require('./src/routes/communityRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const { setIo } = require('./src/services/ioService');
const { runAlertEngine } = require('./src/services/alertService');

const app = express();
const server = http.createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
  transports: ['websocket', 'polling']
});

// Make io globally available via ioService
setIo(io);

// Core Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(cookieParser());

// Database connection
connectDB();

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'durjog-backend'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/disaster', disasterRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/admin', adminRoutes);

// Static GeoJSON Data
app.use('/api/geojson', express.static(path.join(__dirname, 'data')));

// Socket.io connection handling
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId && userId !== 'undefined') {
    socket.join(userId);
    console.log(`[Socket.io] User ${userId} joined room`);
  }
  socket.on('disconnect', () => {
    // client disconnected
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ msg: `Cannot ${req.method} ${req.url}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    msg: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

// Start Server and Alert Engine
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 DURJOG backend running on port ${PORT}`);
  console.log(`🌐 Configured frontend URL: ${FRONTEND_URL}`);

  // Initial alert engine run
  runAlertEngine().catch(err => console.error('Initial alert engine run error:', err));

  // Schedule every 15 minutes
  const cron = require('node-cron');
  cron.schedule('*/15 * * * *', () => {
    runAlertEngine().catch(err => console.error('Cron alert engine run error:', err));
  });
});