import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

describe('Admissions document authorization', () => {
  const app = createApp();

  it('rejects anonymous application detail and document requests', async () => {
    for (const path of [
      '/api/v1/admissions/applications/application-id',
      '/api/v1/admissions/applications/application-id/pdf',
      '/api/v1/admissions/applications/application-id/media/photo',
    ]) {
      const response = await request(app).get(path);
      expect(response.status, path).toBe(401);
    }
  });
});
