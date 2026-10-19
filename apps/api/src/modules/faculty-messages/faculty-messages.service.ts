import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '@nirakar/db';
import { z } from 'zod';
import { AppError } from '../../middleware/error.js';
import { verifyRecaptchaToken } from '../../lib/recaptcha.js';
import {
  facultyModerationHash,
  formatModerationTimeInIst,
  hasProfanity,
  visitorModerationHashes,
} from './faculty-message-moderation.js';
import {
  getFacultyAttachmentPath,
  removeStoredFacultyAttachments,
  storeFacultyMessageAttachments,
} from './faculty-message-attachments.js';
import type { Express } from 'express';

const startConversationSchema = z
  .object({
    facultyProfileId: z.string().trim().min(1).max(100),
    parentName: z.string().trim().min(2).max(100),
    studentName: z.string().trim().max(100).optional(),
    classGrade: z.string().trim().max(50).optional(),
    phone: z.string().trim().max(40).optional(),
    email: z.union([z.string().trim().email().max(254), z.literal('')]).optional(),
    message: z.string().trim().max(2000).optional(),
    captchaToken: z.string().min(1).max(4096),
  })
  .refine((data) => Boolean(data.phone || data.email), {
    message: 'Provide a phone number or email address',
    path: ['phone'],
  });

const messageBodySchema = z.object({
  body: z.string().trim().max(2000).optional(),
});

const visitorMessageSchema = messageBodySchema.extend({
  captchaToken: z.string().min(1).max(4096),
});
const manualBlockSchema = z.object({ blocked: z.boolean() });

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
const STRIKE_RESET_MS = 30 * 24 * 60 * 60 * 1000;
const WARNING_COOLDOWNS_MS = [30_000, 5 * 60_000];
const AUTOMATIC_BLOCK_MS = 24 * 60 * 60 * 1000;

function requireVisitorToken(token: string | undefined) {
  if (!token || token.length < 40 || token.length > 100) {
    throw new AppError('UNAUTHORIZED', 'Conversation access token is missing or invalid', 401);
  }
  return hashToken(token);
}

export class FacultyMessagesService {
  async countUnreadAdminMessages() {
    const count = await prisma.facultyConversationMessage.count({
      where: { sender: 'VISITOR', readAt: null },
    });
    return { count };
  }

  async startConversation(input: unknown, files: Express.Multer.File[] = []) {
    const data = startConversationSchema.parse(input);
    if (!data.message && files.length === 0) {
      throw new AppError('VALIDATION_ERROR', 'Write a message or attach at least one file', 400);
    }
    await verifyRecaptchaToken(data.captchaToken, 'faculty_message');
    const visitorHashes = visitorModerationHashes({ phone: data.phone, email: data.email });
    await this.checkModeration('VISITOR', visitorHashes);
    await this.moderateText('VISITOR', visitorHashes, data.message || '', files);
    const faculty = await prisma.facultyProfile.findFirst({
      where: { id: data.facultyProfileId, status: 'PUBLISHED' },
      select: { id: true },
    });
    if (!faculty) {
      throw new AppError('NOT_FOUND', 'This faculty profile is not available for messages', 404);
    }

    const visitorToken = randomBytes(32).toString('base64url');
    const stored = await storeFacultyMessageAttachments(files);
    try {
      const conversation = await prisma.facultyConversation.create({
        data: {
          facultyProfileId: faculty.id,
          parentName: data.parentName,
          studentName: data.studentName || null,
          classGrade: data.classGrade || null,
          phone: data.phone || null,
          email: data.email || null,
          visitorTokenHash: hashToken(visitorToken),
          messages: {
            create: {
              sender: 'VISITOR',
              body: data.message || '',
              attachments: { create: stored },
            },
          },
        },
        select: {
          id: true,
          facultyProfileId: true,
          parentName: true,
          studentName: true,
          classGrade: true,
          lastMessageAt: true,
          createdAt: true,
          messages: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              sender: true,
              body: true,
              readAt: true,
              createdAt: true,
              attachments: { select: { id: true, originalName: true, mimeType: true, size: true } },
            },
          },
        },
      });

      return { conversation, accessToken: visitorToken };
    } catch (error) {
      await removeStoredFacultyAttachments(stored);
      throw error;
    }
  }

  async getVisitorConversation(id: string, token: string | undefined) {
    const visitorTokenHash = requireVisitorToken(token);
    const conversation = await prisma.facultyConversation.findFirst({
      where: { id, visitorTokenHash },
      select: {
        id: true,
        facultyProfileId: true,
        parentName: true,
        studentName: true,
        classGrade: true,
        phone: true,
        email: true,
        lastMessageAt: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            sender: true,
            body: true,
            readAt: true,
            createdAt: true,
            attachments: { select: { id: true, originalName: true, mimeType: true, size: true } },
          },
        },
        _count: {
          select: {
            messages: {
              where: { sender: { in: ['ADMIN', 'FACULTY'] }, readAt: null },
            },
          },
        },
      },
    });
    if (!conversation) {
      throw new AppError('NOT_FOUND', 'Conversation not found', 404);
    }
    return { ...conversation, unreadCount: conversation._count.messages };
  }

  async sendVisitorMessage(id: string, token: string | undefined, input: unknown, files: Express.Multer.File[] = []) {
    const visitorTokenHash = requireVisitorToken(token);
    const { body, captchaToken } = visitorMessageSchema.parse(input);
    if (!body && files.length === 0) {
      throw new AppError('VALIDATION_ERROR', 'Write a message or attach at least one file', 400);
    }
    const conversation = await prisma.facultyConversation.findFirst({
      where: { id, visitorTokenHash },
      select: { id: true, phone: true, email: true, visitorTokenHash: true },
    });
    if (!conversation) {
      throw new AppError('NOT_FOUND', 'Conversation not found', 404);
    }
    await verifyRecaptchaToken(captchaToken, 'faculty_message');
    const visitorHashes = visitorModerationHashes(conversation);
    await this.checkModeration('VISITOR', visitorHashes);
    await this.moderateText('VISITOR', visitorHashes, body || '', files);
    return this.createMessage(conversation.id, 'VISITOR', body || '', files);
  }

  async listFacultyConversations(userId: string) {
    const conversations = await prisma.facultyConversation.findMany({
      where: { facultyProfile: { userId } },
      orderBy: { lastMessageAt: 'desc' },
      take: 100,
      select: {
        id: true,
        parentName: true,
        studentName: true,
        classGrade: true,
        phone: true,
        email: true,
        lastMessageAt: true,
        facultyProfile: {
          select: {
            designation: true,
            department: true,
            institution: { select: { name: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            body: true,
            sender: true,
            createdAt: true,
            attachments: { select: { id: true, originalName: true, mimeType: true, size: true } },
          },
        },
        _count: {
          select: {
            messages: {
              where: { sender: 'VISITOR', readAt: null },
            },
          },
        },
      },
    });

    return conversations.map(({ _count, ...conversation }) => ({
      ...conversation,
      unreadCount: _count.messages,
      lastMessage: conversation.messages[0] || null,
      messages: undefined,
    }));
  }

  async countUnreadFacultyMessages(userId: string) {
    const count = await prisma.facultyConversationMessage.count({
      where: {
        sender: 'VISITOR',
        readAt: null,
        conversation: { facultyProfile: { userId } },
      },
    });
    return { count };
  }

  async getFacultyConversation(id: string, userId: string) {
    const conversation = await prisma.facultyConversation.findFirst({
      where: { id, facultyProfile: { userId } },
      select: {
        id: true,
        parentName: true,
        studentName: true,
        classGrade: true,
        phone: true,
        email: true,
        lastMessageAt: true,
        createdAt: true,
        facultyProfile: {
          select: {
            designation: true,
            department: true,
            institution: { select: { name: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            sender: true,
            body: true,
            readAt: true,
            createdAt: true,
            attachments: { select: { id: true, originalName: true, mimeType: true, size: true } },
          },
        },
        _count: {
          select: {
            messages: {
              where: { sender: 'VISITOR', readAt: null },
            },
          },
        },
      },
    });
    if (!conversation) {
      throw new AppError('NOT_FOUND', 'Conversation not found', 404);
    }
    return { ...conversation, unreadCount: conversation._count.messages };
  }

  async sendFacultyMessage(id: string, userId: string, input: unknown, files: Express.Multer.File[] = []) {
    const { body } = messageBodySchema.parse(input);
    if (!body && files.length === 0) {
      throw new AppError('VALIDATION_ERROR', 'Write a message or attach at least one file', 400);
    }
    const facultyHash = facultyModerationHash(userId);
    await this.checkModeration('FACULTY', [facultyHash]);
    await this.moderateText('FACULTY', [facultyHash], body || '', files);
    const conversation = await prisma.facultyConversation.findFirst({
      where: { id, facultyProfile: { userId } },
      select: { id: true },
    });
    if (!conversation) {
      throw new AppError('NOT_FOUND', 'Conversation not found', 404);
    }
    return this.createMessage(conversation.id, 'FACULTY', body || '', files);
  }

  async markFacultyRead(id: string, userId: string) {
    const conversation = await prisma.facultyConversation.findFirst({
      where: { id, facultyProfile: { userId } },
      select: { id: true },
    });
    if (!conversation) {
      throw new AppError('NOT_FOUND', 'Conversation not found', 404);
    }
    await prisma.facultyConversationMessage.updateMany({
      where: { conversationId: id, sender: 'VISITOR', readAt: null },
      data: { readAt: new Date() },
    });
    return { success: true };
  }

  async listAdminConversations() {
    const conversations = await prisma.facultyConversation.findMany({
      orderBy: { lastMessageAt: 'desc' },
      take: 100,
      select: {
        id: true,
        parentName: true,
        studentName: true,
        classGrade: true,
        lastMessageAt: true,
        facultyProfile: {
          select: {
            designation: true,
            department: true,
            institution: { select: { name: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            body: true,
            sender: true,
            createdAt: true,
            attachments: { select: { id: true, originalName: true, mimeType: true, size: true } },
          },
        },
        _count: {
          select: {
            messages: {
              where: { sender: 'VISITOR', readAt: null },
            },
          },
        },
      },
    });

    return conversations.map(({ _count, ...conversation }) => ({
      ...conversation,
      unreadCount: _count.messages,
      lastMessage: conversation.messages[0] || null,
      messages: undefined,
    }));
  }

  async getAdminConversation(id: string) {
    const conversation = await prisma.facultyConversation.findUnique({
      where: { id },
      select: {
        id: true,
        parentName: true,
        studentName: true,
        classGrade: true,
        phone: true,
        email: true,
        lastMessageAt: true,
        createdAt: true,
        facultyProfile: {
          select: {
            designation: true,
            department: true,
            institution: { select: { name: true } },
            user: { select: { username: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            sender: true,
            body: true,
            readAt: true,
            createdAt: true,
            attachments: { select: { id: true, originalName: true, mimeType: true, size: true } },
          },
        },
        _count: {
          select: {
            messages: {
              where: { sender: 'VISITOR', readAt: null },
            },
          },
        },
      },
    });
    if (!conversation) {
      throw new AppError('NOT_FOUND', 'Conversation not found', 404);
    }
    const moderation = await this.getVisitorModerationStatus(conversation);
    return { ...conversation, unreadCount: conversation._count.messages, moderation };
  }

  async setVisitorManualBlock(id: string, adminUserId: string, input: unknown) {
    const { blocked } = manualBlockSchema.parse(input);
    const conversation = await prisma.facultyConversation.findUnique({
      where: { id },
      select: { phone: true, email: true, visitorTokenHash: true },
    });
    if (!conversation) throw new AppError('NOT_FOUND', 'Conversation not found', 404);
    const hashes = visitorModerationHashes(conversation);
    const now = new Date();
    await prisma.$transaction(
      hashes.map((identityHash) =>
        prisma.facultyMessageModeration.upsert({
          where: { identityType_identityHash: { identityType: 'VISITOR', identityHash } },
          create: {
            identityType: 'VISITOR',
            identityHash,
            manualBlockedAt: blocked ? now : null,
            manualBlockedBy: blocked ? adminUserId : null,
            ...(blocked ? {} : { strikes: 0, lastViolationAt: null, cooldownUntil: null, blockedUntil: null }),
          },
          update: blocked
            ? { manualBlockedAt: now, manualBlockedBy: adminUserId }
            : {
                manualBlockedAt: null,
                manualBlockedBy: null,
                strikes: 0,
                lastViolationAt: null,
                cooldownUntil: null,
                blockedUntil: null,
              },
        })
      )
    );
    return this.getVisitorModerationStatus(conversation);
  }

  async sendAdminMessage(id: string, input: unknown, files: Express.Multer.File[] = []) {
    const { body } = messageBodySchema.parse(input);
    if (!body && files.length === 0) {
      throw new AppError('VALIDATION_ERROR', 'Write a message or attach at least one file', 400);
    }
    const conversation = await prisma.facultyConversation.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!conversation) {
      throw new AppError('NOT_FOUND', 'Conversation not found', 404);
    }
    return this.createMessage(conversation.id, 'ADMIN', body || '', files);
  }

  async markRead(id: string, reader: 'VISITOR' | 'ADMIN', token?: string) {
    const where =
      reader === 'VISITOR'
        ? { id, visitorTokenHash: requireVisitorToken(token) }
        : { id };
    const conversation = await prisma.facultyConversation.findFirst({
      where,
      select: { id: true },
    });
    if (!conversation) {
      throw new AppError('NOT_FOUND', 'Conversation not found', 404);
    }
    await prisma.facultyConversationMessage.updateMany({
      where: {
        conversationId: id,
        sender: reader === 'VISITOR' ? { in: ['ADMIN', 'FACULTY'] } : 'VISITOR',
        readAt: null,
      },
      data: { readAt: new Date() },
    });
    return { success: true };
  }

  async getAttachment(
    id: string,
    options: { visitorToken?: string; userId?: string; isAdmin?: boolean }
  ) {
    const attachment = await prisma.facultyConversationAttachment.findUnique({
      where: { id },
      select: {
        originalName: true,
        storageName: true,
        mimeType: true,
        message: {
          select: {
            conversation: {
              select: {
                visitorTokenHash: true,
                facultyProfile: { select: { userId: true } },
              },
            },
          },
        },
      },
    });
    if (!attachment) throw new AppError('NOT_FOUND', 'Attachment not found', 404);

    const conversation = attachment.message.conversation;
    const visitorAuthorized = options.visitorToken &&
      conversation.visitorTokenHash === hashToken(options.visitorToken);
    const facultyAuthorized = options.userId &&
      conversation.facultyProfile.userId === options.userId;
    if (!options.isAdmin && !visitorAuthorized && !facultyAuthorized) {
      throw new AppError('NOT_FOUND', 'Attachment not found', 404);
    }
    return {
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      path: getFacultyAttachmentPath(attachment.storageName),
    };
  }

  private async getVisitorModerationStatus(identity: {
    phone?: string | null;
    email?: string | null;
    visitorTokenHash?: string;
  }) {
    const hashes = visitorModerationHashes(identity);
    const rows = await prisma.facultyMessageModeration.findMany({
      where: { identityType: 'VISITOR', identityHash: { in: hashes } },
      select: { strikes: true, blockedUntil: true, manualBlockedAt: true },
    });
    const now = Date.now();
    const blockedUntil = rows
      .map((row) => row.blockedUntil)
      .filter((date): date is Date => Boolean(date && date.getTime() > now))
      .sort((left, right) => right.getTime() - left.getTime())[0] || null;
    const manuallyBlocked = rows.some((row) => row.manualBlockedAt !== null);
    return {
      strikes: Math.max(0, ...rows.map((row) => row.strikes)),
      isBlocked: manuallyBlocked || Boolean(blockedUntil),
      manuallyBlocked,
      blockedUntil,
    };
  }

  private async checkModeration(identityType: 'VISITOR' | 'FACULTY', hashes: string[]) {
    const rows = await prisma.facultyMessageModeration.findMany({
      where: { identityType, identityHash: { in: hashes } },
      select: { strikes: true, lastViolationAt: true, cooldownUntil: true, blockedUntil: true, manualBlockedAt: true },
    });
    if (rows.some((row) => row.manualBlockedAt)) {
      throw new AppError('MESSAGE_BLOCKED', 'Messaging has been blocked by school administration.', 403);
    }
    const now = Date.now();
    const isRecent = (date: Date | null) => Boolean(date && now - date.getTime() < STRIKE_RESET_MS);
    const activeRows = rows.filter((row) => isRecent(row.lastViolationAt));
    const blockedUntil = activeRows
      .map((row) => row.blockedUntil)
      .filter((date): date is Date => Boolean(date && date.getTime() > now))
      .sort((left, right) => right.getTime() - left.getTime())[0];
    if (blockedUntil) {
      throw new AppError('MESSAGE_BLOCKED', `Messaging is temporarily blocked until ${formatModerationTimeInIst(blockedUntil)}.`, 429, {
        blockedUntil,
        strikes: Math.max(...activeRows.map((row) => row.strikes)),
      });
    }
    const cooldownUntil = activeRows
      .map((row) => row.cooldownUntil)
      .filter((date): date is Date => Boolean(date && date.getTime() > now))
      .sort((left, right) => right.getTime() - left.getTime())[0];
    if (cooldownUntil) {
      throw new AppError(
        'MESSAGE_COOLDOWN',
        `A message was flagged for inappropriate language. You have warning ${Math.max(...activeRows.map((row) => row.strikes))} of 3. Please wait until ${formatModerationTimeInIst(cooldownUntil)}.`,
        429,
        { cooldownUntil, strikes: Math.max(...activeRows.map((row) => row.strikes)) }
      );
    }
  }

  private async moderateText(
    identityType: 'VISITOR' | 'FACULTY',
    hashes: string[],
    body: string,
    files: Express.Multer.File[]
  ) {
    const text = [body, ...files.map((file) => file.originalname)].join('\n');
    if (!hasProfanity(text)) return;

    const now = new Date();
    const rows = await prisma.facultyMessageModeration.findMany({
      where: { identityType, identityHash: { in: hashes } },
      select: { strikes: true, lastViolationAt: true, manualBlockedAt: true },
    });
    if (rows.some((row) => row.manualBlockedAt)) {
      throw new AppError('MESSAGE_BLOCKED', 'Messaging has been blocked by school administration.', 403);
    }
    const hasRecentStrike = rows.some(
      (row) => row.lastViolationAt && now.getTime() - row.lastViolationAt.getTime() < STRIKE_RESET_MS
    );
    const strike = hasRecentStrike
      ? Math.max(0, ...rows.map((row) => row.strikes)) + 1
      : 1;
    const cooldownUntil = strike < 3
      ? new Date(now.getTime() + WARNING_COOLDOWNS_MS[strike - 1])
      : null;
    const blockedUntil = strike >= 3 ? new Date(now.getTime() + AUTOMATIC_BLOCK_MS) : null;
    await prisma.$transaction(
      hashes.map((identityHash) =>
        prisma.facultyMessageModeration.upsert({
          where: { identityType_identityHash: { identityType, identityHash } },
          create: {
            identityType,
            identityHash,
            strikes: strike,
            lastViolationAt: now,
            cooldownUntil,
            blockedUntil,
          },
          update: {
            strikes: strike,
            lastViolationAt: now,
            cooldownUntil,
            blockedUntil,
          },
        })
      )
    );
    if (strike >= 3) {
      throw new AppError(
        'MESSAGE_BLOCKED',
        'This message was not sent. Messaging is blocked for 24 hours after 3 language warnings.',
        429,
        { strikes: strike, blockedUntil }
      );
    }
    throw new AppError(
      'MESSAGE_WARNING',
      `This message was not sent because it contains inappropriate language. Warning ${strike} of 3; messaging is paused for ${strike === 1 ? '30 seconds' : '5 minutes'}.`,
      400,
      { strikes: strike, cooldownUntil }
    );
  }

  private async createMessage(
    conversationId: string,
    sender: 'VISITOR' | 'ADMIN' | 'FACULTY',
    body: string,
    files: Express.Multer.File[] = []
  ) {
    const stored = await storeFacultyMessageAttachments(files);
    try {
      const createdAt = new Date();
      const [, message] = await prisma.$transaction([
        prisma.facultyConversation.update({
          where: { id: conversationId },
          data: { lastMessageAt: createdAt },
          select: { id: true },
        }),
        prisma.facultyConversationMessage.create({
          data: {
            conversationId,
            sender,
            body,
            attachments: { create: stored },
          },
          select: {
            id: true,
            sender: true,
            body: true,
            readAt: true,
            createdAt: true,
            attachments: { select: { id: true, originalName: true, mimeType: true, size: true } },
          },
        }),
      ]);
      return message;
    } catch (error) {
      await removeStoredFacultyAttachments(stored);
      throw error;
    }
  }
}
