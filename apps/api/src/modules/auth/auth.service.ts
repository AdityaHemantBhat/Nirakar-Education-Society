import argon2 from 'argon2';
import { AuthRepository } from './auth.repository.js';
import { AppError } from '../../middleware/error.js';
import { generateAccessToken, generateRefreshToken, hashRefreshToken } from '../../lib/jwt.js';
import { AlumniRegisterInput, LoginInput } from '@nirakar/shared';

export class AuthService {
  constructor(private repo = new AuthRepository()) {}

  async login(input: LoginInput, requiredRoleCategory?: 'ADMIN' | 'FACULTY' | 'ALUMNI') {
    const user = await this.repo.findByEmailOrUsername(input.identifier);
    if (!user) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid email/username or password', 401);
    }

    if (user.isSuspended) {
      throw new AppError('ACCOUNT_SUSPENDED', 'Your account has been suspended. Please contact administration.', 403);
    }

    const validPassword = await argon2.verify(user.passwordHash, input.password);
    if (!validPassword) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid email/username or password', 401);
    }

    // Role portal category enforcement
    if (requiredRoleCategory === 'ADMIN') {
      if (!['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(user.role)) {
        throw new AppError('FORBIDDEN', 'Access restricted to administrators', 403);
      }
    } else if (requiredRoleCategory === 'FACULTY') {
      if (user.role !== 'FACULTY' && user.role !== 'SUPER_ADMIN') {
        throw new AppError('FORBIDDEN', 'Access restricted to faculty members', 403);
      }
    }

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      alumniProfileId: user.alumniProfile?.id,
      institutionCode: user.facultyProfile?.institutionCode,
    };

    const accessToken = generateAccessToken(payload);
    const { token: rawRefreshToken, hash: refreshHash, expiresAt } = await generateRefreshToken();

    await this.repo.saveRefreshToken(user.id, refreshHash, expiresAt);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        alumniProfile: user.alumniProfile,
        facultyProfile: user.facultyProfile,
      },
      accessToken,
      refreshToken: rawRefreshToken,
      refreshExpiresAt: expiresAt,
    };
  }

  async registerAlumni(input: AlumniRegisterInput) {
    const existing = await this.repo.findByEmailOrUsername(input.email);
    if (existing) {
      throw new AppError('CONFLICT', 'An account with this email address already exists', 409);
    }

    const existingUsername = await this.repo.findByEmailOrUsername(input.username);
    if (existingUsername) {
      throw new AppError('CONFLICT', 'This username is already taken. Please choose another.', 409);
    }

    const passwordHash = await argon2.hash(input.password);
    const { user, profile } = await this.repo.createAlumniUser({
      email: input.email,
      username: input.username,
      passwordHash,
      firstName: input.firstName,
      middleName: input.middleName,
      lastName: input.lastName,
      school: input.school,
      batchYear: input.batchYear,
    });

    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      alumniProfileId: profile.id,
    };

    const accessToken = generateAccessToken(payload);
    const { token: rawRefreshToken, hash: refreshHash, expiresAt } = await generateRefreshToken();
    await this.repo.saveRefreshToken(user.id, refreshHash, expiresAt);

    return {
      user: {
        ...user,
        alumniProfile: profile,
      },
      accessToken,
      refreshToken: rawRefreshToken,
      refreshExpiresAt: expiresAt,
    };
  }

  async refreshTokens(rawRefreshToken: string) {
    const hash = hashRefreshToken(rawRefreshToken);
    const record = await this.repo.findValidRefreshToken(hash);

    if (!record || record.user.isSuspended) {
      throw new AppError('UNAUTHORIZED', 'Invalid or expired refresh token', 401);
    }

    // Revoke old token (rotating refresh token)
    await this.repo.revokeRefreshToken(record.id);

    const payload = {
      sub: record.user.id,
      email: record.user.email,
      username: record.user.username,
      role: record.user.role,
    };

    const newAccessToken = generateAccessToken(payload);
    const { token: nextRawRefreshToken, hash: nextRefreshHash, expiresAt } = await generateRefreshToken();
    await this.repo.saveRefreshToken(record.user.id, nextRefreshHash, expiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: nextRawRefreshToken,
      refreshExpiresAt: expiresAt,
    };
  }

  async logout(rawRefreshToken?: string) {
    if (!rawRefreshToken) return;
    await this.repo.revokeRefreshTokenByHash(hashRefreshToken(rawRefreshToken));
  }

  async getMe(userId: string) {
    const user = await this.repo.findById(userId);
    if (!user) {
      throw new AppError('NOT_FOUND', 'User profile not found', 404);
    }
    return user;
  }
}
