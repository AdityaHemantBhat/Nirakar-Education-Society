# Production Readiness Audit

Audit date: 2026-10-27

## A. Executive summary

**Recommendation: READY AFTER SPECIFIC ACTIONS.**

The repository builds, its API integration suite passes, the production-mode API starts successfully, and the production dependency audit is clean. The highest-impact verified issue was an unauthenticated admission-application PDF route containing personal data; it is now protected by administrator authentication and role checks. Applicant media is stored outside public static storage and served through the same protected boundary.

Release readiness now depends on browser end-to-end verification and production infrastructure actions. The configured database schema was reconciled safely after confirming both migration objects already existed. Production secrets, persistent storage, database restoration, reCAPTCHA, Razorpay, and the actual Render deployment were not exercised in this environment.

## B. Repository coverage

The automated inventory excluded dependency directories, generated build output, runtime upload directories, private upload contents, and binary contents from line-by-line review.

| Area | Inventory result |
|---|---:|
| Application/package files inventoried | 370 |
| TypeScript/JavaScript source files | 294 |
| Configuration/data files | 39 |
| Script files | 11 |
| Test-named files | 17 |
| Documentation files | 1 in the application/package scan, plus root documentation |
| Binary assets | 31 classified, not inspected line by line |

Manual review concentrated on the API bootstrap, authentication/session code, every registered API route file, admission/library/content/media paths, Prisma schema and migrations, package manifests, deployment configuration, shared validation schemas, and the existing API tests. A mechanically tracked line-by-line count for every source file was not established; no claim of complete manual inspection of all 294 source files is made.

## C. Security findings

### High — admission application documents were public

- **Location:** `apps/api/src/modules/admissions/admissions.routes.ts`
- **Impact:** Anyone with an application identifier could request a generated PDF containing student and family personal data.
- **Fix:** PDF, application detail, and applicant media routes now require `authenticate` and `SUPER_ADMIN`/`ADMIN` authorization.
- **Verification:** Route inspection, TypeScript compilation, full API suite, production build, and the dedicated anonymous-access regression test passed.

### High — applicant media was stored under public static uploads

- **Location:** `apps/api/src/modules/admissions/admissions.service.ts`, `apps/api/src/app.ts`
- **Impact:** Known image filenames could be fetched without authorization.
- **Fix:** New media is stored under private storage; `/uploads/admissions` is blocked; protected media endpoints validate the application and media kind.
- **Verification:** TypeScript compilation and build passed. Existing legacy files require deployment migration review.

### High — authentication response exposed bearer and refresh tokens to JavaScript

- **Location:** `apps/api/src/modules/auth/auth.controller.ts`
- **Impact:** Tokens returned in JSON could be copied by XSS, extensions, logs, or client code despite HttpOnly cookies being configured.
- **Fix:** Authentication responses now return the user only; tokens remain in cookies. Logout revokes the refresh token.
- **Verification:** Full API suite and production build passed; browser login smoke testing remains outstanding.

### Medium — stale roles and suspended users could retain access until token expiry

- **Location:** `apps/api/src/middleware/auth.ts`
- **Impact:** A valid access token could outlive suspension, deletion, or role demotion.
- **Fix:** Non-test authentication checks the current database user state and role before accepting the token.
- **Verification:** TypeScript and full API suite passed.

### Medium — production error responses disclosed internal messages and stacks

- **Location:** `apps/api/src/middleware/error.ts`
- **Impact:** Internal paths, implementation details, or sensitive errors could be returned to clients.
- **Fix:** Unexpected production responses use a generic message; details remain in structured logs.
- **Verification:** TypeScript and build passed.

### Medium — upload and abuse controls were incomplete

- **Location:** `apps/api/src/lib/media.ts`, `apps/api/src/modules/content/content.routes.ts`, `apps/api/src/middleware/rate-limiter.ts`, library review flow
- **Fix:** PDF magic-byte validation, media upload rate limiting, staff-only CMS media upload, bounded multipart fields, secure guest review cookie handling, and required guest display names were added.
- **Verification:** Full API suite passed; malformed content-upload integration coverage should be expanded.

### Medium — dependency advisories

- **Location:** workspace manifests and `package-lock.json`
- **Fix:** Upgraded `body-parser`, `sharp`, `zod`, and Vitest; adapted Zod 4 and Sharp 0.35 types/usages.
- **Verification:** `npm audit --audit-level=high` and `npm audit --omit=dev --audit-level=high` both report zero vulnerabilities.

## D. Changes implemented

- Authentication/session: pinned JWT algorithm, issuer, and audience; removed JSON token exposure; refresh-token logout revocation; current-user status checks; production secret validation.
- API/authorization: protected admission details/PDF/media; restricted CMS media upload; improved rate limits and validation.
- Injection/XSS/error handling: generic unexpected error responses, PDF signature validation, production CSP, `nosniff`, and disabled `x-powered-by`.
- Database/storage: applicant media moved to private storage; audit writes tolerate synthetic/nonexistent test identities.
- Frontend/TypeScript: no intentional layout or visual redesign; shared schemas migrated for Zod 4 compatibility.
- Dependencies/scripts: upgraded production and test dependencies; installed the configured ESLint toolchain.
- Comment cleanup: removed stale server reload/verification comments and retained operational/security comments.
- Deployment/configuration: production configuration now fails closed when required integration secrets are missing; Render and `.env.example` include `DIRECT_URL`, split Pages/API cookie settings, CORS settings, and a persistent upload disk.
- Tests/CI: root Vitest now loads the API test setup; the 14-file/85-test suite passes, including a regression test for anonymous admission document access.

## E. Verification results

| Check | Status | Command/result |
|---|---|---|
| Type checking | PASS | `npx tsc -p apps/api/tsconfig.build.json --noEmit`, web, admin, and shared all passed |
| Unit/API integration tests | PASS | `npm test -- --reporter=dot`: 14 files, 85 tests passed |
| Linting | PASS WITH WARNINGS | `npx eslint . ...`: 0 errors, 778 legacy warnings (mostly `any` and unused symbols) |
| End-to-end browser tests | NOT RUN | No configured browser E2E suite was available |
| Production build | PASS | `npm run build`: admin, API, and web completed |
| Production dependency scan | PASS | `npm audit --audit-level=high`: 0 vulnerabilities |
| Runtime dependency scan | PASS | `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities |
| Secret scanning | NOT RUN | No repository secret-scanning tool configured; values were not printed |
| SAST | NOT RUN | No compatible SAST command configured |
| Database migration state | PASS | Existing objects were verified against both migration SQL files; Prisma migration ledger reconciled with `migrate resolve --applied`; `prisma migrate status` reports schema up to date |
| Production startup/smoke test | PASS | Production build launched with controlled local integration values; `/healthz` returned HTTP 200 |
| Backup/restore test | NOT RUN | Requires controlled database backup resources |

Build output included existing bundle-size warnings and Zod package annotation warnings; they did not fail the build.

## F. Cleanup summary

No production data, migrations, uploads, private documents, or user-generated content were deleted. No obsolete source file was removed during this audit. The only deliberate comment cleanup was removal of stale server reload/verification notes. Dependency upgrades changed the lockfile and package manifests as described above.

## G. Remaining risks

1. ESLint has no errors but 778 legacy warnings and should be remediated incrementally, starting with security-sensitive API and shared validation files.
2. No real browser E2E test was executed; the production-mode local startup smoke test passed.
3. Render requires the listed secret values and a persistent storage strategy; local storage on an ephemeral service is not sufficient for durable uploads.
4. Existing legacy admission files under older public storage locations need a controlled migration or deletion plan after confirming backups.
5. Database backup restoration, migration rollback, storage policy verification, Razorpay webhook delivery, and reCAPTCHA scoring were not tested.
6. Background audit writes can race with test teardown/database shutdown and emit a Prisma engine warning; this did not fail the suite but should be made lifecycle-aware.

## H. Deployment checklist

1. Set production `DATABASE_URL`, `DIRECT_URL`, JWT secrets, cookie secret, explicit `CORS_ORIGIN`, reCAPTCHA secret, Razorpay credentials/webhook secret, and a non-default admin password.
2. Configure persistent disk or S3-compatible storage; do not rely on ephemeral local storage for uploads or private admission documents.
3. Confirm Prisma migration status is up to date against the deployment database and verify rollback procedures.
4. Migrate or quarantine legacy admission media from public upload paths; confirm `/uploads/admissions/*` returns 404.
5. Build with `npm ci && npm run build`, start the API with the migration command, and verify `/healthz`, public pages, admin login, protected admission PDF access, upload limits, and logout.
6. Verify browser CSP, reCAPTCHA, Razorpay webhook signatures, storage permissions, and PDF rendering in the deployed origin.
7. Monitor authentication failures, authorization denials, upload rejection rates, error rates, worker failures, disk usage, and database connection health.
8. Keep the previous build and database backup available for rollback; do not roll back migrations destructively without the reviewed plan.

## I. Final recommendation

**READY AFTER SPECIFIC ACTIONS.**

The critical admission document exposure and token/session issues identified in the verified scope were fixed. API tests, TypeScript checks, production build, production startup smoke test, dependency audits, and migration-state verification pass. Before release, complete browser E2E checks, configure persistent production storage/secrets, and perform the deployment-specific backup/restore and third-party integration smoke tests.
