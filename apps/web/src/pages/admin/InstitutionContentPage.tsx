import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Camera, ImageUp, Loader2, Plus, Save, Trash2, Upload, Users } from 'lucide-react';
import { AdminSelect, CAMPUS_OPTIONS } from '../components/AdminSelect.js';
import { fetchWithAdminSession } from '../lib/admissions.js';

type Member = { id?: string; name: string; designation: string; role: string; photoUrl?: string | null; order: number };
type Committee = { id?: string; name: string; slug: string; description?: string | null; order: number; members: Member[] };
type Institution = { id: string; code: string; name: string; slug: string; tagline: string; history?: string | null; vision?: string | null; bannerUrl?: string | null; profile?: Record<string, any>; committees: Committee[] };

type ApiPayload<T> = { data?: T; error?: { message?: string; details?: Array<{ path?: string; message?: string }> } };

async function readApiResponse<T>(response: Response, operation: string): Promise<T> {
  const payload = await response.json().catch(() => null) as ApiPayload<T> | null;
  if (!response.ok) {
    const details = payload?.error?.details?.map((item) => [item.path, item.message].filter(Boolean).join(': ')).filter(Boolean).join('; ');
    throw new Error([`${operation} failed (HTTP ${response.status})`, payload?.error?.message, details].filter(Boolean).join(' — '));
  }
  if (!payload || !('data' in payload)) throw new Error(`${operation} failed: the API returned no data.`);
  return payload.data as T;
}

const profileFields = [
  ['commitments', 'Commitments'],
  ['infrastructure', 'Infrastructure (one item per line)'],
  ['rules', 'Rules & regulations (one item per line)'],
  ['admissions', 'Admission policy (one item per line)'],
  ['courses', 'Courses of study (one item per line)'],
  ['activities', 'Key features & activities (one item per line)'],
] as const;

export const InstitutionContentPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState<Institution | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const { data: institutions = [], isLoading, isError, error, refetch } = useQuery<Institution[]>({
    queryKey: ['adminInstitutionContent'],
    queryFn: async () => {
      const response = await fetchWithAdminSession('/api/v1/content/admin/institutions');
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error?.message || `Could not load institution content (${response.status})`);
      if (!Array.isArray(payload?.data)) throw new Error('The API returned an invalid institution list.');
      return payload.data as Institution[];
    },
  });

  useEffect(() => {
    if (!selectedId && institutions.length) setSelectedId(institutions[0].id);
  }, [institutions, selectedId]);
  const selected = useMemo(() => institutions.find((item) => item.id === selectedId), [institutions, selectedId]);
  useEffect(() => {
    setDraft(selected ? { ...selected, profile: selected.profile || {}, committees: selected.committees || [] } : null);
    setMessage('');
  }, [selected]);

  const uploadBanner = async (file?: File) => {
    if (!file || !draft) return;
    setMessage('');
    if (!file.type.startsWith('image/')) {
      setMessage('Choose an image file to upload.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setMessage('Banner image must be smaller than 50 MB.');
      return;
    }

    const institutionId = draft.id;
    setBannerUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', `${draft.name} banner`);
      const response = await fetchWithAdminSession('/api/v1/content/media/upload', {
        method: 'POST',
        body: formData,
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error?.message || `Banner upload failed (${response.status})`);
      const url = payload?.data?.url || (payload?.data?.filename ? `/uploads/${payload.data.filename}` : '');
      if (!url) throw new Error('The upload completed but did not return an image URL.');
      setDraft((current) => current?.id === institutionId ? { ...current, bannerUrl: url } : current);
      setMessage('Banner uploaded and optimized. Save the school profile to publish it.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Banner upload failed. Please try again.');
    } finally {
      setBannerUploading(false);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  const [uploadingMemberKey, setUploadingMemberKey] = useState<string | null>(null);

  const uploadMemberPhoto = async (committeeId: string | undefined, memberIndex: number, file?: File) => {
    if (!file || !draft) return;
    const resolvedCommitteeId = committeeId || 'draft-committee';
    setMessage('');
    if (!file.type.startsWith('image/')) {
      setMessage('Please choose an image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setMessage('Photo file size must be less than 25 MB.');
      return;
    }

    const currentCommittee = draft.committees.find((c) => c.id === committeeId);
    const targetMember = currentCommittee?.members?.[memberIndex];

    const memberKey = `${resolvedCommitteeId}-${memberIndex}`;
    setUploadingMemberKey(memberKey);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', targetMember?.name ? `${targetMember.name} Photo` : 'Committee Member Photo');
      const response = await fetchWithAdminSession('/api/v1/content/media/upload', {
        method: 'POST',
        body: formData,
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error?.message || `Upload failed (${response.status})`);
      const url = payload?.data?.url || (payload?.data?.filename ? `/uploads/${payload.data.filename}` : '');
      if (!url) throw new Error('Upload completed without returning image URL.');

      // Update draft state
      updateCommittee(committeeId, (item) => ({
        ...item,
        members: item.members.map((entry, index) => (index === memberIndex ? { ...entry, photoUrl: url } : entry)),
      }));

      // If the member already exists in the database, automatically save directly so the user doesn't lose the photo!
      if (targetMember?.id && !targetMember.id.startsWith('new-')) {
        const updateRes = await fetchWithAdminSession(`/api/v1/content/admin/committee-members/${targetMember.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: targetMember.name,
            designation: targetMember.designation,
            role: targetMember.role,
            photoUrl: url,
            order: targetMember.order ?? memberIndex,
          }),
        });
        await readApiResponse<Member>(updateRes, `Saving member photo`);
        await queryClient.invalidateQueries({ queryKey: ['adminInstitutionContent'] });
        await queryClient.invalidateQueries({ queryKey: ['institution', draft.slug] });
        setMessage(`Photo saved directly for ${targetMember.name || 'member'}! It is now live.`);
      } else {
        setMessage('Member photo uploaded! Click "Save committee" below to confirm changes.');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not upload member photo.');
    } finally {
      setUploadingMemberKey(null);
    }
  };

  const saveProfile = async () => {
    if (!draft) return;
    setBusy(true); setMessage('');
    try {
      const response = await fetchWithAdminSession(`/api/v1/content/admin/institutions/${draft.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagline: draft.tagline, history: draft.history || '', vision: draft.vision || '', bannerUrl: draft.bannerUrl || '', profile: draft.profile || {} }),
      });
      const savedInstitution = await readApiResponse<Institution>(response, `Saving ${draft.name} profile`);
      queryClient.setQueryData<Institution[]>(['adminInstitutionContent'], (current) => current?.map((item) => item.id === draft.id ? { ...item, ...savedInstitution } : item));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['adminInstitutionContent'] }),
        queryClient.invalidateQueries({ queryKey: ['institution', draft.slug] }),
      ]);
      setMessage('Institution profile saved.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save profile'); }
    finally { setBusy(false); }
  };

  const saveCommittee = async (committee: Committee) => {
    if (!draft) return;
    setBusy(true); setMessage('');
    try {
      const isNew = !committee.id || committee.id.startsWith('new-');
      const response = await fetchWithAdminSession(isNew
        ? `/api/v1/content/admin/institutions/${draft.id}/committees`
        : `/api/v1/content/admin/committees/${committee.id}`, {
        method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: committee.name, slug: committee.slug, description: committee.description || '', order: committee.order }),
      });
      const saved = await readApiResponse<Committee>(response, `Saving committee “${committee.name || 'untitled'}”`);
      const savedMemberIds: string[] = [];
      for (const [index, member] of committee.members.entries()) {
        const memberPayload = {
          name: member.name?.trim() || '',
          designation: member.designation?.trim() || '',
          role: member.role?.trim() || 'Member',
          photoUrl: member.photoUrl?.trim() || null,
          order: index,
        };
        const memberId = member.id && !member.id.startsWith('new-') ? member.id : undefined;
        const memberResponse = await fetchWithAdminSession(memberId
          ? `/api/v1/content/admin/committee-members/${memberId}`
          : `/api/v1/content/admin/committees/${saved.id}/members`, {
          method: memberId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(memberPayload),
        });
        const memberResult = await readApiResponse<Member>(memberResponse, `Saving member “${member.name || `#${index + 1}`}”`);
        savedMemberIds.push(memberResult.id || memberId || '');
      }
      const orderResponse = await fetchWithAdminSession(`/api/v1/content/admin/committees/${saved.id}/member-order`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ memberIds: savedMemberIds }),
      });
      await readApiResponse<Member[]>(orderResponse, `Saving member order for “${committee.name || saved.name}”`);
      await queryClient.invalidateQueries({ queryKey: ['adminInstitutionContent'] });
      await queryClient.invalidateQueries({ queryKey: ['institution', draft.slug] });
      setMessage('Committee and members saved.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not save committee'); }
    finally { setBusy(false); }
  };

  const deleteCommittee = async (committee: Committee) => {
    if (!window.confirm(`Delete “${committee.name}” and all its members?`)) return;
    setBusy(true); setMessage('');
    try {
      const response = await fetchWithAdminSession(`/api/v1/content/admin/committees/${committee.id}`, { method: 'DELETE' });
      await readApiResponse<{ id: string }>(response, `Deleting committee “${committee.name}”`);
      await queryClient.invalidateQueries({ queryKey: ['adminInstitutionContent'] });
      await queryClient.invalidateQueries({ queryKey: ['institution', draft?.slug] });
      setMessage('Committee deleted.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not delete committee'); }
    finally { setBusy(false); }
  };

  const updateCommittee = (id: string | undefined, updater: (item: Committee) => Committee) => {
    setDraft((current) => current ? { ...current, committees: current.committees.map((item) => item.id === id ? updater(item) : item) } : current);
  };

  if (isLoading) return <p className="p-8 text-sm text-stone-500">Loading institution content…</p>;
  if (isError) return <div className="m-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"><p className="font-semibold">Could not load institution content.</p><p className="mt-1">{error instanceof Error ? error.message : 'Check the API connection and your administrator session.'}</p><button onClick={() => void refetch()} className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-1.5 font-semibold">Try again</button></div>;
  if (institutions.length === 0) return <div className="m-6 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"><p className="font-semibold">No institutions are configured in the connected database.</p><p className="mt-1">This page does not create institutions automatically. Confirm the API is connected to the intended database and that the three institution records exist before managing their content.</p></div>;

  const institutionSelectOptions = institutions.map((item) => ({
    value: item.id,
    label: CAMPUS_OPTIONS.find((option) => option.value === item.code)?.label || item.name,
  }));

  return <div className="w-full max-w-none space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-brand-700">School websites</p>
        <h1 className="mt-1 text-2xl font-bold text-stone-900">Institution Content</h1>
        <p className="mt-1 text-sm text-stone-500">Edit each school’s public profile and committee rosters.</p>
      </div>
      <div className="min-w-64">
        <AdminSelect
          label="Institution"
          value={selectedId}
          disabled={bannerUploading}
          onChange={(val) => setSelectedId(val)}
          options={institutionSelectOptions}
          icon={Building2}
          compact
        />
      </div>
    </div>
    {message && <p role="status" aria-live="polite" className={`rounded-xl border px-4 py-3 text-sm ${/saved|uploaded/i.test(message) ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>{message}</p>}
    {draft && <>
      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"><div className="mb-5 flex items-center gap-2"><Building2 size={18} className="text-brand-700"/><h2 className="font-bold">School profile</h2></div><div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-stone-700">Tagline<input value={draft.tagline} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"/></label>
        <div className="text-sm font-medium text-stone-700 md:col-span-2">
          <span>Banner image</span>
          <div className="mt-2 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
            <div>
              <label className="sr-only" htmlFor="institution-banner-url">Banner image URL</label>
              <input id="institution-banner-url" type="url" value={draft.bannerUrl || ''} onChange={(e) => setDraft({ ...draft, bannerUrl: e.target.value })} placeholder="Paste an image URL or upload a file" className="w-full rounded-lg border border-stone-300 px-3 py-2"/>
              <input ref={bannerInputRef} type="file" accept="image/*" className="sr-only" aria-label="Choose banner image from device" onChange={(event) => void uploadBanner(event.target.files?.[0])}/>
              <button type="button" disabled={bannerUploading || busy} onClick={() => bannerInputRef.current?.click()} className="mt-2 inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-stone-700 disabled:opacity-50">
                <ImageUp size={16}/>{bannerUploading ? 'Uploading and optimizing…' : 'Choose image from device'}
              </button>
              <p className="mt-1 text-xs text-stone-500">PNG, JPG, WebP and other image formats are optimized on upload. The resulting banner is saved when you save the school profile.</p>
            </div>
            {draft.bannerUrl && <img src={draft.bannerUrl} alt={`${draft.name} banner preview`} className="h-28 w-full rounded-lg border border-stone-200 bg-stone-100 object-cover sm:w-48"/>}
          </div>
        </div>
        <label className="text-sm font-medium text-stone-700 md:col-span-2">History<textarea rows={5} value={draft.history || ''} onChange={(e) => setDraft({ ...draft, history: e.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"/></label>
        <label className="text-sm font-medium text-stone-700 md:col-span-2">Vision<textarea rows={3} value={draft.vision || ''} onChange={(e) => setDraft({ ...draft, vision: e.target.value })} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"/></label>
        {profileFields.map(([key, label]) => <label key={key} className="text-sm font-medium text-stone-700 md:col-span-2">{label}<textarea rows={key === 'commitments' ? 6 : 5} value={Array.isArray(draft.profile?.[key]) ? draft.profile?.[key].join('\n') : draft.profile?.[key] || ''} onChange={(e) => setDraft({ ...draft, profile: { ...draft.profile, [key]: key === 'commitments' ? e.target.value : e.target.value.split('\n').map((item) => item.trim()).filter(Boolean) } })} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" placeholder={key === 'commitments' ? 'Write the school commitment and values…' : 'One entry per line…'}/></label>)}
      </div><div className="mt-5 flex flex-wrap items-center gap-3"><button type="button" disabled={busy || bannerUploading} onClick={() => void saveProfile()} className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Save size={16}/>{busy ? 'Saving profile…' : 'Save school profile'}</button></div></section>

      <section className="space-y-4"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Users size={18} className="text-brand-700"/><h2 className="font-bold text-stone-900">Committees</h2></div><button disabled={busy} onClick={() => setDraft({ ...draft, committees: [...draft.committees, { id: `new-${Date.now()}`, name: '', slug: '', description: '', order: draft.committees.length, members: [] }] })} className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-semibold"><Plus size={15}/>Add committee</button></div>
        {draft.committees.length === 0 && <p className="rounded-xl bg-white p-5 text-sm text-stone-500">No committees yet. Add a committee and its members here.</p>}
        {draft.committees.map((committee, committeeIndex) => <article key={committee.id || `new-${committeeIndex}`} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"><div className="grid gap-3 md:grid-cols-2"><label className="text-xs font-semibold text-stone-600">Committee name<input value={committee.name} onChange={(e) => updateCommittee(committee.id, (item) => ({ ...item, name: e.target.value, slug: item.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"/></label><label className="text-xs font-semibold text-stone-600">Slug<input value={committee.slug} onChange={(e) => updateCommittee(committee.id, (item) => ({ ...item, slug: e.target.value }))} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"/></label><label className="text-xs font-semibold text-stone-600 md:col-span-2">Description<input value={committee.description || ''} onChange={(e) => updateCommittee(committee.id, (item) => ({ ...item, description: e.target.value }))} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"/></label></div>
          <div className="mt-5 flex items-center justify-between"><h3 className="text-sm font-bold">Members</h3><button onClick={() => updateCommittee(committee.id, (item) => ({ ...item, members: [...item.members, { name: '', designation: '', role: 'Member', order: item.members.length }] }))} className="text-xs font-bold text-brand-700">+ Add member</button></div>
          <div className="mt-3 space-y-3">{committee.members.map((member, memberIndex) => {
            const memberKey = `${committee.id}-${memberIndex}`;
            const isUploadingThis = uploadingMemberKey === memberKey;
            return (
              <div key={member.id || memberIndex} className="grid gap-2.5 rounded-xl border border-stone-200 bg-stone-50 p-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.4fr_auto] items-center">
                <input
                  aria-label="Member name"
                  placeholder="Name"
                  value={member.name}
                  onChange={(e) => updateCommittee(committee.id, (item) => ({ ...item, members: item.members.map((entry, index) => index === memberIndex ? { ...entry, name: e.target.value } : entry) }))}
                  className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
                />
                <input
                  aria-label="Designation"
                  placeholder="Designation"
                  value={member.designation}
                  onChange={(e) => updateCommittee(committee.id, (item) => ({ ...item, members: item.members.map((entry, index) => index === memberIndex ? { ...entry, designation: e.target.value } : entry) }))}
                  className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
                />
                <input
                  aria-label="Role"
                  placeholder="Role"
                  value={member.role}
                  onChange={(e) => updateCommittee(committee.id, (item) => ({ ...item, members: item.members.map((entry, index) => index === memberIndex ? { ...entry, role: e.target.value } : entry) }))}
                  className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm"
                />

                {/* Photo Upload from device / mobile */}
                <div className="flex items-center gap-2">
                  <label className="relative flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      disabled={busy || isUploadingThis}
                      onChange={(e) => void uploadMemberPhoto(committee.id, memberIndex, e.target.files?.[0])}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-700 hover:border-brand-600 hover:bg-stone-50 transition">
                      {isUploadingThis ? (
                        <>
                          <Loader2 size={14} className="animate-spin text-brand-700" />
                          <span>Uploading…</span>
                        </>
                      ) : (
                        <>
                          <Camera size={14} className="text-stone-500" />
                          <span className="truncate">{member.photoUrl ? 'Change photo' : 'Upload photo'}</span>
                        </>
                      )}
                    </div>
                  </label>

                  {member.photoUrl ? (
                    <div className="relative group shrink-0">
                      <img
                        src={member.photoUrl}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover border border-stone-300 shadow-2xs"
                      />
                      <button
                        type="button"
                        title="Remove photo"
                        onClick={() => updateCommittee(committee.id, (item) => ({
                          ...item,
                          members: item.members.map((entry, index) => index === memberIndex ? { ...entry, photoUrl: '' } : entry),
                        }))}
                        className="absolute -top-1 -right-1 hidden group-hover:flex h-4 w-4 rounded-full bg-rose-600 text-white items-center justify-center text-[10px]"
                      >
                        ×
                      </button>
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  aria-label={`Remove ${member.name || 'member'}`}
                  onClick={() => {
                    if (member.id && !window.confirm(`Remove ${member.name} from this committee?`)) return;
                    if (!member.id) {
                      updateCommittee(committee.id, (item) => ({ ...item, members: item.members.filter((_, index) => index !== memberIndex) }));
                      return;
                    }
                    void (async () => {
                      setBusy(true); setMessage('');
                      try {
                        const response = await fetchWithAdminSession(`/api/v1/content/admin/committee-members/${member.id}`, { method: 'DELETE' });
                        await readApiResponse<{ id: string }>(response, `Removing committee member “${member.name}”`);
                        await queryClient.invalidateQueries({ queryKey: ['adminInstitutionContent'] });
                        await queryClient.invalidateQueries({ queryKey: ['institution', draft?.slug] });
                        setMessage('Committee member removed.');
                      } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not remove member'); }
                      finally { setBusy(false); }
                    })();
                  }}
                  disabled={busy}
                  className="inline-flex items-center justify-center rounded-lg p-2 text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}</div>
          <div className="mt-4 flex justify-between"><button disabled={!committee.id || busy} onClick={() => void deleteCommittee(committee)} className="inline-flex items-center gap-1 text-sm font-semibold text-red-700 disabled:opacity-40"><Trash2 size={15}/>Delete</button><button disabled={busy} onClick={() => void saveCommittee(committee)} className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><Save size={15}/>Save committee</button></div>
        </article>)}
      </section>
    </>}
  </div>;
};
