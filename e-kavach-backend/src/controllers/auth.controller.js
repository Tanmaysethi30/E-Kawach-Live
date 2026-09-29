const authService = require('../services/auth.service');
const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(['patient', 'doctor', 'hospital', 'hospital_admin']).default('patient'),
  name: z.string().min(1),
  additionalDetails: z.record(z.any()).optional(),
});

const loginSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().optional(),
  role: z.enum(['patient', 'doctor', 'hospital', 'hospital_admin']).optional(),
  identifier: z.string().optional(),
}).passthrough();

class AuthController {
  async register(req, res, next) {
    try {
      const validated = registerSchema.parse(req.body);
      const result = await authService.register(validated);

      res.cookie('ekawach_access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        registration_id: result.user?.registration_id,
        registrationId: result.user?.registration_id,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await authService.login(validated);

      res.cookie('ekawach_access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      res.json({
        success: true,
        message: 'Login successful',
        registration_id: result.user?.registration_id,
        registrationId: result.user?.registration_id,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const userId = req.user ? req.user.id : null;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized session' });
      }
      const user = await authService.getMe(userId);
      res.json({
        success: true,
        user,
        registration_id: user.registration_id,
        registrationId: user.registration_id,
      });
    } catch (err) {
      next(err);
    }
  }

  async createPassword(req, res, next) {
    try {
      const result = await authService.createPassword(req.body);

      res.cookie('ekawach_access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      res.json({
        success: true,
        message: 'Password created successfully',
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  async googleLocal(req, res, next) {
    try {
      const result = await authService.googleLocal(req.body);

      res.cookie('ekawach_access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      res.json({
        success: true,
        message: 'Local Google Sign-In successful',
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  async requestOTP(req, res, next) {
    try {
      const { phone, email } = req.body;
      const result = await authService.requestOTP({ phone, email });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async verifyOTP(req, res, next) {
    try {
      const { phone, email, otp, role } = req.body;
      const result = await authService.verifyOTP({ phone, email, otp, role });

      res.cookie('ekawach_access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      res.json({
        success: true,
        message: 'OTP verification successful',
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req, res, next) {
    try {
      const token = req.body?.refreshToken || req.cookies?.ekawach_refresh_token;
      const result = await authService.refreshTokens(token);

      res.cookie('ekawach_access_token', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      res.json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      res.clearCookie('ekawach_access_token');
      const userId = req.user ? req.user.id : null;
      await authService.logout(userId);
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
