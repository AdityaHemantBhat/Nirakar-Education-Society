/**
 * The console's settings, as the admin app sees them.
 */
export interface ConsoleSettings {
  /** The path the sign-in page lives at, without a leading slash. */
  adminLoginPath: string;
  /** How long a sign-in session lasts, in hours. */
  sessionLengthHours: number;
  /** How long the activity log is kept, in days. */
  auditRetentionDays: number;
  /** Whether a new sign-in is recorded in the log. */
  logSignIns: boolean;
  /** Whether the console shows the current administrator's email address. */
  showAccountEmail: boolean;
}

/** The settings as they are before anything has been changed. */
export const DEFAULT_CONSOLE_SETTINGS: ConsoleSettings = {
  adminLoginPath: 'login',
  sessionLengthHours: 24,
  auditRetentionDays: 365,
  logSignIns: true,
  showAccountEmail: false,
};

/** An entry in the activity log. */
export interface AuditEntry {
  id: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  user?: { username: string; email?: string | null; role?: string | null } | null;
}

export interface AuditListResponse {
  items: AuditEntry[];
  total: number;
  page: number;
  limit: number;
}

export interface AuditFacets {
  actions: Array<{ value: string; count: number }>;
  entities: Array<{ value: string; count: number }>;
  authors: Array<{ id: string; username: string; email?: string | null; count: number }>;
}

/** The action, turned into a sentence an administrator can read. */
export const describeAction = (action: string): string => {
  switch (action) {
    case 'CREATE':
      return 'Created';
    case 'UPDATE':
      return 'Edited';
    case 'DELETE':
      return 'Deleted';
    case 'PUBLISH':
      return 'Published';
    case 'WITHDRAW':
      return 'Withdrawn';
    case 'LOGIN':
      return 'Signed in';
    case 'LOGOUT':
      return 'Signed out';
    case 'UPLOAD':
      return 'Uploaded';
    case 'EXPORT':
      return 'Exported';
    case 'SETTINGS':
      return 'Changed settings';
    case 'PASSWORD':
      return 'Changed password';
    default:
      return action
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/^\w/, (c) => c.toUpperCase());
  }
};

/** A colour for each kind of action, so the log can be scanned quickly. */
export const actionTone = (action: string): string => {
  switch (action) {
    case 'DELETE':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'CREATE':
    case 'UPLOAD':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'PUBLISH':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'WITHDRAW':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'PASSWORD':
    case 'SETTINGS':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'LOGIN':
      return 'bg-stone-100 text-stone-600 border-stone-200';
    default:
      return 'bg-stone-100 text-stone-600 border-stone-200';
  }
};

/** The summary an entry carries, if it has one. */
export const entrySummary = (entry: AuditEntry): string => {
  const details = entry.details as Record<string, unknown> | null | undefined;
  const summary = details?.summary;
  if (typeof summary === 'string' && summary.length > 0) return summary;

  return `${describeAction(entry.action)} ${entry.entity}`;
};

/** The moment an entry was written, in a readable form. */
export const formatAuditDate = (iso: string): string => {
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  if (sameDay) {
    return `Today at ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  }

  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
