# DPDP Act and Rules — Phase 0 Audit

**Audit date:** 2026-10-24 (user-provided session date; verify system/runtime date before publication)  
**Scope:** Read-only review of repository code and checked-in configuration. No application/schema/config changes made for this audit.  
**Status:** Preliminary, code-based assessment only. This is not legal advice and does not establish that the organization is compliant.

## Executive summary

The site is a TypeScript monorepo with React/Vite public and admin applications, an Express API, Prisma/PostgreSQL, cookie/JWT authentication, local file storage by default, and a Render deployment definition. The code handles substantial personal data, including student and guardian records, a required Aadhaar number in the admission validator, family/profile information, visitor communications, account identifiers, payment/webhook data, IP addresses, user agents, and device identifiers.

No privacy notice, consent/preference-management workflow, data-principal rights workflow, retention/deletion schedule, breach-response feature, grievance/redressal pages, or processor register was identified in the reviewed source. These should be treated as **not evidenced / gaps**, not as proof that no operational policy exists outside the repository.

High-priority observations:

1. Admission code requires and stores student Aadhaar data, along with DOB, health-adjacent blood group, parent contacts, full address, photo/signature, and IP. Necessity, legal basis, access restrictions, encryption, and retention need immediate review.
2. `.env` contains database credentials and secret-looking values. Treat any real credentials in it as exposed and rotate them; do not copy the values into this document or logs. Confirm it is ignored and absent from source control/history.
3. `apps/api/src/config/index.ts` defines development defaults for database, JWT/cookie secrets, admin password, and Razorpay values. Confirm production requires explicit strong secrets and rejects fallback defaults.
4. Local uploads are served from `/uploads`; determine which admission PDFs/photos/signatures or other personal files are publicly reachable and move private records behind authorization.
5. The running database has been observed to lack `magazine_issue_reviews` and `academic_results` tables. This indicates schema/migration drift in at least the database currently used for development; reconcile with migration status before production use.
6. Official-source access was attempted but the MeitY page returned HTTP 403 and web search did not return usable official documents. Consequently this report does **not** claim to have verified the Rules' final text or commencement schedule. Obtain the official Gazette/MeitY publications before completing the clause-by-clause legal assessment.

## 1. Stack and data flow

| Area | Finding | Evidence |
|---|---|---|
| Workspace | TypeScript npm workspaces with apps and shared packages | `package.json:1-29` |
| Public/admin UI | React and Vite; Tailwind utilities and shared UI components | `apps/web/package.json`, `apps/admin/package.json`, `packages/ui/`, `apps/web/src/index.css`, `apps/admin/src/index.css` |
| API | Express application with Helmet, CORS, cookie parsing, body parsers, static uploads, audit middleware, REST routes | `apps/api/src/app.ts:14-142` |
| Database | PostgreSQL accessed through Prisma | `packages/db/prisma/schema.prisma:1-9` |
| Authentication | JWT access/refresh cookies; hashed refresh tokens; roles include SUPER_ADMIN, ADMIN, EDITOR, FACULTY, ALUMNI, READER | `apps/api/src/modules/auth/auth.controller.ts:12-33`; `packages/db/prisma/schema.prisma:15-93` |
| File storage | Local default, with local/S3/Cloudinary driver configuration; public `/uploads` static path and private path helper | `apps/api/src/config/index.ts:41-65`; `apps/api/src/app.ts:75-89` |
| Hosting | Render web service and managed PostgreSQL described in deployment configuration; actual region/settings not verified | `render.yaml:1-30`; `README.md:74-85` |
| Styling/branding | Existing navy/cream/gold theme, Manrope and Noto Sans Devanagari fonts, reusable Navbar/Footer and UI components | `apps/web/index.html:12-16`; `apps/web/src/index.css`; `packages/ui/src/components/CurvedNavbar.tsx`; `apps/web/src/components/Navbar.tsx`; `apps/web/src/components/Footer.tsx` |
| Third parties | Google reCAPTCHA, Google Maps embed configuration, Razorpay, Meta Graph API/Facebook integration; Google Fonts loaded externally | `apps/api/src/lib/recaptcha.ts`; `.env.example:37`; `apps/api/src/modules/access/`; `scripts/sync-facebook.ts:6-38`; `apps/web/index.html:12-16` |
| Mail/SMS | No confirmed mail/SMS notification provider identified in the reviewed code; verify operational integrations/environment/deployment | Repository search and API modules |
| Tests/build | npm workspace build and Vitest test commands exist; some API build errors and database/schema gaps were reported in prior tool output | root `package.json:10-21`; `apps/api/vitest.config.ts` |

## 2. Data inventory

Retention durations are not defined in reviewed code unless stated; `Not specified` means an organizational decision and deletion implementation must be established. “Child data” indicates likely/possible data about a person under 18, not a determination of legal status.

| Data item | Where collected | Purpose evidenced/inferred from code | Child data? | Stored where | Access evidenced | Retention | Third parties / sharing |
|---|---|---|---|---|---|---|---|
| Admission/student identity, DOB, gender, birthplace, nationality, language, category, blood group, Aadhaar | Public admissions form | Process an admission application | Yes, likely | `AdmissionApplication` in PostgreSQL; some data rendered in confirmation/PDF; uploaded files | Admission admins; public form response handling requires further verification | Not specified | Hosting/database provider; email/SMS or operational sharing unknown |
| Parent/guardian names, occupations, phones, email, address and prior-school details | Public admissions form | Admission contact and assessment | Yes, linked to child | PostgreSQL admission record and generated document | Admission admins | Not specified | Hosting/database provider; others unknown |
| Admission photo/signature, application PDF | Admissions upload/form flow | Identify applicant / produce application document | Yes, likely | Local uploads and database path/metadata; public exposure needs verification | Admin APIs; static `/uploads` may be public | Not specified | Hosting/storage provider; unknown |
| Contact name, email, phone, subject, message | Contact page | Respond to enquiry | Possible | `ContactMessage` table | Admin content/contact management; exact role review needed | Not specified | Hosting/database; notification provider unknown |
| Account email, username, password hash, role, refresh-token hash | Login/register | Authenticate and operate portals | Possible | `User`, `RefreshToken` tables | Authenticated user and authorized admin roles | Account lifetime/refresh expiry encoded; deletion schedule unspecified | Google reCAPTCHA; hosting/database |
| Alumni names, school, batch, photo, bio, city, occupation, social links, family-member information, gallery | Alumni registration/profile/community | Alumni directory/community and profile functions | Possible, family member age unknown | `AlumniProfile`, `FamilyMember`, posts/media | Public profile visibility settings and authenticated/admin views; verify per-field behavior | Not specified | Google Fonts, social destinations; hosting/storage |
| Faculty professional and contact profile data | Faculty registration/admin profile | Staff directory and portal | Usually adult; confirm | Faculty profile and media records | Public fields may be shown; faculty/admin access | Not specified | Hosting/storage; external links |
| Visitor/student names, phone, email, grade, messages and attachments | Faculty message widget | Route visitor questions to faculty | Yes, possible | `FacultyConversation`, `FacultyConversationMessage`, moderation hashes | Faculty/admin participants; attachment download controls require review | Not specified | Hosting/storage; message notification provider unknown |
| Comment author name, email, place, text | Public comments | Publish/moderate comments | Possible | `Comment` table | Public when approved; admin moderation | Not specified | Hosting/database |
| Library/magazine rating, comment, guest name, guest key or user ID | Reader pages | Review/ratings and live updates | Possible | Review tables | Public review listing; signed-in/guest record access | Not specified | Hosting/database; Socket.IO event metadata |
| Community posts and attached media | Alumni community | Social/community features | Possible | Post/PostMedia/Media tables and storage | Authenticated community and admin | Not specified | Storage provider; linked external content |
| Device identifier, user ID, item type/item ID, read timestamp | Reader access and review identity | Metered access/read tracking and guest review identity | Possible | `ReadEvent`; device IDs/indexes | API/admin analytics functions require detailed access review | Not specified | Hosting/database; first-party cookie/header |
| IP address, user agent, request path/action | API audit middleware/auth/admissions | Security, accountability, debugging | Possible | `AuditLog`, admissions row, application logs | Admin/audit functions; exact least privilege not established | Not specified | Hosting/log provider; no inventory available |
| Payment order/payment IDs, amount, method, status, signature, webhook JSON, receipt contact | Supporter pass/payment | Payment processing, reconciliation, receipts | Possible | Orders/Payments/WebhookEvent/Receipt tables | Payment/admin flows; role scope needs verification | Not specified | Razorpay; hosting/database |
| reCAPTCHA token/request metadata | Authentication and public submissions | Abuse/spam prevention | Possible | Verification request sent to Google; local token retention not confirmed | Google and API | Provider terms; local retention unknown | Google reCAPTCHA |
| Map visitor request data | Contact/campus page map link/embed config | Show campus location | No direct form, but visitor network metadata may be sent | Browser/provider; not shown in app DB | Google Maps when embed is loaded | Provider-defined | Google Maps |
| Social feed content and IDs | Facebook Graph sync | Display/import public organization social posts | Personal data may occur in public posts/images | `SocialItem`, sync state; DB/storage | Public site/admin sync | Not specified | Meta/Facebook Graph API |
| Images/fonts loaded from external origins | Public pages and remote URLs | Typography, display images/social content | Browser IP/device/request data may be disclosed | Third-party service logs; local persistence varies | External providers | Provider-defined | Google Fonts, possible Unsplash/social/video/map providers |

## 3. DPDP requirement gap analysis

**Important:** This matrix is preliminary. Official final Rules and commencement dates were not verifiable during this audit attempt; dates, prescribed periods, exemptions, and exact Rule obligations must be checked against official Gazette/MeitY texts before final legal mapping. Clause summaries below are based on the user-provided requirements and Act section references and require counsel validation.

| Requirement | Status | Repository evidence / gap |
|---|---|---|
| Sec. 5 notice at/before collection, itemised data/purpose, rights, withdrawal, Board complaint/contact; local languages | FAIL (not evidenced) | Contact form has fields/submission but no notice in inspected region: `apps/web/src/pages/ContactPage.tsx:154-230`; admissions collection is extensive: `apps/web/src/pages/AdmissionsPage.tsx:3220-3778`; no notice workflow identified. |
| Sec. 6 valid granular consent, affirmative action, versioned evidence and easy withdrawal | FAIL (not evidenced) | No consent-record models/workflow found in schema or inspected forms. `AdmissionApplication` has no consent metadata: `packages/db/prisma/schema.prisma:1040-1085`. |
| Sec. 7 documented legitimate-use basis | PARTIAL / not evidenced | Purpose is implicit in route/service names; no processing-basis register or documented lawful-use mapping found. |
| Sec. 9 children’s data and guardian verification/exemptions | FAIL / high risk | Admissions captures minor data and parent details; declaration is validated but does not evidence verified guardian consent: `apps/api/src/modules/admissions/admissions.validator.ts:17-75`; `apps/web/src/pages/AdmissionsPage.tsx:1765-1890`. No age/guardian verification workflow identified. |
| Secs. 11–14 access, correction, erasure, grievance, nomination | FAIL (not evidenced) | Auth `/me` exists, but no personal-data rights request routes/pages or nomination flow identified: `apps/api/src/modules/auth/auth.routes.ts:9-30`. |
| Purpose limitation/data minimisation | FAIL / PARTIAL | Admission validator requires 12-digit Aadhaar and schema stores it: `apps/api/src/modules/admissions/admissions.validator.ts:27-33`; `packages/db/prisma/schema.prisma:1054`. Necessity and alternatives need school/legal determination. |
| Sec. 8(7) retention/erasure and processor deletion | FAIL (not evidenced) | No retention schedule or automatic deletion job identified; personal data models generally have creation/update timestamps but no retention rules. |
| Sec. 8(5) safeguards | PARTIAL | Helmet, auth, rate limits and hashed refresh tokens exist: `apps/api/src/app.ts:14-142`, `apps/api/src/middleware/rate-limiter.ts`, `apps/api/src/modules/auth/auth.controller.ts:12-33`. Gaps/unknowns: encryption at rest, production HTTPS/HSTS behavior, CSRF strategy, file scanning/private uploads, DB least privilege, log retention. Development defaults are present: `apps/api/src/config/index.ts:31-40`. |
| Sec. 8(6) breach notice/response | FAIL (not evidenced) | No breach register, response plan, notifications workflow, or admin tool identified. |
| Sec. 8(2) processors/third parties and consent-gated optional loads | PARTIAL / not evidenced | reCAPTCHA, Razorpay, Google Maps/Fonts, and Meta integration exist; no processor register or DPA checklist found. Google Fonts load from CDN: `apps/web/index.html:12-16`. No consent-gated third-party loader identified in inspected source. |
| Sec. 8(10) grievance contact and response process | FAIL (not evidenced) | Contact page exists, but no named privacy/grievance responsible person or tracked workflow identified: `apps/web/src/pages/ContactPage.tsx`; unknown details must remain `[PLACEHOLDER]`. |
| Sec. 8(3) accuracy/completeness | PARTIAL | Profiles and admission admin APIs permit updates; no data-principal correction request workflow or completeness tracking identified. |
| Significant Data Fiduciary determination | UNKNOWN | No determination/notification evidence in repository; must be decided by the organization based on official criteria/notification. |
| Cross-border transfer/hosting region | UNKNOWN | Render/PostgreSQL configuration exists (`render.yaml:1-30`), but actual service/database region, backups, third-party transfer details, and contractual controls are not in repository. |
| Anonymous grievance/privacy-safe tracking | Not implemented | No grievance module or case tracking found. |
| Immutable access/edit/export/deletion audit for grievance cases | Not implemented | Generic audit log exists (`packages/db/prisma/schema.prisma:664-680`; `apps/api/src/middleware/audit.ts:58-85`), but no grievance-specific immutable record or view/export audit exists. |
| Sensitive safety/POSH/abuse restricted handling | Not implemented / needs counsel | No grievance classification/access system. Escalation and reporting must be designed with qualified counsel and applicable child-safety/POSH procedures; this audit offers no legal conclusion. |

## 4. Other verified implementation observations

- Public uploads: `apps/api/src/app.ts:75-89`; admission file privacy and direct URL reachability require runtime testing.
- Admission data model: `packages/db/prisma/schema.prisma:1040-1085`; Aadhaar is a plaintext `String` field in schema (no application-level encryption is evident in schema).
- Visitor messages include student/contact fields: `packages/db/prisma/schema.prisma:228-276`.
- Audit events contain IP/user-agent fields: `packages/db/prisma/schema.prisma:664-680` and `apps/api/src/lib/audit.ts:53-79`.
- Production deployment in `render.yaml` runs migrations at startup (`render.yaml:1-8`); assess operational migration safety before adding tables/columns.
- Current environment configuration defines fallback secrets/admin password (`apps/api/src/config/index.ts:31-40`). Do not use these defaults in production; verify fail-closed behavior and rotate real credentials if exposed.
- `.env` currently exists locally and includes credential-bearing values; this document intentionally does not reproduce them. Confirm ignore status, repository history, active status, and rotation.
- Recent development runtime reported missing `public.magazine_issue_reviews` and `public.academic_results` tables. Reconcile the development database against committed migrations. This report does not apply migrations.
- Working tree already contains extensive modifications and untracked files (including uploads/private-uploads). This audit did not alter or clean them.

## 5. Prioritised fix list

### P0 — before production/go-live
1. Have the school and qualified counsel determine whether Aadhaar is necessary and permitted for this admission purpose; remove it if unnecessary or redesign collection/storage with appropriate safeguards. Never include Aadhaar in public responses or URLs.
2. Confirm `.env` credentials are not committed or exposed; rotate any real database/API/payment/auth secrets and reject insecure production defaults.
3. Verify admissions PDFs, photos, signatures, and sensitive attachments are not publicly accessible; serve them only through authenticated, authorized downloads with safe storage controls.
4. Establish verified institutional privacy/grievance officer contact, hosting/backup regions, processors, and any cross-border transfers; do not publish placeholders as real facts.
5. Reconcile schema migrations and database state; take verified backups before migration deployment.

### P1 — privacy governance and user-facing rights
6. Confirm the official DPDP Act/Rules/commencement publications and prepare a counsel-reviewed requirement matrix, including transition timelines and education-related exemptions.
7. Approve a data inventory, purpose/lawful-basis register, child/guardian handling approach, retention schedule, processor register, and deletion responsibilities.
8. Implement point-of-collection privacy notices and separate, versioned consent where consent is the chosen basis; build withdrawal behavior that actually stops optional processing.
9. Build data-rights request/grievance intake, identity verification, tracking and response procedures using prescribed legal timelines only after official verification.
10. Add age-appropriate child/guardian safeguards and restricted workflows for student safety, abuse, and POSH-related complaints after counsel review.

### P2 — engineering safeguards and operations
11. Add scheduled deletion/anonymisation jobs and processor-erasure tracking; test them against backups and legal holds.
12. Add breach response plan/register and notification templates/workflow with official deadline verification.
13. Minimise or gate third-party requests (Google Fonts, Maps, reCAPTCHA, video embeds) and document provider agreements; avoid non-essential trackers.
14. Review audit/log content, access and retention; redact secrets and unnecessary personal data; define alerts and incident handling.
15. Add security/accessibility tests, dependency/security review, and data-flow regression checks for each form and admin role.

## 6. Facts requiring school/operations confirmation

- `[PLACEHOLDER: APPOINTED_DATA_PROTECTION_OR_GRIEVANCE_CONTACT_NAME_TITLE_EMAIL_PHONE_POSTAL_ADDRESS]`
- `[PLACEHOLDER: VERIFIED_SCHOOL_LEGAL_ENTITY_NAME_AND_CONTACT_ADDRESS]`
- `[PLACEHOLDER: PRODUCTION_HOSTING_DATABASE_FILE_STORAGE_AND_BACKUP_REGIONS]`
- `[PLACEHOLDER: PROCESSOR_REGISTER_AND_SIGNED_DPAs_FOR_HOSTING_RECAPTCHA_RAZORPAY_MAPS_FONTS_META_EMAIL_SMS]`
- `[PLACEHOLDER: ADMISSION_AADHAAR_NECESSITY_AND_AUTHORIZED_PURPOSE]`
- `[PLACEHOLDER: APPROVED_RETENTION_PERIODS_BY_DATA_CATEGORY_AND_LEGAL_HOLDS]`
- `[PLACEHOLDER: CHILD_OR_GUARDIAN_VERIFICATION_METHOD_AND_EDUCATIONAL_EXEMPTION_REVIEW]`
- `[PLACEHOLDER: WHETHER_SDF_STATUS_HAS_BEEN_ASSESSED_OR_NOTIFIED]`
- `[PLACEHOLDER: APPROVED_LANGUAGES_AND_TRANSLATION_REVIEW_OWNER]`
- `[PLACEHOLDER: BACKUP_RESTORE_AND_DELETION_PROPAGATION_PROCEDURE]`
- `[PLACEHOLDER: WHETHER_LOCAL_ENV_CREDENTIALS_ARE_ACTIVE_AND_ROTATION_STATUS]`
- `[PLACEHOLDER: PRODUCTION_STORAGE_PERSISTENCE_AND_PRIVATE_UPLOAD_REQUIREMENTS]`
- `[PLACEHOLDER: PAYMENT_AND_WEBHOOK_DATA_RETENTION_AND_ACCESS_POLICY]`
- `[PLACEHOLDER: OPERATIONAL_EMAIL_SMS_PROVIDER_AND_DATA_LOCATION]`
- `[PLACEHOLDER: ANALYTICS_AND_THIRD_PARTY_EMBED_INTENT_AND_CONSENT_POLICY]`

## 7. Official-source verification status

Official-source verification was attempted via the MeitY Data Protection Framework and candidate MeitY Rules PDF URLs, but MeitY returned HTTP 403 from this environment. The official eGazette portal landing page was reachable but did not expose the requested notification without an interactive Gazette search; search-engine queries did not yield verifiable official records. Therefore this audit deliberately does **not** state verified publication dates, notification numbers, final Rules wording, or commencement/transition dates. Before Phase 1 legal mapping, obtain and cross-check:

- Digital Personal Data Protection Act, 2023, official Gazette text.
- Digital Personal Data Protection Rules, 2025, official Gazette text and any corrigenda/amendments.
- Official commencement/transition notifications and any relevant SDF or exemption notifications.

Official portals attempted: [MeitY Data Protection Framework](https://www.meity.gov.in/data-protection-framework) (HTTP 403 in this environment) and [eGazette of India](https://egazette.gov.in/) (landing page reachable; notification search was not completed). Record exact Gazette links and citations in a revised audit once retrieved. Do not treat search snippets or unofficial summaries as authoritative.

## 8. Phase 0 limits

This is a repository inspection, not a full production data-flow audit. It cannot establish actual hosting region, backup retention, network behavior, processor contracts, runtime third-party requests, database contents, staff access practices, or legal applicability. No application code, schema, migration, or configuration was changed for Phase 0. Approval is required before Phase 1 design and implementation.