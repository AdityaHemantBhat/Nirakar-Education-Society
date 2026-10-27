export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  EDITOR: 'EDITOR',
  FACULTY: 'FACULTY',
  ALUMNI: 'ALUMNI',
  READER: 'READER',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const SCHOOLS = {
  NIRAKAR_HS: 'NIRAKAR_HS',
  TUDAL_HS: 'TUDAL_HS',
  ANGLE_HSS: 'ANGLE_HSS',
} as const;

export type SchoolCode = (typeof SCHOOLS)[keyof typeof SCHOOLS];

export const SCHOOL_DETAILS: Record<SchoolCode, { name: string; slug: string; tagline: string }> = {
  NIRAKAR_HS: {
    name: 'Shri Nirakar High School',
    slug: 'nirakar-high-school',
    tagline: 'Excellence in Secondary Education, Mashem, Canacona',
  },
  TUDAL_HS: {
    name: 'Tudal High School',
    slug: 'tudal-high-school',
    tagline: 'Fostering Rural Talent with Holistic Character, Gaodongrem',
  },
  ANGLE_HSS: {
    name: 'S. S. Angle Higher Secondary School',
    slug: 'angle-higher-secondary',
    tagline: 'Leading Arts, Science & Commerce Streams with Distinction',
  },
};

export const VISIBILITY_LEVELS = {
  PUBLIC: 'PUBLIC',
  ALUMNI_ONLY: 'ALUMNI_ONLY',
  ONLY_ME: 'ONLY_ME',
} as const;

export type VisibilityLevel = (typeof VISIBILITY_LEVELS)[keyof typeof VISIBILITY_LEVELS];

export const VERIFICATION_LEVELS = {
  UNVERIFIED: 'UNVERIFIED',
  EMAIL_VERIFIED: 'EMAIL_VERIFIED',
  VERIFIED: 'VERIFIED',
  TRUSTED: 'TRUSTED',
} as const;

export type VerificationLevel = (typeof VERIFICATION_LEVELS)[keyof typeof VERIFICATION_LEVELS];

export const FACULTY_STATUSES = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  PUBLISHED: 'PUBLISHED',
} as const;

export type FacultyStatus = (typeof FACULTY_STATUSES)[keyof typeof FACULTY_STATUSES];

export const FREE_READ_POLICIES = {
  METERED_N: 'METERED_N',
  NEWEST_N_FREE: 'NEWEST_N_FREE',
  OLDEST_N_FREE: 'OLDEST_N_FREE',
  NONE: 'NONE',
} as const;

export type FreeReadPolicy = (typeof FREE_READ_POLICIES)[keyof typeof FREE_READ_POLICIES];

export const PASS_SNAP_STOPS = [10, 20, 50, 100, 250, 500, 1000] as const;

export const DEFAULT_ACCESS_SETTINGS = {
  minAmount: 10,
  maxAmount: 1000,
  defaultAmount: 100,
  snapStops: [10, 20, 50, 100, 250, 500, 1000],
  freeReadPolicyMagazine: FREE_READ_POLICIES.METERED_N,
  freeReadCountMagazine: 5,
  passDurationDays: null, // lifetime
  purposeText: 'Your contribution supports student scholarships, library book purchases, and classroom facilities at Shri Nirakar Vidhyalaya.',
  tierLabels: {
    10: 'Student Supporter',
    50: 'Patron of Learning',
    100: 'Vidya Sahayak',
    250: 'Heritage Builder',
    500: 'Guardian Pillar',
    1000: 'Distinguished Benefactor',
  },
  thankYouMessages: {
    10: 'Thank you for supporting our school library!',
    50: 'Your contribution enriches young minds.',
    100: 'Heartfelt gratitude from the entire Nirakar family.',
    250: 'Your generosity builds a stronger tomorrow.',
    500: 'You are an inspiring guardian of our heritage.',
    1000: 'Outstanding dedication to the cause of rural education in Goa.',
  },
};

export const ALLOWED_SOCIAL_DOMAINS = [
  'facebook.com',
  'instagram.com',
  'linkedin.com',
  'x.com',
  'twitter.com',
  'youtube.com',
  'github.com',
];
