/**
 * Helper utilities to encode and decode notice metadata (Reference Number & Urgent flag)
 * seamlessly without requiring breaking database schema changes.
 */

export interface DecodedNoticeMeta {
  content: string;
  refNo: string;
  urgent: boolean;
}

export function decodeNoticeMeta(rawContent: string | null | undefined): DecodedNoticeMeta {
  if (!rawContent) return { content: '', refNo: '', urgent: false };
  const match = rawContent.match(/^<!--NOTICE_META:(\{.*?\})-->\n?/);
  if (match) {
    try {
      const parsed = JSON.parse(match[1]);
      return {
        content: rawContent.slice(match[0].length),
        refNo: parsed.refNo || '',
        urgent: Boolean(parsed.urgent),
      };
    } catch {}
  }
  return { content: rawContent, refNo: '', urgent: false };
}

export function encodeNoticeMeta(body: string, meta: { refNo?: string; urgent?: boolean }): string {
  const cleanRef = meta.refNo ? meta.refNo.trim() : '';
  const isUrgent = Boolean(meta.urgent);
  if (!cleanRef && !isUrgent) {
    return body;
  }
  const header = `<!--NOTICE_META:${JSON.stringify({ refNo: cleanRef, urgent: isUrgent })}-->\n`;
  return header + (body || '');
}
