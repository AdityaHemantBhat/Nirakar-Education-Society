import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import crypto from 'node:crypto';
import { createApp } from '../app.js';
import { config } from '../config/index.js';

describe('Supporter Pass & Access Endpoints', () => {
  let app: any;

  beforeAll(() => {
    app = createApp();
  });

  it('GET /healthz returns healthy status and timestamp', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('GET /api/v1/access/settings returns default monetisation rules', async () => {
    const res = await request(app).get('/api/v1/access/settings');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.minAmount).toBe(10);
    expect(res.body.data.maxAmount).toBe(1000);
  });

  it('POST /api/v1/access/order validates contribution amount bounds', async () => {
    // Below minimum of Rs 10
    const tooLow = await request(app).post('/api/v1/access/order').send({ amount: 5 });
    expect(tooLow.status).toBe(400);

    // Above maximum of Rs 1000
    const tooHigh = await request(app).post('/api/v1/access/order').send({ amount: 2500 });
    expect(tooHigh.status).toBe(400);

    // Valid contribution within bounds (e.g. Rs 100)
    const valid = await request(app).post('/api/v1/access/order').send({ amount: 100 });
    expect(valid.status).toBe(200);
    expect(valid.body.success).toBe(true);
    expect(valid.body.data.amount).toBe(100);
  });

  it('POST /api/v1/access/webhook verifies HMAC signature and processes idempotently', async () => {
    const payload = JSON.stringify({
      event: 'payment.captured',
      event_id: `evt_test_${Date.now()}`,
      payload: {
        payment: {
          entity: {
            id: 'pay_test_12345',
            amount: 10000, // 100 rupees
          },
        },
      },
    });

    const signature = crypto
      .createHmac('sha256', config.RAZORPAY_WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    // First call: succeeds
    const firstCall = await request(app)
      .post('/api/v1/access/webhook')
      .set('x-razorpay-signature', signature)
      .send(JSON.parse(payload));

    expect(firstCall.status).toBe(200);

    // Second call: idempotent (already processed)
    const secondCall = await request(app)
      .post('/api/v1/access/webhook')
      .set('x-razorpay-signature', signature)
      .send(JSON.parse(payload));

    expect(secondCall.status).toBe(200);
    expect(secondCall.body.status).toBe('already_processed');
  });
});
