import { z } from 'zod';

export const HeroSlideSchema = z.object({
  id: z.string().uuid(),
  imageUrl: z.string().url(),
  title: z.string().min(1),
  campus: z.string().min(1),
  tag: z.string().min(1),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const HeroSlideCreateSchema = HeroSlideSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const HeroSlideUpdateSchema = HeroSlideCreateSchema.partial();

export type HeroSlide = z.infer<typeof HeroSlideSchema>;
export type HeroSlideInput = z.infer<typeof HeroSlideCreateSchema>;
