import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, Building2, Download, Mail, MessageSquare, Paperclip, Phone, RefreshCw, Search, Send, ShieldCheck, UserRound, X } from 'lucide-react';

interface MessageAttachment {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
}

interface ConversationSummary {
  id: string;
  parentName: string;
  studentName: string | null;
  classGrade: string | null;
  lastMessageAt: string;
  unreadCount: number;
  lastMessage: { body: string; sender: 'VISITOR' | 'ADMIN' | 'FACULTY'; createdAt: string; attachments: MessageAttachment[] } | null;
  facultyProfile: {
    designation: string;
    department: string;
    institution: { name: string };
    user: { username: string } | null;
  };
}

interface Conversation extends ConversationSummary {
  phone: string | null;
  email: string | null;
  createdAt: string;
  moderation: {
    strikes: number;
    isBlocked: boolean;
    manuallyBlocked: boolean;
    blockedUntil: string | null;
  };
  messages: Array<{
    id: string;
    sender: 'VISITOR' | 'ADMIN' | 'FACULTY';
    body: string;
    readAt: string | null;
    createdAt: string;
    attachments: MessageAttachment[];
  }>;
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const isMultipart = init?.body instanceof FormData;
  const response = await fetch(path, {
    ...init,
    headers: isMultipart ? init?.headers : { 'Content-Type': 'application/json', ...init?.headers },
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error?.message || json.message || 'The request could not be completed.');
  }
  return json.data as T;
}

async function downloadAttachment(attachment: MessageAttachment) {
  const response = await fetch(`/api/v1/faculty-messages/attachments/${attachment.id}`, {
    credentials: 'same-origin',
  });
  if (!response.ok) {
    const json = await response.json().catch(() => null);
    throw new Error(json?.error?.message || 'Unable to download this attachment.');
  }
  const objectUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = attachment.originalName;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

const LocalImagePreview: React.FC<{ file: File }> = ({ file }) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return url ? (
    <img src={url} alt={`Preview of ${file.name}`} className="max-h-40 max-w-56 rounded-lg object-contain" />
  ) : null;
};

const RemoteImagePreview: React.FC<{ attachment: MessageAttachment }> = ({ attachment }) => {
  const [url, setUrl] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();
    let objectUrl = '';
    fetch(`/api/v1/faculty-messages/attachments/${attachment.id}`, {
      credentials: 'same-origin',
      signal: abortController.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error('Image preview unavailable');
        return response.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name !== 'AbortError') setFailed(true);
      });
    return () => {
      abortController.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachment.id]);

  if (failed) return <span className="block text-xs text-rose-500">Image preview unavailable</span>;
  if (!url) return <span className="block text-xs text-stone-400">Loading image preview…</span>;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="mt-2 block">
      <img src={url} alt={attachment.originalName} className="max-h-72 max-w-full rounded-xl border border-stone-200 object-contain" />
    </a>
  );
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value)
  );
}

function formatTimeInIst(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value)) + ' IST';
}

function getContactName(parentName: string, studentName: string | null) {
  const names = [parentName.trim(), studentName?.trim()].filter(
    (name): name is string => Boolean(name)
  );
  return [...new Set(names)].join(' ');
}

export const FacultyMessagesPage: React.FC<{ scope?: 'admin' | 'faculty' }> = ({ scope = 'admin' }) => {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [reply, setReply] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiScope = scope === 'faculty' ? 'faculty' : 'admin';

  const listQuery = useQuery({
    queryKey: ['facultyConversations', apiScope],
    queryFn: () => apiRequest<ConversationSummary[]>(`/api/v1/faculty-messages/${apiScope}`),
    refetchInterval: 30_000,
  });
  const conversations = listQuery.data || [];
  const visibleConversations = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return conversations;
    return conversations.filter((conversation) =>
      [
        conversation.parentName,
        conversation.studentName,
        conversation.facultyProfile.institution.name,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value))
    );
  }, [conversations, search]);

  const activeId = selectedId && visibleConversations.some((item) => item.id === selectedId)
    ? selectedId
    : visibleConversations[0]?.id || null;

  const detailQuery = useQuery({
    queryKey: ['facultyConversation', apiScope, activeId],
    queryFn: () => apiRequest<Conversation>(`/api/v1/faculty-messages/${apiScope}/${activeId}`),
    enabled: Boolean(activeId),
    refetchInterval: 15_000,
  });

  const markRead = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/v1/faculty-messages/${apiScope}/${id}/read`, { method: 'PATCH' }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['facultyConversations', apiScope] }),
        queryClient.invalidateQueries({
          queryKey: [scope === 'faculty' ? 'facultyOwnUnreadCount' : 'facultyConversationUnreadCount'],
        }),
        queryClient.invalidateQueries({ queryKey: ['facultyConversationUnreadCount'] }),
        queryClient.invalidateQueries({ queryKey: ['facultyConversation', apiScope, activeId] }),
      ]);
    },
  });

  useEffect(() => {
    if (detailQuery.data?.unreadCount) {
      markRead.mutate(detailQuery.data.id);
    }
  }, [detailQuery.data?.id, detailQuery.data?.unreadCount]);

  const sendReply = useMutation({
    mutationFn: ({ id, body, files }: { id: string; body: string; files: File[] }) => {
      const formData = new FormData();
      formData.append('body', body);
      files.forEach((file) => formData.append('attachments', file));
      return apiRequest(`/api/v1/faculty-messages/${apiScope}/${id}/messages`, {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: async () => {
      setReply('');
      setSelectedFiles([]);
      setAttachmentError('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['facultyConversations', apiScope] }),
        queryClient.invalidateQueries({
          queryKey: [scope === 'faculty' ? 'facultyOwnUnreadCount' : 'facultyConversationUnreadCount'],
        }),
        queryClient.invalidateQueries({ queryKey: ['facultyConversation', apiScope, activeId] }),
      ]);
    },
  });

  const visitorModeration = useMutation({
    mutationFn: ({ id, blocked }: { id: string; blocked: boolean }) =>
      apiRequest(`/api/v1/faculty-messages/admin/${id}/moderation`, {
        method: 'PATCH',
        body: JSON.stringify({ blocked }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['facultyConversation', 'admin', activeId] });
      await queryClient.invalidateQueries({ queryKey: ['facultyConversations', 'admin'] });
    },
  });

  const detail = detailQuery.data;
  const unreadTotal = conversations.reduce((sum, item) => sum + item.unreadCount, 0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [detail?.messages.length]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const body = reply.trim();
    if (!activeId || (!body && !selectedFiles.length) || sendReply.isPending) return;
    sendReply.mutate({ id: activeId, body, files: selectedFiles });
  };

  const handleFiles = (fileList: FileList | null) => {
    const files = Array.from(fileList || []);
    if (files.length > 5) {
      setAttachmentError('Choose no more than 5 files.');
      return;
    }
    if (files.some((file) => file.size > 10 * 1024 * 1024) ||
        files.reduce((total, file) => total + file.size, 0) > 25 * 1024 * 1024) {
      setAttachmentError('Each file must be 10 MB or smaller and all files together must be 25 MB or smaller.');
      return;
    }
    setAttachmentError('');
    setSelectedFiles(files);
  };

  return (
    <section className="faculty-messages-page space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
            {scope === 'faculty' ? 'Faculty portal' : 'Community support'}
          </p>
          <h1 className="mt-1 font-serif text-2xl font-bold text-stone-900">
            {scope === 'faculty' ? 'Parent & student messages' : 'Faculty messages'}
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {scope === 'faculty'
              ? 'Reply to inquiries sent to your faculty profile.'
              : 'Monitor and reply to parent and student inquiries.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-stone-700">
            {unreadTotal} unread
          </span>
          <button
            type="button"
            onClick={() => void listQuery.refetch()}
            disabled={listQuery.isFetching}
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-60"
          >
            <RefreshCw size={14} className={listQuery.isFetching ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid min-h-[620px] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-b border-stone-200 lg:border-b-0 lg:border-r">
          <div className="border-b border-stone-100 p-4">
            <label className="relative block">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search conversations"
                className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-brand-700 focus:bg-white"
              />
            </label>
          </div>

          <div className="max-h-[360px] overflow-y-auto lg:max-h-none lg:flex-1">
            {listQuery.isLoading ? (
              <p className="p-6 text-center text-sm text-stone-500">Loading conversations…</p>
            ) : listQuery.isError ? (
              <div role="alert" className="p-6 text-center text-sm text-rose-700">
                <p>{listQuery.error.message}</p>
                <button type="button" onClick={() => void listQuery.refetch()} className="mt-2 font-semibold underline">
                  Try again
                </button>
              </div>
            ) : visibleConversations.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <MessageSquare size={24} className="mx-auto text-stone-300" />
                <p className="mt-3 text-sm font-semibold text-stone-700">
                  {conversations.length ? 'No conversations match' : 'No messages yet'}
                </p>
                <p className="mt-1 text-xs text-stone-500">
                  New inquiries from faculty profiles will appear here.
                </p>
              </div>
            ) : (
              visibleConversations.map((conversation) => {
                const selected = activeId === conversation.id;
                return (
                  <button
                    type="button"
                    key={conversation.id}
                    onClick={() => setSelectedId(conversation.id)}
                    className={`w-full border-b border-stone-100 px-4 py-4 text-left transition ${
                      selected ? 'bg-amber-50/70' : 'hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-stone-900">
                          {getContactName(conversation.parentName, conversation.studentName)}
                        </p>
                        <p className="mt-1 truncate text-xs text-stone-500">
                          {conversation.classGrade ? `Class ${conversation.classGrade} · ` : ''}
                          {conversation.facultyProfile.institution.name}
                        </p>
                      </div>
                      {conversation.unreadCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-700 px-1.5 text-[10px] font-bold text-white">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 truncate text-xs text-stone-600">
                      {conversation.lastMessage?.sender !== 'VISITOR' ? 'Reply: ' : ''}
                      {conversation.lastMessage?.body || conversation.lastMessage?.attachments?.map((file) => file.originalName).join(', ') || 'No messages'}
                    </p>
                    <p className="mt-1 text-[10px] text-stone-400">
                      {formatTime(conversation.lastMessageAt)}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {!activeId ? (
          <div className="hidden items-center justify-center p-8 text-center lg:flex">
            <div>
              <MessageSquare size={30} className="mx-auto text-stone-300" />
              <p className="mt-3 text-sm font-semibold text-stone-700">Select a conversation</p>
              <p className="mt-1 text-xs text-stone-500">Messages and replies will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[420px] min-w-0 flex-col">
            {detailQuery.isLoading ? (
              <p className="p-8 text-sm text-stone-500">Loading conversation…</p>
            ) : detailQuery.isError ? (
              <p role="alert" className="p-8 text-sm text-rose-700">{detailQuery.error.message}</p>
            ) : detail ? (
              <>
                <header className="border-b border-stone-200 px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-base font-semibold text-stone-900">
                        {getContactName(detail.parentName, detail.studentName)}
                      </h2>
                      <p className="mt-1 text-xs text-stone-500">
                        {detail.classGrade ? `Class ${detail.classGrade} · ` : ''}
                        {detail.facultyProfile.institution.name}
                      </p>
                      <p className="mt-1 text-xs text-stone-400">
                        {detail.facultyProfile.designation} · {detail.facultyProfile.department}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-stone-600">
                      {detail.phone && (
                        <a href={`tel:${detail.phone}`} className="inline-flex items-center gap-1.5 hover:text-brand-700">
                          <Phone size={13} /> {detail.phone}
                        </a>
                      )}
                      {detail.email && (
                        <a href={`mailto:${detail.email}`} className="inline-flex items-center gap-1.5 hover:text-brand-700">
                          <Mail size={13} /> {detail.email}
                        </a>
                      )}
                    </div>
                  </div>
                  {scope === 'admin' && (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3">
                      <p className="text-xs text-stone-500">
                        {detail.moderation.isBlocked
                          ? detail.moderation.manuallyBlocked
                            ? 'This visitor is blocked by an administrator.'
                            : `Automatic block until ${detail.moderation.blockedUntil ? formatTimeInIst(detail.moderation.blockedUntil) : 'it expires'}.`
                          : `${detail.moderation.strikes} of 3 language warnings.`}
                      </p>
                      <button
                        type="button"
                        disabled={visitorModeration.isPending}
                        onClick={() => visitorModeration.mutate({ id: detail.id, blocked: !detail.moderation.isBlocked })}
                        className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                          detail.moderation.isBlocked
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                            : 'border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100'
                        }`}
                      >
                        {detail.moderation.isBlocked ? <ShieldCheck size={14} /> : <Ban size={14} />}
                        {detail.moderation.isBlocked ? 'Unblock visitor' : 'Block visitor'}
                      </button>
                    </div>
                  )}
                  {visitorModeration.isError && (
                    <p role="alert" className="mt-2 text-xs text-rose-700">{visitorModeration.error.message}</p>
                  )}
                </header>

                <div className="flex-1 space-y-4 overflow-y-auto bg-stone-50/60 px-4 py-5 sm:px-6">
                  {detail.messages.map((message) => {
                    const isVisitor = message.sender === 'VISITOR';
                    return (
                      <div key={message.id} className={`flex ${isVisitor ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${
                          !isVisitor
                            ? 'rounded-br-md bg-[#1a1d27] text-white'
                            : 'rounded-bl-md border border-stone-200 bg-white text-stone-800'
                        }`}>
                          {message.body && <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.body}</p>}
                          {message.attachments?.filter((attachment) => attachment.mimeType.startsWith('image/')).map((attachment) => (
                            <RemoteImagePreview key={`preview-${attachment.id}`} attachment={attachment} />
                          ))}
                          {!!message.attachments?.length && (
                            <div className="mt-3 space-y-2">
                              {message.attachments.map((attachment) => (
                                <button
                                  key={attachment.id}
                                  type="button"
                                  onClick={() => void downloadAttachment(attachment).catch((error: Error) => setAttachmentError(error.message))}
                                  className={`flex max-w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs ${
                                    !isVisitor ? 'border-white/20 bg-white/10 text-white' : 'border-stone-200 bg-stone-50 text-stone-700'
                                  }`}
                                >
                                  <Download size={14} className="shrink-0" />
                                  <span className="truncate">{attachment.originalName}</span>
                                  <span className="shrink-0 opacity-70">{Math.max(1, Math.round(attachment.size / 1024))} KB</span>
                                </button>
                              ))}
                            </div>
                          )}
                          <p className={`mt-2 text-[10px] ${!isVisitor ? 'text-stone-300' : 'text-stone-400'}`}>
                            {isVisitor
                              ? getContactName(detail.parentName, detail.studentName)
                              : message.sender === 'FACULTY'
                                ? 'Faculty'
                                : 'Administration'} · {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-stone-200 p-4">
                  {sendReply.isError && (
                    <p role="alert" className="mb-2 text-xs text-rose-700">{sendReply.error.message}</p>
                  )}
                  {attachmentError && <p role="alert" className="mb-2 text-xs text-rose-700">{attachmentError}</p>}
                  <form onSubmit={handleSubmit} className="flex items-end gap-2">
                    <label className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-stone-200 px-3 text-stone-600 hover:bg-stone-50" title="Attach images or documents">
                      <Paperclip size={16} />
                      <span className="sr-only">Attach files</span>
                      <input
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                        className="sr-only"
                        onChange={(event) => handleFiles(event.target.files)}
                      />
                    </label>
                    <label className="sr-only" htmlFor="faculty-message-reply">Write a reply</label>
                    <textarea
                      id="faculty-message-reply"
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      maxLength={2000}
                      rows={2}
                      placeholder="Write a reply…"
                      className="min-h-11 flex-1 resize-y rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-brand-700"
                    />
                    <button
                      type="submit"
                      disabled={(!reply.trim() && !selectedFiles.length) || sendReply.isPending}
                      className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-700 px-4 text-xs font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send size={14} /> Send
                    </button>
                  </form>
                  {!!selectedFiles.length && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedFiles.filter((file) => file.type.startsWith('image/')).map((file) => (
                        <div key={`${file.name}-${file.lastModified}`} className="rounded-xl border border-stone-200 bg-stone-50 p-2">
                          <LocalImagePreview file={file} />
                          <p className="mt-1 max-w-56 truncate text-[11px] text-stone-600">{file.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {!!selectedFiles.length && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedFiles.map((file) => (
                        <span key={`${file.name}-${file.lastModified}`} className="inline-flex max-w-full items-center gap-2 rounded-lg bg-stone-100 px-2.5 py-1.5 text-xs text-stone-700">
                          <span className="max-w-56 truncate">{file.name}</span>
                          <button type="button" onClick={() => setSelectedFiles(selectedFiles.filter((item) => item !== file))} aria-label={`Remove ${file.name}`}><X size={13} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm text-stone-500">
                <UserRound size={16} className="mr-2" /> Conversation unavailable.
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <Building2 size={14} />
        {scope === 'faculty'
          ? 'Your replies appear in the visitor’s saved in-app conversation.'
          : 'Admins can monitor all conversations. Faculty replies are visible here and to the visitor.'}
      </div>
    </section>
  );
};
