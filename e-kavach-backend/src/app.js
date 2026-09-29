const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const env = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const metricsMiddleware = require('./middleware/metrics.middleware');

const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const doctorRoutes = require('./routes/doctor.routes');
const adminRoutes = require('./routes/admin.routes');
const healthRoutes = require('./routes/health.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();

// Trust reverse proxy (Cloudflare Tunnel, edge proxies)
app.set('trust proxy', true);

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Real-time telemetry and metrics interceptor
app.use(metricsMiddleware);

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (env.CORS_ORIGIN.includes('*') || env.CORS_ORIGIN.includes(origin)) {
      return callback(null, true);
    }
    // Allow any localhost port in development
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Emergency-Bypass', 'X-Bypass-Reason'],
}));

// Request parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging in non-test mode
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve uploaded documents statically
app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

// Forward root health and metrics
app.get('/health', (req, res) => res.redirect('/api/health'));
app.get('/metrics', (req, res) => {
  const metricsService = require('./services/metrics.service');
  res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.send(metricsService.formatPrometheusMetrics());
});

// Mount API routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
