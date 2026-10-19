import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { AlumniRegisterSchema, LoginSchema } from '@nirakar/shared';
import { config } from '../../config/index.js';
import { broadcastAlumniUpdate } from '../../lib/socket.js';
import { verifyRecaptchaToken } from '../../lib/recaptcha.js';

export class AuthController {
  constructor(private service = new AuthService()) {}

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProd = config.NODE_ENV === 'production';

    res.clearCookie('accessToken', { path: '/api/v1/auth' });
    res.clearCookie('accessToken', { path: '/api/v1/auth/admin' });
    res.clearCookie('accessToken', { path: '/api/v1/auth/faculty' });
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/api/v1/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  loginAlumni = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await verifyRecaptchaToken(req.body?.captchaToken, 'auth_alumni_login');
      const input = LoginSchema.parse(req.body);
      const result = await this.service.login(input);
      this.setCookies(res, result.accessToken, result.refreshToken);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  loginAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await verifyRecaptchaToken(req.body?.captchaToken, 'auth_admin_login');
      const input = LoginSchema.parse(req.body);
      const result = await this.service.login(input, 'ADMIN');
      this.setCookies(res, result.accessToken, result.refreshToken);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  loginFaculty = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await verifyRecaptchaToken(req.body?.captchaToken, 'auth_faculty_login');
      const input = LoginSchema.parse(req.body);
      const result = await this.service.login(input, 'FACULTY');
      this.setCookies(res, result.accessToken, result.refreshToken);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  registerAlumni = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await verifyRecaptchaToken(req.body?.captchaToken, 'auth_alumni_register');
      const input = AlumniRegisterSchema.parse(req.body);
      const result = await this.service.registerAlumni(input);
      this.setCookies(res, result.accessToken, result.refreshToken);
      broadcastAlumniUpdate('created', result.user.alumniProfile);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rawToken = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!rawToken) {
        res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'No refresh token provided' } });
        return;
      }

      const result = await this.service.refreshTokens(rawToken);
      this.setCookies(res, result.accessToken, result.refreshToken);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  logout = async (_req: Request, res: Response) => {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('accessToken', { path: '/api/v1/auth' });
    res.clearCookie('accessToken', { path: '/api/v1/auth/admin' });
    res.clearCookie('accessToken', { path: '/api/v1/auth/faculty' });
    res.clearCookie('refreshToken', { path: '/api/v1/auth' });
    res.json({ success: true, message: 'Logged out successfully' });
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.service.getMe(req.user!.sub);
      res.json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  };
}
