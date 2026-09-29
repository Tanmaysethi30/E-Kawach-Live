const redisClient = require('../config/redis');

/**
 * Creates a rate limiter middleware
 * @param {Object} options
 * @param {number} options.windowSec - Window duration in seconds
 * @param {number} options.max - Maximum allowed requests within the window
 * @param {string} options.keyPrefix - Identifier prefix
 */
function rateLimiter({ windowSec = 60, max = 2500, keyPrefix = 'rl' } = {}) {
  return async (req, res, next) => {
    if (process.env.NODE_ENV === 'test') {
      return next();
    }
    try {
      const ip =
        req.headers['cf-connecting-ip'] ||
        (req.headers['x-forwarded-for'] ? String(req.headers['x-forwarded-for']).split(',')[0].trim() : null) ||
        req.ip ||
        '127.0.0.1';
      
      // Differentiate devices behind shared NAT / reverse proxy using client headers & token
      const clientDevice = req.headers['sec-ch-ua'] || req.headers['user-agent'] || '';
      const authHeader = req.headers['authorization'] ? req.headers['authorization'].slice(-16) : '';
      const clientSession = req.cookies?.ekawach_access_token || req.headers['x-client-id'] || '';
      const identifier = `${ip}:${Buffer.from(clientDevice.slice(0, 30) + authHeader + clientSession).toString('base64').slice(0, 16)}`;
      const key = `${keyPrefix}:${identifier}`;

      const current = await redisClient.incr(key);
      if (current === 1) {
        await redisClient.expire(key, windowSec);
      }

      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - current));

      if (current > max) {
        return res.status(429).json({
          success: false,
          error: 'Too many requests. Rate limit exceeded. Please retry later.',
          retryAfterSec: windowSec,
        });
      }

      next();
    } catch (err) {
      // In case of rate limiter error, fail-open to not block emergency traffic
      next();
    }
  };
}

module.exports = {
  rateLimiter,
  authLimiter: rateLimiter({ windowSec: 60, max: 1000, keyPrefix: 'auth_rl' }),
  otpLimiter: rateLimiter({ windowSec: 300, max: 200, keyPrefix: 'otp_rl' }),
  emergencyLimiter: rateLimiter({ windowSec: 60, max: 5000, keyPrefix: 'emg_rl' }),
};
