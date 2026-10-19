import { describe, it, expect } from 'vitest';
import {
  AlumniRegisterSchema,
  CreatePassOrderSchema,
  ContactMessageSchema,
  MagazineIssueCreateSchema,
} from '@nirakar/shared';

describe('Shared Zod Validation Schemas', () => {
  it('validates correct alumni registration input', () => {
    const valid = {
      firstName: 'Aditya',
      middleName: 'R',
      lastName: 'Kamat',
      email: 'aditya@example.com',
      phone: '+91 9822123456',
      school: 'NIRAKAR_HS',
      batchYear: 2012,
      username: 'aditya_k',
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
      consent: true,
    };

    const parsed = AlumniRegisterSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('rejects alumni registration when passwords do not match', () => {
    const invalid = {
      firstName: 'Aditya',
      lastName: 'Kamat',
      email: 'aditya@example.com',
      phone: '+91 9822123456',
      school: 'NIRAKAR_HS',
      batchYear: 2012,
      username: 'aditya_k',
      password: 'StrongPassword123!',
      confirmPassword: 'MismatchPassword123!',
      consent: true,
    };

    const parsed = AlumniRegisterSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it('validates supporter pass contribution bounds (Rs 10 to Rs 1000)', () => {
    expect(CreatePassOrderSchema.safeParse({ amount: 10 }).success).toBe(true);
    expect(CreatePassOrderSchema.safeParse({ amount: 500 }).success).toBe(true);
    expect(CreatePassOrderSchema.safeParse({ amount: 1000 }).success).toBe(true);
    expect(CreatePassOrderSchema.safeParse({ amount: 5 }).success).toBe(false);
    expect(CreatePassOrderSchema.safeParse({ amount: 1500 }).success).toBe(false);
  });

  it('validates magazine issue creation input', () => {
    const valid = {
      title: 'Daily Patrika - Canacona Edition',
      publishDate: '2026-10-16',
      isLocked: true,
    };
    expect(MagazineIssueCreateSchema.safeParse(valid).success).toBe(true);

    const invalidDate = {
      title: 'Daily Patrika',
      publishDate: '16-10-2026', // wrong format
    };
    expect(MagazineIssueCreateSchema.safeParse(invalidDate).success).toBe(false);
  });
});
