import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Search,
  ExternalLink,
  Layers,
  Clock,
  Check,
  Mail,
  Phone,
  GraduationCap,
  Edit3,
  GripVertical,
  Save,
} from 'lucide-react';
import { io } from 'socket.io-client';
import { socketOrigin } from '../lib/api.js';
import { getPublicSiteUrl } from '../lib/site.js';
import { fetchWithAdminSession } from '../lib/admissions.js';
import { AdminSelect } from '../components/AdminSelect.js';

const DEFAULT_DEPARTMENTS = [
  'Science & Laboratories',
  'Mathematics & Computer Science',
  'Languages & Literature',
  'Commerce & Economics',
  'Social Sciences & Humanities',
  'Vocational Studies & Ecology',
  'Athletics & Physical Education',
  'Administration & Governance',
];

export const FacultyManagerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'published' | 'departments'>('pending');
  const [search, setSearch] = useState('');
  const [campusFilter, setCampusFilter] = useState('ALL');
  const [newDeptName, setNewDeptName] = useState('');
  const [deptFeedback, setDeptFeedback] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Drag and drop state for published faculty
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [orderedFaculty, setOrderedFaculty] = useState<any[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // 1. Pending Faculty Applications from backend API
  const { data: pendingFaculty = [], refetch: refetchPending, isLoading: isPendingLoading } = useQuery({
    queryKey: ['admin_faculty_pending'],
    queryFn: async () => {
      try {
        const res = await fetchWithAdminSession('/api/v1/faculty/pending');
        if (!res.ok) throw new Error('Failed to fetch pending faculty');
        const json = await res.json();
        return json.data || [];
      } catch {
        try {
          return JSON.parse(localStorage.getItem('nirakar_pending_faculty_apps') || '[]');
        } catch {
          return [];
        }
      }
    },
  });

  // 2. Academic Departments from backend API
  const { data: departments = DEFAULT_DEPARTMENTS, refetch: refetchDepts } = useQuery({
    queryKey: ['admin_faculty_departments'],
    queryFn: async () => {
      try {
        const res = await fetchWithAdminSession('/api/v1/faculty/departments');
        if (!res.ok) throw new Error('Failed to fetch departments');
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
        return DEFAULT_DEPARTMENTS;
      } catch {
        try {
          const saved = localStorage.getItem('nirakar_departments');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          }
        } catch {}
        return DEFAULT_DEPARTMENTS;
      }
    },
  });

  // 3. Published Faculty Members from backend API
  const {
    data: apiFaculty = [],
    refetch: refetchPublished,
    isLoading: isPublishedLoading,
    isError: isPublishedError,
  } = useQuery({
    queryKey: ['admin_faculty_published'],
    queryFn: async () => {
      const res = await fetch('/api/v1/faculty');
      if (!res.ok) throw new Error('Failed to fetch published faculty.');
      const json = await res.json();
      if (!Array.isArray(json.data)) throw new Error('Invalid published faculty response.');
      return json.data;
    },
  });

  // 4. Fetch stored faculty order
  const { data: storedOrder = [] } = useQuery({
    queryKey: ['faculty_order'],
    queryFn: async () => {
      const res = await fetchWithAdminSession('/api/v1/faculty/admin/order');
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
  });

  // Published faculty comes only from the database API.
  const allFaculty = useMemo(() => {
    return apiFaculty.map((item: any) => {
      const toggles = item.publicContactToggles || {};
      const name =
        item.name ||
        toggles.name ||
        toggles.fullName ||
        (toggles.firstName && toggles.lastName ? `${toggles.firstName} ${toggles.lastName}` : '') ||
        (item.user?.username ? (item.user.username.charAt(0).toUpperCase() + item.user.username.slice(1)) : '') ||
        (toggles.email ? toggles.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : '') ||
        'Faculty Member';
      return { ...item, name };
    });
  }, [apiFaculty]);

  // Initialize ordered faculty based on stored order
  useEffect(() => {
    if (storedOrder.length > 0) {
      const ordered = storedOrder
        .map((id: string) => allFaculty.find((f: any) => f.id === id))
        .filter(Boolean);
      const unordered = allFaculty.filter((f: any) => !storedOrder.includes(f.id));
      setOrderedFaculty([...ordered, ...unordered]);
    } else {
      setOrderedFaculty(allFaculty);
    }
    setIsDirty(false);
  }, [allFaculty, storedOrder]);

  // Socket.IO listener for live updates
  useEffect(() => {
    const socket = io(socketOrigin(), {
      transports: ['websocket', 'polling'],
      reconnection: true,
      withCredentials: true,
    });
    socket.on('faculty:reordered', (data: { facultyIds: string[] }) => {
      setOrderedFaculty((current) => {
        const byId = new Map(current.map((faculty) => [faculty.id, faculty]));
        const reordered = data.facultyIds
          .map((id) => byId.get(id))
          .filter((faculty): faculty is (typeof current)[number] => Boolean(faculty));
        const includedIds = new Set(data.facultyIds);
        return [...reordered, ...current.filter((faculty) => !includedIds.has(faculty.id))];
      });
      queryClient.invalidateQueries({ queryKey: ['faculty_order'] });
      queryClient.invalidateQueries({ queryKey: ['admin_faculty_published'] });
      setSaveMessage('Faculty order updated by another admin');
      setTimeout(() => setSaveMessage(''), 3000);
    });
    return () => { socket.disconnect(); };
  }, [queryClient]);

  // Approve Faculty Member
  const handleApprove = async (appId: string) => {
    setActionLoadingId(appId);
    try {
      await fetchWithAdminSession(`/api/v1/faculty/admin/approve/${appId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId }),
      });
      try {
        const local = JSON.parse(localStorage.getItem('nirakar_pending_faculty_apps') || '[]');
        localStorage.setItem(
          'nirakar_pending_faculty_apps',
          JSON.stringify(local.filter((a: any) => a.id !== appId))
        );
      } catch {}
      await Promise.all([refetchPending(), refetchPublished()]);
      queryClient.invalidateQueries({ queryKey: ['admin_faculty_pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin_faculty_published'] });
    } catch (err) {
      console.error('Failed to approve faculty:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reject Faculty Member
  const handleReject = async (appId: string) => {
    setActionLoadingId(appId);
    try {
      await fetchWithAdminSession(`/api/v1/faculty/admin/reject/${appId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: appId }),
      });
      try {
        const local = JSON.parse(localStorage.getItem('nirakar_pending_faculty_apps') || '[]');
        localStorage.setItem(
          'nirakar_pending_faculty_apps',
          JSON.stringify(local.filter((a: any) => a.id !== appId))
        );
      } catch {}
      await refetchPending();
      queryClient.invalidateQueries({ queryKey: ['admin_faculty_pending'] });
    } catch (err) {
      console.error('Failed to reject faculty:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete Faculty Member
  const handleDeleteFaculty = async (id: string, name: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete ${name} from the faculty directory? This action cannot be undone.`);
    if (!confirmed) return;

    setActionLoadingId(id);
    try {
      const res = await fetchWithAdminSession(`/api/v1/faculty/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete faculty member');
      await Promise.all([refetchPending(), refetchPublished()]);
      queryClient.invalidateQueries({ queryKey: ['admin_faculty_published'] });
      queryClient.invalidateQueries({ queryKey: ['admin_faculty_pending'] });
    } catch (err: any) {
      alert(err.message || 'Error deleting faculty member');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Add Department
  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newDeptName.trim();
    if (!trimmed) return;
    if (departments.includes(trimmed)) {
      setDeptFeedback('This department already exists.');
      return;
    }

    const updated = [...departments, trimmed];
    try {
      await fetchWithAdminSession('/api/v1/faculty/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departments: updated }),
      });
      localStorage.setItem('nirakar_departments', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('nirakar_departments_updated', { detail: updated }));
      setNewDeptName('');
      setDeptFeedback(`Department "${trimmed}" added successfully.`);
      refetchDepts();
      setTimeout(() => setDeptFeedback(''), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  // Remove Department
  const handleRemoveDepartment = async (deptToRemove: string) => {
    const updated = departments.filter((d: string) => d !== deptToRemove);
    try {
      await fetchWithAdminSession('/api/v1/faculty/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ departments: updated }),
      });
      localStorage.setItem('nirakar_departments', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('nirakar_departments_updated', { detail: updated }));
      refetchDepts();
      setDeptFeedback(`Department "${deptToRemove}" removed.`);
      setTimeout(() => setDeptFeedback(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer!.effectAllowed = 'move';
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    setIsDirty(true);
    const draggedIndex = orderedFaculty.findIndex((f) => f.id === draggedId);
    const targetIndex = orderedFaculty.findIndex((f) => f.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;
    const newList = [...orderedFaculty];
    const [removed] = newList.splice(draggedIndex, 1);
    newList.splice(targetIndex, 0, removed);
    setOrderedFaculty(newList);
    setDraggedId(null);
  };

  const handleSaveOrder = async () => {
    setIsSaving(true);
    try {
      const res = await fetchWithAdminSession('/api/v1/faculty/admin/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facultyIds: orderedFaculty.map((f) => f.id) }),
      });
      if (!res.ok) throw new Error('Failed to save order');
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to save order');
      setSaveMessage('Faculty order saved successfully!');
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ['faculty_order'] });
      queryClient.invalidateQueries({ queryKey: ['admin_faculty_published'] });
      queryClient.invalidateQueries({ queryKey: ['faculty_published'] });
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err: any) {
      setSaveMessage('Error saving order: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetOrder = () => {
    setOrderedFaculty(allFaculty);
    setIsDirty(false);
    setSaveMessage('');
  };

  const getInstitutionLabel = (code: string) => {
    switch (code) {
      case 'NIRAKAR_HS':
        return 'Shri Nirakar Vidyalaya';
      case 'TUDAL_HS':
        return 'Tudal High School';
      case 'ANGLE_HSS':
        return 'S. S. Angle HSS';
      default:
        return code || 'Shri Nirakar Education Society';
    }
  };

  const getFacultyDisplayName = (fac: any) => {
    if (fac.name && fac.name.trim() && fac.name.trim().toLowerCase() !== 'faculty member') {
      return fac.name.trim();
    }
    const toggles = fac.publicContactToggles || {};
    if (toggles.name && toggles.name.trim()) return toggles.name.trim();
    if (toggles.fullName && toggles.fullName.trim()) return toggles.fullName.trim();
    if (toggles.firstName || toggles.lastName) {
      return `${toggles.firstName || ''} ${toggles.lastName || ''}`.trim();
    }
    if (fac.user?.username && fac.user.username.trim()) return fac.user.username.trim();
    if (fac.name && fac.name.trim()) return fac.name.trim();
    if (fac.designation) return fac.designation;
    return 'Faculty Member';
  };

  // Filter for published tab
  const filteredFaculty = useMemo(() => {
    return orderedFaculty
      .filter((f: any) =>
        campusFilter === 'ALL' ? true : f.institutionCode === campusFilter
      )
      .filter((f: any) => {
        const displayName = getFacultyDisplayName(f).toLowerCase();
        const department = (f.department || '').toLowerCase();
        return displayName.includes(search.toLowerCase()) || department.includes(search.toLowerCase());
      });
  }, [orderedFaculty, campusFilter, search]);

  return (
    <div className="space-y-6 font-sans w-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 flex items-center gap-2.5">
            <Users className="text-brand-700" size={28} />
            <span>Faculty Directory</span>
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Review pending registrations, manage departments, and view current teaching staff.
          </p>
        </div>
        <Link
          to="/faculty/add"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-700 text-white rounded-xl font-medium text-sm hover:bg-brand-800 transition-colors whitespace-nowrap"
        >
          <Plus size={18} />
          <span>Add Faculty</span>
        </Link>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">
              Pending Approvals
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-stone-900 mt-2">
            {pendingFaculty.length}
          </div>
          <p className="text-xs text-stone-400 mt-1">Awaiting administrative review</p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">
              Approved Faculty
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-stone-900 mt-2">
            {isPublishedLoading || isPublishedError ? '—' : allFaculty.length}
          </div>
          <p className="text-xs text-stone-400 mt-1">Across all 3 institutions</p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-800">
              Departments
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
              <Layers size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-stone-900 mt-2">
            {departments.length}
          </div>
          <p className="text-xs text-stone-400 mt-1">Active academic subjects & streams</p>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="inline-flex flex-wrap sm:flex-nowrap items-center gap-1.5 p-1.5 bg-stone-100 rounded-xl border border-stone-200/80">
        <button
          type="button"
          onClick={() => setActiveSubTab('pending')}
          className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'pending'
              ? 'bg-brand-700 text-white shadow-xs font-semibold'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
          }`}
        >
          <Clock size={14} />
          <span>Pending Approvals</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeSubTab === 'pending' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
            }`}
          >
            {pendingFaculty.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('published')}
          className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'published'
              ? 'bg-brand-700 text-white shadow-xs font-semibold'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
          }`}
        >
          <Users size={14} />
          <span>Faculty List</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeSubTab === 'published' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
            }`}
          >
            {isPublishedLoading || isPublishedError ? '—' : allFaculty.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('departments')}
          className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'departments'
              ? 'bg-brand-700 text-white shadow-xs font-semibold'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
          }`}
        >
          <Layers size={14} />
          <span>Departments</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              activeSubTab === 'departments' ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
            }`}
          >
            {departments.length}
          </span>
        </button>
      </div>

      {/* ==================== 1. PENDING APPROVALS TAB ==================== */}
      {activeSubTab === 'pending' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-7 space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="text-base sm:text-lg font-bold text-stone-900">
              Pending Faculty Applications
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Review new faculty registrations. Approving an application publishes their profile to the public website directory.
            </p>
          </div>

          {isPendingLoading ? (
            <div className="py-12 text-center text-xs text-stone-400">
              Loading pending faculty applications...
            </div>
          ) : pendingFaculty.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 size={36} className="mx-auto text-emerald-500" />
              <div className="font-semibold text-stone-800 text-sm">
                No pending applications
              </div>
              <p className="text-xs text-stone-400">
                All faculty registration requests have been approved or reviewed.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
              {pendingFaculty.map((app: any) => (
                <div
                  key={app.id}
                  className="rounded-2xl border border-stone-200/90 bg-stone-50/60 p-5 flex flex-col justify-between hover:border-stone-300 hover:shadow-xs transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100/90 text-amber-900 border border-amber-200/50">
                            {app.employeeCode || 'NES-FAC'}
                          </span>
                          <span className="text-xs font-medium text-stone-500">
                            {getInstitutionLabel(app.institutionCode)}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-stone-900 mt-1.5 leading-snug">
                          {app.name || (app.firstName && app.lastName ? `${app.firstName} ${app.lastName}` : 'Faculty Member')}
                        </h3>
                        <p className="text-xs text-amber-900 font-semibold mt-0.5">
                          {app.department || 'Academic Faculty'}
                        </p>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-amber-100/90 text-amber-900 border border-amber-200/60 text-[11px] font-bold tracking-tight shrink-0 shadow-2xs">
                        Pending Approval
                      </span>
                    </div>
                  </div>

                  <div className="my-4 flex-1 flex flex-col justify-between rounded-xl bg-white border border-stone-200/70 p-4 text-xs text-stone-600 shadow-2xs">
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-semibold text-stone-500 shrink-0">Qualification:</span>
                        <span className="text-stone-800 font-medium">{app.qualification || 'Not provided'}</span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-semibold text-stone-500 shrink-0">Experience:</span>
                        <span className="text-stone-800 font-medium">
                          {app.experience || `${app.experienceYears || 1} Years`}
                        </span>
                      </div>
                      {app.subjects && (Array.isArray(app.subjects) ? app.subjects.length > 0 : String(app.subjects).trim().length > 0) ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-stone-500 shrink-0">Subjects:</span>
                          <span className="text-stone-800 font-medium">
                            {Array.isArray(app.subjects) ? app.subjects.join(', ') : app.subjects}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    {(app.email || app.phone) && (
                      <div className="flex flex-wrap items-center gap-3 pt-3 mt-3 border-t border-stone-100 text-[11px] text-stone-500 font-mono">
                        {app.email && (
                          <span className="flex items-center gap-1.5 truncate">
                            <Mail size={12} className="text-stone-400 shrink-0" />
                            <span className="truncate">{app.email}</span>
                          </span>
                        )}
                        {app.phone && (
                          <span className="flex items-center gap-1.5 shrink-0">
                            <Phone size={12} className="text-stone-400 shrink-0" />
                            <span>{app.phone}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-auto flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      disabled={actionLoadingId === app.id}
                      onClick={() => handleApprove(app.id)}
                      className="flex-1 h-10 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                    >
                      <Check size={15} />
                      <span>{actionLoadingId === app.id ? 'Approving...' : 'Approve & Publish'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={actionLoadingId === app.id}
                      onClick={() => handleReject(app.id)}
                      className="h-10 py-2 px-4 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <XCircle size={15} />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== 2. FACULTY LIST TAB WITH DRAG & DROP ==================== */}
      {activeSubTab === 'published' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
                <GripVertical size={18} className="text-brand-700" />
                Faculty Members
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Drag to rearrange faculty order. Changes sync instantly across all admins.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="w-full sm:w-52">
                <AdminSelect
                  value={campusFilter}
                  onChange={setCampusFilter}
                  options={[
                    { value: 'ALL', label: 'All Schools' },
                    { value: 'NIRAKAR_HS', label: 'Shri Nirakar Vidyalaya' },
                    { value: 'TUDAL_HS', label: 'Tudal High School' },
                    { value: 'ANGLE_HSS', label: 'S. S. Angle HSS' },
                  ]}
                  compact
                />
              </div>

              <div className="relative flex-1 sm:w-60">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search faculty..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-stone-200 text-xs focus:outline-none bg-stone-50 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
              saveMessage.includes('Error')
                ? 'bg-rose-50 border border-rose-200 text-rose-800'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            }`}>
              <Check size={14} />
              {saveMessage}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 w-6"></th>
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">School</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {isPublishedLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-500">Loading faculty records...</td>
                  </tr>
                ) : isPublishedError ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-rose-700">
                      Unable to load faculty records. Please refresh and try again.
                      <button
                        type="button"
                        onClick={() => void refetchPublished()}
                        className="ml-2 font-semibold underline"
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                ) : filteredFaculty.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-500">
                      {allFaculty.length === 0 ? 'No published faculty records.' : 'No faculty match your filters.'}
                    </td>
                  </tr>
                ) : null}
                {filteredFaculty.map((fac: any) => {
                  const displayName = getFacultyDisplayName(fac);
                  const initial = displayName.charAt(0).toUpperCase() || 'F';
                  return (
                    <tr
                      key={fac.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, fac.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, fac.id)}
                      className={`transition-all cursor-grab active:cursor-grabbing ${
                        draggedId === fac.id
                          ? 'bg-brand-100 opacity-50'
                          : 'hover:bg-stone-50/70'
                      }`}
                    >
                      <td className="py-3 px-4 text-stone-400">
                        <GripVertical size={14} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0">
                            {initial}
                          </div>
                          <div>
                            <div className="font-bold text-stone-900 text-sm leading-tight">
                              {displayName}
                            </div>
                            <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                              {fac.designation || 'Faculty Member'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-stone-600 text-xs">
                        {getInstitutionLabel(fac.institutionCode)}
                      </td>
                      <td className="py-3 px-4 text-amber-900 font-semibold text-xs">
                        {fac.department}
                      </td>
                      <td className="py-3 px-4 text-stone-600 text-xs">
                        {fac.experience || `${fac.experienceYears || 1} Years`}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                          Active
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`${getPublicSiteUrl()}/faculty/edit/${fac.id}?role=admin`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                            title="Edit profile"
                          >
                            <Edit3 size={12} />
                            Edit
                          </a>

                          <a
                            href={`${getPublicSiteUrl()}/faculty/${fac.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                            title="View profile"
                          >
                            View
                            <ExternalLink size={12} />
                          </a>

                          <button
                            type="button"
                            disabled={actionLoadingId === fac.id}
                            onClick={() => handleDeleteFaculty(fac.id, displayName)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Save/Reset Buttons */}
          {isDirty && (
            <div className="flex gap-3 sticky bottom-0 bg-gradient-to-t from-white to-white/80 py-4 border-t border-stone-200 backdrop-blur-sm">
              <button
                onClick={handleSaveOrder}
                disabled={isSaving}
                className="flex-1 px-4 py-3 bg-brand-700 text-white font-bold text-sm rounded-lg hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Order'}
              </button>
              <button
                onClick={handleResetOrder}
                disabled={isSaving}
                className="px-4 py-3 bg-stone-100 text-stone-700 font-bold text-sm rounded-lg hover:bg-stone-200 disabled:opacity-50 transition-colors"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================== 3. DEPARTMENTS TAB ==================== */}
      {activeSubTab === 'departments' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 sm:p-7 space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
              <Layers size={18} className="text-brand-700" />
              <span>Academic Departments</span>
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Add or remove departments available for faculty during registration and directory filtering.
            </p>
          </div>

          {deptFeedback && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2">
              <Check size={14} className="text-emerald-600 shrink-0" />
              <span>{deptFeedback}</span>
            </div>
          )}

          <form onSubmit={handleAddDepartment} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              placeholder="e.g., Computer Science & IT, Fine Arts & Music..."
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-lg bg-stone-50 border border-stone-200 text-stone-900 focus:bg-white focus:border-brand-700 outline-none text-xs transition-all"
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-brand-700 hover:bg-brand-800 text-white font-medium text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
            >
              <Plus size={14} />
              <span>Add Department</span>
            </button>
          </form>

          <div className="space-y-3 pt-1">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
              Active Departments ({departments.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
              {departments.map((dept: string) => (
                <div
                  key={dept}
                  className="px-3.5 py-2.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-800 text-xs font-medium flex items-center justify-between gap-2 hover:bg-white transition-colors"
                >
                  <span className="truncate">{dept}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDepartment(dept)}
                    className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                    title={`Remove ${dept}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyManagerPage;

