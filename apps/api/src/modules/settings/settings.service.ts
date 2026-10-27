import argon2 from 'argon2';
import { prisma } from '@nirakar/db';
import { SettingsRepository } from './settings.repository.js';
import { AppError } from '../../middleware/error.js';
import {
  ConsoleSettings,
  ConsoleSettingsSchema,
  ChangePasswordInput,
} from '@nirakar/shared';

export class SettingsService {
  constructor(private repo = new SettingsRepository()) {}

  /**
   * The console's settings, with the defaults filled in for anything that
   * has never been set.
   */
  async getConsoleSettings(): Promise<ConsoleSettings> {
    const stored = await this.repo.getAll();

    const raw = {
      adminLoginPath: stored[SettingsRepository.KEYS.adminLoginPath] ?? 'login',
      sessionLengthHours: stored[SettingsRepository.KEYS.sessionLengthHours] ?? '24',
      auditRetentionDays: stored[SettingsRepository.KEYS.auditRetentionDays] ?? '365',
      logSignIns: stored[SettingsRepository.KEYS.logSignIns] ?? 'true',
      showAccountEmail: stored[SettingsRepository.KEYS.showAccountEmail] ?? 'false',
    };

    /* A stored value that no longer parses — because the rules tightened,
       or the row was edited by hand — falls back to the default rather
       than breaking the console. */
    const parsed = ConsoleSettingsSchema.safeParse(raw);
    if (parsed.success) return parsed.data;

    return ConsoleSettingsSchema.parse({
      adminLoginPath: 'login',
      sessionLengthHours: '24',
      auditRetentionDays: '365',
      logSignIns: 'true',
      showAccountEmail: 'false',
    });
  }

  /**
   * The path the sign-in page lives at, without a leading slash.
   *
   * This is read on every request that needs to know where the sign-in
   * page is, so it is kept cheap: one row, no joins.
   */
  async getAdminLoginPath(): Promise<string> {
    try {
      const row = await prisma.siteSetting.findUnique({
        where: { key: SettingsRepository.KEYS.adminLoginPath },
        select: { value: true },
      });
      return row?.value || 'login';
    } catch {
      return 'login';
    }
  }

  async updateConsoleSettings(input: Partial<ConsoleSettings>) {
    const current = await this.getConsoleSettings();
    const merged = ConsoleSettingsSchema.parse({ ...current, ...input });

    await this.repo.setMany({
      [SettingsRepository.KEYS.adminLoginPath]: merged.adminLoginPath,
      [SettingsRepository.KEYS.sessionLengthHours]: String(merged.sessionLengthHours),
      [SettingsRepository.KEYS.auditRetentionDays]: String(merged.auditRetentionDays),
      [SettingsRepository.KEYS.logSignIns]: String(merged.logSignIns),
      [SettingsRepository.KEYS.showAccountEmail]: String(merged.showAccountEmail),
    });

    return merged;
  }

  /**
   * Changes the administrator's own password.
   *
   * The current password has to be given, so that a session left open on a
   * shared machine cannot be used to take the account over. Every session
   * the account holds is ended afterwards, so that a stolen session does
   * not outlive the password change.
   */
  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      throw new AppError('NOT_FOUND', 'That account could not be found', 404);
    }

    const currentMatches = await argon2
      .verify(user.passwordHash, input.currentPassword)
      .catch(() => false);

    if (!currentMatches) {
      throw new AppError('INVALID_CREDENTIALS', 'Your current password is not correct', 401);
    }

    if (input.currentPassword === input.newPassword) {
      throw new AppError(
        'BAD_REQUEST',
        'The new password must be different from the current one',
        400,
      );
    }

    const passwordHash = await argon2.hash(input.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    /* Every existing session for this account is ended, so a session
       opened before the change stops working. */
    await prisma.refreshToken.deleteMany({ where: { userId } });

    return { changed: true };
  }

  /**
   * Lists administrative console users (SUPER_ADMIN, ADMIN, EDITOR).
   */
  async listAdminUsers() {
    return prisma.user.findMany({
      where: {
        role: { in: ['SUPER_ADMIN', 'ADMIN', 'EDITOR'] },
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        isSuspended: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Super Admin creates a new Administrator or Editor account.
   */
  async createAdminUser(
    operatorRole: string,
    input: { email: string; username: string; password: string; role: 'ADMIN' | 'EDITOR' },
  ) {
    if (operatorRole !== 'SUPER_ADMIN') {
      throw new AppError('FORBIDDEN', 'Only a Super Admin can create administrator accounts', 403);
    }

    const existingEmail = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingEmail) {
      throw new AppError('CONFLICT', 'An account with that email already exists', 409);
    }

    const existingUsername = await prisma.user.findUnique({ where: { username: input.username } });
    if (existingUsername) {
      throw new AppError('CONFLICT', 'An account with that username already exists', 409);
    }

    const passwordHash = await argon2.hash(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        username: input.username,
        passwordHash,
        role: input.role,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Reset password for an admin or editor account.
   * - Super Admin can reset password of any ADMIN or EDITOR.
   * - An ADMIN cannot reset a SUPER_ADMIN's password.
   */
  async resetAdminUserPassword(
    operatorId: string,
    operatorRole: string,
    targetUserId: string,
    newPassword: string,
  ) {
    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true, username: true },
    });

    if (!target) {
      throw new AppError('NOT_FOUND', 'That administrator account was not found', 404);
    }

    if (target.role === 'SUPER_ADMIN' && operatorRole !== 'SUPER_ADMIN') {
      throw new AppError('FORBIDDEN', 'Only a Super Admin can change a Super Admin account password', 403);
    }

    // Regular ADMIN cannot reset another ADMIN's password, only their own or an EDITOR's, unless they are SUPER_ADMIN
    if (operatorRole === 'ADMIN' && target.role === 'ADMIN' && target.id !== operatorId) {
      throw new AppError('FORBIDDEN', 'Only a Super Admin can reset another administrator password', 403);
    }

    const passwordHash = await argon2.hash(newPassword);

    await prisma.user.update({
      where: { id: targetUserId },
      data: { passwordHash },
    });

    await prisma.refreshToken.deleteMany({ where: { userId: targetUserId } });

    return { success: true, username: target.username };
  }

  /**
   * Delete an admin or editor account.
   * STRICT ENFORCEMENT:
   * - ONLY Super Admin can delete other admins or editors.
   * - Super Admin CANNOT be deleted by ANYONE (even accidentally).
   */
  async deleteAdminUser(operatorRole: string, targetUserId: string) {
    if (operatorRole !== 'SUPER_ADMIN') {
      throw new AppError('FORBIDDEN', 'Only the Super Admin can delete administrator accounts', 403);
    }

    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true, username: true },
    });

    if (!target) {
      throw new AppError('NOT_FOUND', 'That account was not found', 404);
    }

    if (target.role === 'SUPER_ADMIN') {
      throw new AppError('FORBIDDEN', 'The Super Admin account cannot be deleted under any circumstances', 403);
    }

    await prisma.user.delete({
      where: { id: targetUserId },
    });

    return { deleted: true, username: target.username };
  }
}
