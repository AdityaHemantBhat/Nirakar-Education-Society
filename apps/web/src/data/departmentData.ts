/**
 * Department Registry for Shri Nirakar Education Society
 * Synchronized across Admin, Faculty Registration, and Faculty Dashboard
 */

export const DEFAULT_DEPARTMENTS: string[] = [
  'Science & Laboratories',
  'Mathematics & Computer Science',
  'Languages & Literature',
  'Commerce & Economics',
  'Social Sciences & Humanities',
  'Vocational Studies & Ecology',
  'Athletics & Physical Education',
  'Administration & Governance',
];

const STORAGE_KEY = 'nirakar_departments';

export function getDynamicDepartments(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('nirakar_dynamic_departments');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback to defaults
  }
  return DEFAULT_DEPARTMENTS;
}

export function saveDynamicDepartments(departments: string[]): void {
  try {
    const cleaned = departments.map((d) => d.trim()).filter(Boolean);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    window.dispatchEvent(new CustomEvent('nirakar_departments_updated', { detail: cleaned }));
  } catch (err) {
    console.error('Failed to save departments:', err);
  }
}

export function addDynamicDepartment(newDept: string): string[] {
  const current = getDynamicDepartments();
  const trimmed = newDept.trim();
  if (!trimmed || current.includes(trimmed)) return current;
  const updated = [...current, trimmed];
  saveDynamicDepartments(updated);
  return updated;
}

export function removeDynamicDepartment(deptToRemove: string): string[] {
  const current = getDynamicDepartments();
  const updated = current.filter((d) => d !== deptToRemove);
  saveDynamicDepartments(updated);
  return updated;
}

export async function fetchDepartmentsFromServer(): Promise<string[]> {
  try {
    const res = await fetch('/api/v1/faculty/departments');
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        saveDynamicDepartments(json.data);
        return json.data;
      }
    }
  } catch {}
  return getDynamicDepartments();
}
