/**
 * Centralized application error handler
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.status || err.statusCode || 500;

  if (statusCode >= 500) {
    console.error('[API ERROR]', {
      method: req.method,
      path: req.originalUrl,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  } else {
    console.warn(`[API WARN ${statusCode}]`, {
      method: req.method,
      path: req.originalUrl,
      message: err.message,
    });
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.errors ? err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })) : err.message,
    });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`,
    });
  }

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error occurred',
  });
}

/**
 * 404 handler for unmatched routes
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
