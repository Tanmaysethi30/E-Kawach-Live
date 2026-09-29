const { verifyAccessToken } = require('../utils/jwt');
const db = require('../database/db');

/**
 * Authentication middleware: verifies Bearer token or httpOnly cookie
 */
async function authenticateToken(req, res, next) {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.ekawach_access_token) {
    token = req.cookies.ekawach_access_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in with your credentials.',
    });
  }

  let user = null;
  const decoded = token ? verifyAccessToken(token) : null;
  if (decoded && decoded.userId) {
    user = await db.user.findFirst({
      where: {
        OR: [
          { id: decoded.userId },
          { registration_id: decoded.userId },
          { email: decoded.userId },
        ],
      },
      include: {
        patientProfile: true,
        doctorProfile: true,
        hospitalAdminProfile: true,
      },
    });
  }

  if (token && !user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session token. Please sign in again.',
    });
  }

  if (!user && process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'production') {
    // Dev only: if no token provided at all in dev mode, resolve by role
    const reqRole = req.baseUrl.includes('/admin') ? 'hospital' : req.baseUrl.includes('/doctor') ? 'doctor' : req.baseUrl.includes('/patient') ? 'patient' : null;
    if (reqRole) {
      user = await db.user.findFirst({
        where: { role: reqRole },
        include: {
          patientProfile: true,
          doctorProfile: true,
          hospitalAdminProfile: true,
        },
      });
    }
  }

  if (!user || user.status !== 'ACTIVE') {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in with your credentials.',
    });
  }

  // Attach session context
  req.user = {
    id: user.id,
    registration_id: user.registration_id,
    registrationId: user.registration_id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role, // 'patient' | 'doctor' | 'hospital'
    hospitalId: user.hospitalAdminProfile?.hospitalId || 'hosp-apollo-greams',
    patientProfile: user.patientProfile || null,
    doctorProfile: user.doctorProfile || null,
    hospitalAdminProfile: user.hospitalAdminProfile || null,
  };

  next();
}

/**
 * Role authorization guard
 * @param  {...string} allowedRoles e.g. 'patient', 'doctor', 'hospital', 'hospital_admin'
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const normalizedUserRole = (req.user.role === 'hospital_admin' || req.user.role === 'admin') ? 'hospital' : req.user.role;
    const normalizedAllowed = allowedRoles.map((r) => (r === 'hospital_admin' || r === 'admin' ? 'hospital' : r));

    if (!normalizedAllowed.includes(normalizedUserRole)) {
      return res.status(403).json({
        success: false,
        error: `Access denied: Role '${req.user.role}' is not authorized for this resource. Required: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole,
};
