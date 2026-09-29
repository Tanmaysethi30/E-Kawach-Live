const metricsService = require('../services/metrics.service');

function metricsMiddleware(req, res, next) {
  const startHr = process.hrtime();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(startHr);
    const durationMs = Number(((seconds * 1e3) + (nanoseconds * 1e-6)).toFixed(2));

    // Normalize path to prevent high cardinality (strip dynamic IDs)
    let cleanPath = req.baseUrl || req.path || req.url;
    cleanPath = cleanPath.replace(/\/[0-9a-fA-F-]{8,}/g, '/:id');
    cleanPath = cleanPath.replace(/\/\d+/g, '/:id');

    metricsService.recordRequest(req.method, cleanPath, res.statusCode, durationMs);
  });

  next();
}

module.exports = metricsMiddleware;
