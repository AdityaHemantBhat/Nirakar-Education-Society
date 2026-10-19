import { z } from 'zod';
import { FREE_READ_POLICIES } from '../constants.js';

export const CreatePassOrderSchema = z.object({
  amount: z.number().int().min(10, 'Minimum supporter amount is Rs 10').max(1000, 'Maximum supporter amount is Rs 1000'),
  currency: z.literal('INR').default('INR'),
});

export type CreatePassOrderInput = z.infer<typeof CreatePassOrderSchema>;

export const AccessSettingsUpdateSchema = z.object({
  minAmount: z.number().int().min(1).default(10),
  maxAmount: z.number().int().max(10000).default(1000),
  defaultAmount: z.number().int().default(100),
  snapStops: z.array(z.number().int()).default([10, 20, 50, 100, 250, 500, 1000]),
  freeReadPolicyMagazine: z.nativeEnum(FREE_READ_POLICIES).default(FREE_READ_POLICIES.METERED_N),
  freeReadCountMagazine: z.number().int().min(0).default(5),
  freeReadPolicyPosts: z.nativeEnum(FREE_READ_POLICIES).default(FREE_READ_POLICIES.METERED_N),
  freeReadCountPosts: z.number().int().min(0).default(5),
  passDurationDays: z.number().int().positive().nullable().default(null),
  passAppliesTo: z.enum(['MAGAZINE', 'POSTS', 'BOTH']).default('BOTH'),
  purposeText: z.string().min(10),
  tierLabels: z.record(z.string()).default({}),
  thankYouMessages: z.record(z.string()).default({}),
});

export type AccessSettingsUpdateInput = z.infer<typeof AccessSettingsUpdateSchema>;

export const TrackReadEventSchema = z.object({
  itemType: z.enum(['MAGAZINE', 'POST']),
  itemId: z.string().cuid(),
  deviceId: z.string().optional(),
});
