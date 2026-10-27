import { prisma } from '@nirakar/db';

export class AccessRepository {
  async getSettings() {
    return prisma.accessSettings.findUnique({
      where: { id: 'singleton' },
      select: {
        minAmount: true,
        maxAmount: true,
        defaultAmount: true,
        snapStops: true,
        freeReadPolicyMagazine: true,
        freeReadCountMagazine: true,
        passDurationDays: true,
        purposeText: true,
        tierLabels: true,
        thankYouMessages: true,
      },
    });
  }

  async updateSettings(data: any) {
    return prisma.accessSettings.update({
      where: { id: 'singleton' },
      data,
      select: {
        minAmount: true,
        maxAmount: true,
        defaultAmount: true,
        snapStops: true,
        freeReadPolicyMagazine: true,
        freeReadCountMagazine: true,
        passDurationDays: true,
        purposeText: true,
        tierLabels: true,
        thankYouMessages: true,
      },
    });
  }

  async hasActivePass(userId: string): Promise<boolean> {
    const pass = await prisma.supporterPass.findFirst({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { id: true },
    });
    return !!pass;
  }

  async canMeteredRead(userId?: string, deviceId = 'anonymous', itemId?: string): Promise<boolean> {
    if (itemId) {
      const alreadyRead = await prisma.readEvent.findFirst({
        where: {
          itemType: 'MAGAZINE',
          itemId,
          OR: [{ deviceId }, ...(userId ? [{ userId }] : [])],
        },
        select: { id: true },
      });
      if (alreadyRead) return true;
    }

    const settings = await this.getSettings();
    const count = await prisma.readEvent.count({
      where: {
        itemType: 'MAGAZINE',
        OR: [{ deviceId }, ...(userId ? [{ userId }] : [])],
      },
    });

    return count < (settings?.freeReadCountMagazine ?? 5);
  }

  async recordReadEvent(
    userId?: string,
    deviceId = 'anonymous',
    itemId = ''
  ) {
    return prisma.readEvent.upsert({
      where: {
        deviceId_itemType_itemId: {
          deviceId,
          itemType: 'MAGAZINE',
          itemId,
        },
      },
      update: {
        ...(userId ? { userId } : {}),
      },
      create: {
        deviceId,
        userId: userId || null,
        itemType: 'MAGAZINE',
        itemId,
      },
      select: { id: true, firstReadAt: true },
    });
  }

  async createOrder(data: {
    orderId: string;
    userId?: string;
    amount: number;
    currency: string;
    razorpayOrderId: string;
  }) {
    return prisma.order.create({
      data: {
        orderId: data.orderId,
        userId: data.userId || null,
        amount: data.amount,
        currency: data.currency,
        razorpayOrderId: data.razorpayOrderId,
        status: 'PENDING',
      },
      select: { id: true, orderId: true, razorpayOrderId: true, amount: true },
    });
  }

  async findOrderByRazorpayId(razorpayOrderId: string) {
    return prisma.order.findUnique({
      where: { razorpayOrderId },
      select: {
        id: true,
        orderId: true,
        userId: true,
        amount: true,
        currency: true,
        status: true,
        user: { select: { email: true, username: true } },
      },
    });
  }

  async grantSupporterPass(data: {
    userId: string;
    amount: number;
    source: 'PAYMENT' | 'MANUAL';
    paymentId?: string;
    orderId?: string;
    notes?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const pass = await tx.supporterPass.create({
        data: {
          userId: data.userId,
          amount: data.amount,
          source: data.source,
          paymentId: data.paymentId || null,
          orderId: data.orderId || null,
          notes: data.notes || null,
        },
        select: { id: true, amount: true, grantedAt: true, user: { select: { email: true, username: true } } },
      });

      // Generate receipt
      const receiptNo = `SNVE-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      await tx.receipt.create({
        data: {
          receiptNo,
          supporterPassId: pass.id,
          paymentId: data.paymentId || null,
          userEmail: pass.user.email,
          userName: pass.user.username,
          amount: data.amount,
        },
      });

      return pass;
    });
  }

  async isWebhookProcessed(eventId: string): Promise<boolean> {
    const existing = await prisma.webhookEvent.findUnique({
      where: { eventId },
      select: { id: true },
    });
    return !!existing;
  }

  async recordWebhookEvent(eventId: string, eventType: string, payload: any) {
    return prisma.webhookEvent.create({
      data: {
        eventId,
        eventType,
        payload,
      },
      select: { id: true },
    });
  }

  async listSupporters(limit = 50) {
    return prisma.supporterPass.findMany({
      take: limit,
      orderBy: { grantedAt: 'desc' },
      select: {
        id: true,
        amount: true,
        source: true,
        grantedAt: true,
        notes: true,
        user: {
          select: {
            username: true,
            email: true,
          },
        },
        receipt: {
          select: {
            receiptNo: true,
          },
        },
      },
    });
  }
}
