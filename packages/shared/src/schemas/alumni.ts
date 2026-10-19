import { z } from 'zod';
import { ALLOWED_SOCIAL_DOMAINS, VISIBILITY_LEVELS } from '../constants.js';

const alumniImageUrlSchema = z.string().refine((value) => {
  if (value.startsWith('/uploads/') && !value.startsWith('//') && !value.split('/').includes('..')) {
    return true;
  }
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}, 'Photo must be an HTTP(S) URL or an uploaded image path');

export const SocialLinkSchema = z.object({
  platform: z.enum(['facebook', 'instagram', 'linkedin', 'twitter', 'website', 'github']),
  url: z.string().url().refine((val) => {
    try {
      const parsed = new URL(val);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
      return ALLOWED_SOCIAL_DOMAINS.some((domain) => parsed.hostname.endsWith(domain)) || parsed.hostname.length > 3;
    } catch {
      return false;
    }
  }, 'Social link must be a valid URL on an allowed platform'),
});

export const FamilyMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relation: z.string().min(1, 'Relation is required (e.g. Spouse, Son, Daughter)'),
  photoUrl: alumniImageUrlSchema.optional().nullable(),
  bio: z.string().max(300).optional().nullable(),
});

export const AlumniProfileUpdateSchema = z.object({
  firstName: z.string().min(2),
  middleName: z.string().optional().nullable(),
  lastName: z.string().min(2),
  photoUrl: alumniImageUrlSchema.optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  occupation: z.string().max(100).optional().nullable(),
  socialLinks: z.array(SocialLinkSchema).default([]),
  familyMembers: z.array(FamilyMemberSchema).default([]),
  galleryPhotos: z.array(alumniImageUrlSchema).default([]),
  visibilitySettings: z
    .object({
      city: z.nativeEnum(VISIBILITY_LEVELS).default(VISIBILITY_LEVELS.PUBLIC),
      occupation: z.nativeEnum(VISIBILITY_LEVELS).default(VISIBILITY_LEVELS.PUBLIC),
      bio: z.nativeEnum(VISIBILITY_LEVELS).default(VISIBILITY_LEVELS.PUBLIC),
      family: z.nativeEnum(VISIBILITY_LEVELS).default(VISIBILITY_LEVELS.ALUMNI_ONLY),
      socialLinks: z.nativeEnum(VISIBILITY_LEVELS).default(VISIBILITY_LEVELS.PUBLIC),
      gallery: z.nativeEnum(VISIBILITY_LEVELS).default(VISIBILITY_LEVELS.ALUMNI_ONLY),
    })
    .default({
      city: VISIBILITY_LEVELS.PUBLIC,
      occupation: VISIBILITY_LEVELS.PUBLIC,
      bio: VISIBILITY_LEVELS.PUBLIC,
      family: VISIBILITY_LEVELS.ALUMNI_ONLY,
      socialLinks: VISIBILITY_LEVELS.PUBLIC,
      gallery: VISIBILITY_LEVELS.ALUMNI_ONLY,
    }),
});

export type AlumniProfileUpdateInput = z.infer<typeof AlumniProfileUpdateSchema>;

export const AlumniVouchSchema = z.object({
  targetProfileId: z.string().cuid(),
  note: z.string().max(500).optional(),
});

export const AlumniReportSchema = z.object({
  targetProfileId: z.string().cuid(),
  reason: z.string().min(10, 'Please provide detailed reason for report (min 10 characters)'),
});
