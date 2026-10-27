import { prisma } from '@nirakar/db';

/**
 * The console's settings.
 *
 * They live in `site_settings` as plain key/value strings, so a setting
 * that this version of the console does not know about is left alone
 * rather than being wiped.
 */
export class SettingsRepository {
  /** The setting keys the console uses. */
  static readonly KEYS = {
    adminLoginPath: 'console.adminLoginPath',
    sessionLengthHours: 'console.sessionLengthHours',
    auditRetentionDays: 'console.auditRetentionDays',
    logSignIns: 'console.logSignIns',
    showAccountEmail: 'console.showAccountEmail',
  } as const;

  async getAll(): Promise<Record<string, string>> {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { startsWith: 'console.' } },
      select: { key: true, value: true },
    });

    const out: Record<string, string> = {};
    for (const row of rows) out[row.key] = row.value;
    return out;
  }

  /** Writes one setting, keeping the others as they are. */
  async set(key: string, value: string) {
    return prisma.siteSetting.upsert({
      where: { key },
      create: { key, value, type: 'STRING' },
      update: { value },
      select: { key: true, value: true },
    });
  }

  /** Writes several settings in one go. */
  async setMany(values: Record<string, string>) {
    await prisma.$transaction(
      Object.entries(values).map(([key, value]) =>
        prisma.siteSetting.upsert({
          where: { key },
          create: { key, value, type: 'STRING' },
          update: { value },
        }),
      ),
    );
  }
}
