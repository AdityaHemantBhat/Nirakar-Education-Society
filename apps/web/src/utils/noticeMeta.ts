/**
 * Helper utilities to encode and decode notice metadata (Reference Number & Urgent flag)
 * seamlessly without requiring breaking database schema changes.
 *
 * The rules live in the shared package, so the office console, the server
 * and this site all read and write the same header.
 */
export { decodeNoticeMeta, encodeNoticeMeta } from '@nirakar/shared';
export type { DecodedNoticeMeta } from '@nirakar/shared';
