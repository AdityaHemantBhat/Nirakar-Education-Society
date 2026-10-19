# Shree Nirakar Education Society — Official Web Platform

Modern digital campus and verified alumni network for **Shree Nirakar Education Society**, Mashem, Canacona, South Goa (Est. 1968), encompassing:
- **Shri Nirakar High School** (Mashem)
- **Tudal High School** (Gaodongrem)
- **S. S. Angle Higher Secondary School** (Maxem)

Built with PERN stack (PostgreSQL, Express, React 19, Node.js), Vite, Tailwind CSS v4, and deterministic classical PDF processing.

---

## 1. Quick Start (One Command Dev)

```bash
# 1. Install all dependencies across workspaces
npm install

# 2. Run the single unified dev command
npm run dev
```

The orchestrator will:
1. Initialize `.env` from `.env.example` if not present.
2. Verify PostgreSQL database connection.
3. Deploy Prisma schema migrations and run the seed script.
4. Concurrently launch:
   - **Public Site & Alumni Portal**: [http://localhost:5000](http://localhost:5000)
   - **Admin & Faculty Portal**: [http://localhost:5001](http://localhost:5001)
   - **Express API & Worker**: [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
   - **Healthcheck Endpoint**: [http://localhost:4000/healthz](http://localhost:4000/healthz)

---

## 2. Environment Variables Table

| Variable | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | `development` / `production` | Environment runtime flag |
| `PORT` | Yes | `4000` | Port for Express API server |
| `WEB_PORT` | No | `5000` | Port for Public Web Vite dev server |
| `ADMIN_PORT` | No | `5001` | Port for Admin Portal Vite dev server |
| `ADMIN_BASE_PATH` | Yes | `/admin` | URL subpath serving Admin SPA in production |
| `DATABASE_URL` | Yes | `postgresql://user:pass@localhost:5432/nirakar` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Yes | `min_32_chars_secret` | Signs 15-minute access tokens |
| `JWT_REFRESH_SECRET`| Yes | `min_32_chars_secret` | Signs rotating refresh tokens |
| `COOKIE_SECRET` | Yes | `min_32_chars_secret` | Signs secure httpOnly session cookies |
| `CORS_ORIGIN` | Yes | `http://localhost:5000,http://localhost:5001` | Allowed browser origins |
| `VITE_RECAPTCHA_SITE_KEY` | For public messaging and authentication | Google reCAPTCHA v3 site key | Public site key for the web and admin apps; available to the browser at build time |
| `RECAPTCHA_SECRET_KEY` | For public messaging and authentication | Set privately | Server-only Google reCAPTCHA v3 secret; never expose this in browser code |
| `RECAPTCHA_MIN_SCORE` | No | `0.5` | Minimum accepted reCAPTCHA v3 score |
| `SUPER_ADMIN_EMAIL` | Yes | `admin@nirakar.org` | Initial Super Administrator email |
| `SUPER_ADMIN_PASSWORD` | Yes | `Nirakar@Admin2026!` | Super Administrator password |
| `RAZORPAY_KEY_ID` | Yes | `rzp_test_...` | Razorpay public key ID |
| `RAZORPAY_KEY_SECRET` | Yes | `secret_...` | Razorpay private secret key |
| `RAZORPAY_WEBHOOK_SECRET` | Yes | `webhook_secret_...` | Verifies Razorpay webhook HMAC |
| `FB_PAGE_ID` | No | `NirakarVidyalay` | Official Facebook Page username/ID |
| `FB_PAGE_TOKEN` | No | `EAA...` | Meta Graph API Page Access Token |
| `GOOGLE_MAPS_EMBED_URL` | No | `https://www.google.com/maps/embed?...` | Campus Google Maps iframe embed |
| `STORAGE_DRIVER` | Yes | `local` (or `s3`) | Uploads storage driver |

---

Public faculty messaging and sign-in/registration for faculty, alumni, and administrators require
Google reCAPTCHA v3. Set `VITE_RECAPTCHA_SITE_KEY` for both the public web and admin builds, and
set `RECAPTCHA_SECRET_KEY` only in the API runtime environment. Register all website hostnames in
the Google reCAPTCHA console. The v3 check runs invisibly at form submission; the forms identify
the protection with a Google reCAPTCHA notice.

## 3. Deploy to Render in 10 minutes

The entire application runs as **ONE unified Render Web Service** plus a managed Render PostgreSQL database (`render.yaml` included).

1. **Fork or Push this repository to GitHub.**
2. Log in to [Render.com](https://render.com) and click **Blueprints** -> **New Blueprint Instance**.
3. Connect your GitHub repository. Render automatically reads `render.yaml` and provisions:
   - Managed PostgreSQL database (`nirakar-db`)
   - Node.js Web Service (`nirakar-education-society`)
4. Set required secret environment variables (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`).
5. Click **Apply**.
   - Build Command: `npm ci && npm run build`
   - Start Command: `npx prisma migrate deploy --schema=packages/db/prisma/schema.prisma && node apps/api/dist/server.js`
6. Once deployed:
   - Public Website: `https://your-app.onrender.com/`
   - Admin Portal: `https://your-app.onrender.com/admin`
   - REST API: `https://your-app.onrender.com/api/v1`

---

## 4. Administrative & Faculty Management

### Adding Admin Users
1. Log in to the Admin Portal at `/admin/login` using `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD`.
2. Navigate to **Users & Roles** to invite additional administrators or editors.

### Adding Faculty Members
1. Administrators create faculty records in **Faculty Directory** assigning their institution (`NIRAKAR_HS`, `TUDAL_HS`, or `ANGLE_HSS`).
2. Faculty members log into their dedicated self-service portal at `/admin/faculty/login`.
3. Faculty members update their subjects, qualifications, photo, and bio, and view verification status.

---

## 5. Third-Party Integrations Setup

### Razorpay Payments (Supporter Pass)
1. Sign up at [Razorpay.com](https://razorpay.com) and complete KYC.
2. In Dashboard -> Settings -> API Keys, generate **Key ID** and **Key Secret**.
3. Under Settings -> Webhooks, add endpoint: `https://your-domain.com/api/v1/access/webhook`.
4. Subscribe to events: `order.paid` and `payment.captured`.
5. Copy the Webhook Secret to `RAZORPAY_WEBHOOK_SECRET`.

### Meta Graph API & Facebook Page Sync
1. Visit [developers.facebook.com](https://developers.facebook.com) and create an App in Development mode.
2. Add the **Facebook Pages API** product.
3. Generate a long-lived Page Access Token for `NirakarVidyalay`.
4. Add `FB_PAGE_ID=NirakarVidyalay` and `FB_PAGE_TOKEN=<token>` to `.env`.
5. If no token is provided, the platform automatically falls back to official Page Plugin embeds.

---

## 6. Prohibited Content & Quality Guarantees

As enforced by `npm run check:banned` in CI:
- Zero mentions of forbidden CMS names or placeholders.
- Zero fake testimonials, statistics, or invented alumni data.
- Full compliance with India's **Digital Personal Data Protection (DPDP) Act 2023** (data export and deletion endpoints).
