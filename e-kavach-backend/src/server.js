const http = require('http');
const app = require('./app');
const env = require('./config/env');
const socketService = require('./services/socket.service');

const server = http.createServer(app);

// Initialize telemetry WebSocket
socketService.init(server, env.CORS_ORIGIN);

server.listen(env.PORT, () => {
  console.log('====================================================');
  console.log(`🛡️  E-KAWACH Backend API & Live Telemetry Server`);
  console.log(`📡 Listening on: http://localhost:${env.PORT}`);
  console.log(`🚀 REST Health:  http://localhost:${env.PORT}/api/health`);
  console.log(`⚡ WebSocket:   ws://localhost:${env.PORT}/ws/telemetry`);
  console.log(`🔒 Environment: ${env.NODE_ENV}`);
  console.log('====================================================');
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
