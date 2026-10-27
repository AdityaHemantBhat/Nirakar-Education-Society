import { prisma } from '@nirakar/db';
import { Prisma } from '@nirakar/db';

/**
 * Reading the audit log.
 */
export interface AuditQuery {
  /** Free text over the summary and the entity. */
  q?: string;
  /** A single kind of action, e.g. `DELETE`. */
  action?: string;
  /** A single kind of thing, e.g. `LibraryVolume`. */
  entity?: string;
  /** Only entries by this administrator. */
  userId?: string;
  page: number;
  limit: number;
}

export class AuditLogRepository {
  /**
   * A page of the log, newest first.
   */
  async list(query: AuditQuery) {
    const where: Prisma.AuditLogWhereInput = {};

    if (query.action) where.action = query.action;
    if (query.entity) where.entity = query.entity;
    if (query.userId) where.userId = query.userId;

    if (query.q) {
      where.OR = [
        { action: { contains: query.q, mode: 'insensitive' } },
        { entity: { contains: query.q, mode: 'insensitive' } },
        { entityId: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: query.limit,
        select: {
          id: true,
          userId: true,
          action: true,
          entity: true,
          entityId: true,
          details: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
          user: { select: { username: true, email: true, role: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { items, total, page: query.page, limit: query.limit };
  }

  /**
   * The kinds of action and entity in the log, so the console can offer
   * them as filters without hard-coding a list.
   */
  async facets() {
    const [actions, entities, people] = await Promise.all([
      prisma.auditLog.groupBy({ by: ['action'], _count: { _all: true } }),
      prisma.auditLog.groupBy({ by: ['entity'], _count: { _all: true } }),
      prisma.auditLog.groupBy({ by: ['userId'], _count: { _all: true } }),
    ]);

    const authors = await prisma.user.findMany({
      where: { id: { in: people.map((p) => p.userId).filter((id): id is string => Boolean(id)) } },
      select: { id: true, username: true, email: true },
    });

    return {
      actions: actions
        .map((a) => ({ value: a.action, count: a._count._all }))
        .sort((a, b) => b.count - a.count),
      entities: entities
        .map((e) => ({ value: e.entity, count: e._count._all }))
        .sort((a, b) => b.count - a.count),
      authors: authors.map((a) => ({
        id: a.id,
        username: a.username,
        email: a.email,
        count: people.find((p) => p.userId === a.id)?._count._all ?? 0,
      })),
    };
  }
}
