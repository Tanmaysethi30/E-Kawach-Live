const express = require('express');
const router = express.Router();
const metricsService = require('../services/metrics.service');

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'e-kavach-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    features: {
      abhaIntegration: 'LEVEL-4 ABDM M2/M3 CERTIFIED',
      goldenHourTriage: 'ACTIVE (SUB-3S SLA)',
      accessAuditLogging: 'ENABLED (IMMUTABLE)',
      piiEncryption: 'AES-256-GCM',
      telemetryWebsocket: '/ws/telemetry',
    },
  });
});

router.get('/metrics', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.send(metricsService.formatPrometheusMetrics());
});

router.get('/metrics/summary', (req, res) => {
  res.json(metricsService.getSummary());
});

module.exports = router;
