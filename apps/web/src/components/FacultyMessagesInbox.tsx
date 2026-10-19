import React, { FormEvent, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Download, Inbox, LoaderCircle, MessageCircle, Paperclip, Send, X } from 'lucide-react';

interface MessageAttachment {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
}
import { Navbar } from './Navbar.js';
import { Footer } from './Footer.js';
import { HeroWaves } from './HeroWaves.js';
import { SectionEdge } from './SectionEdge.js';
import { LocalMessageImagePreview, RemoteMessageImagePreview } from './FacultyMessageImagePreview.js';

interface Message {
  id: string;
  sender: 'VISITOR' | 'ADMIN' | 'FACULTY';
  body: string;
  readAt: string | null;
  createdAt: string;
  attachments: MessageAttachment[];
}

interface ConversationSummary {
  id: string;
  parentName: string;
  studentName: string | null;
  classGrade: string | null;
  phone: string | null;
  lastMessageAt: string;
  unreadCount: number;
  lastMessage: Pick<Message, 'body' | 'sender' | 'createdAt' | 'attachments'> | null;
}

interface Conversation extends ConversationSummary {
  messages: Message[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isMultipart = init?.body instanceof FormData;
  const options: RequestInit = {
    ...init,
    credentials: 'same-origin',
    headers: isMultipart ? init?.headers : { 'Content-Type': 'application/json', ...init?.headers },
  };
  let response = await fetch(path, options);
  if (response.status === 401) {
    const refresh = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'same-origin',
    });
    if (refresh.ok) response = await fetch(path, options);
  }
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error?.message || json.message || 'Unable to load faculty messages.');
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

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value)
  );
}

function getConversationName(parentName: string, studentName: string | null) {
  return [parentName, studentName].filter(Boolean).join(' ');
}

export const FacultyMessagesInbox: React.FC<{ facultyName: string; floating?: boolean }> = ({
  facultyName,
  floating = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isOpen) return;

    const html = document.documentElement;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    window.dispatchEvent(new CustomEvent('nirakar:scroll-lock', { detail: true }));

    return () => {
      html.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      window.dispatchEvent(new CustomEvent('nirakar:scroll-lock', { detail: false }));
    };
  }, [isOpen]);

  const unreadQuery = useQuery({
    queryKey: ['facultyMessageUnreadCount'],
    queryFn: () => request<{ count: number }>('/api/v1/faculty-messages/faculty/unread-count'),
    refetchInterval: 15_000,
    retry: false,
  });

  const conversationsQuery = useQuery({
    queryKey: ['facultyMessageConversations'],
    queryFn: () => request<ConversationSummary[]>('/api/v1/faculty-messages/faculty'),
    enabled: isOpen,
    refetchInterval: 15_000,
    retry: false,
  });

  const conversationQuery = useQuery({
    queryKey: ['facultyMessageConversation', selectedId],
    queryFn: () =>
      request<Conversation>(`/api/v1/faculty-messages/faculty/${selectedId}`),
    enabled: isOpen && Boolean(selectedId),
    refetchInterval: 8_000,
    retry: false,
  });

  const markRead = useMutation({
    mutationFn: (id: string) =>
      request(`/api/v1/faculty-messages/faculty/${id}/read`, { method: 'PATCH' }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['facultyMessageUnreadCount'] }),
        queryClient.invalidateQueries({ queryKey: ['facultyMessageConversations'] }),
        queryClient.invalidateQueries({ queryKey: ['facultyMessageConversation', selectedId] }),
      ]);
    },
  });

  useEffect(() => {
    const current = conversationQuery.data;
    if (isOpen && current?.unreadCount && !markRead.isPending) {
      markRead.mutate(current.id);
    }
  }, [isOpen, conversationQuery.data?.id, conversationQuery.data?.unreadCount]);

  const sendMessage = useMutation({
    mutationFn: ({ body, files }: { body: string; files: File[] }) => {
      const formData = new FormData();
      formData.append('body', body);
      files.forEach((file) => formData.append('attachments', file));
      return request<Message>(`/api/v1/faculty-messages/faculty/${selectedId}/messages`, {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: async () => {
      setReply('');
      setSelectedFiles([]);
      setAttachmentError('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['facultyMessageConversation', selectedId] }),
        queryClient.invalidateQueries({ queryKey: ['facultyMessageConversations'] }),
        queryClient.invalidateQueries({ queryKey: ['facultyMessageUnreadCount'] }),
      ]);
    },
  });

  const handleReply = (event: FormEvent) => {
    event.preventDefault();
    const body = reply.trim();
    if ((body || selectedFiles.length) && !sendMessage.isPending) {
      sendMessage.mutate({ body, files: selectedFiles });
    }
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

  const conversations = conversationsQuery.data || [];
  const conversation = conversationQuery.data;
  const unreadCount = unreadQuery.data?.count || 0;

  return createPortal(
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`Open faculty messages${unreadCount ? `, ${unreadCount} unread` : ''}`}
        style={floating ? {
          position: 'fixed',
          right: '24px',
          bottom: '24px',
          left: 'auto',
          top: 'auto',
          width: 'max-content',
          zIndex: 1000,
        } : undefined}
        className={`relative inline-flex items-center gap-2 text-sm font-semibold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-[#16247e] ${
          floating
            ? 'bottom-5 right-5 z-40 !w-max rounded-full bg-[#0b132b] px-5 py-3.5'
            : 'rounded-xl border border-amber-300/40 bg-white/10 px-4 py-2.5'
        }`}
      >
        <MessageCircle size={15} />
        <span>Messages</span>
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white ring-2 ring-[#0b132b]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          data-lenis-prevent
          className="fixed inset-0 z-[80] flex h-[100dvh] flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain bg-[#FAF7F2] text-stone-900"
          role="dialog"
          aria-modal="true"
          aria-label="Faculty messages"
        >
          <div className="shrink-0">
            <Navbar />
          </div>
          <section className="relative z-0 min-h-36 w-full shrink-0 overflow-hidden bg-[#0b132b] px-4 pb-8 pt-12 text-white sm:px-8 sm:pb-10 sm:pt-16 lg:-mt-[78px] lg:px-12 lg:pb-14 lg:pt-28">
            <HeroWaves opacity={0.85} />
            <div className="relative z-10 mx-auto flex min-h-20 w-full max-w-[1850px] items-center gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Back to faculty page"
                className="rounded-xl p-2 text-amber-300 transition hover:bg-white/10"
              >
                <ArrowLeft size={19} />
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-300">Faculty inbox</p>
                <h2 className="truncate font-serif text-xl font-bold sm:text-2xl">{facultyName}</h2>
              </div>
              {unreadCount > 0 && (
                <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-bold">
                  {unreadCount} unread
                </span>
              )}
            </div>
          </section>
          <div className="shrink-0">
            <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />
          </div>

          <main className="mx-auto flex min-h-[70vh] w-full max-w-[1920px] flex-none flex-col gap-4 px-4 py-6 sm:px-8 sm:py-8 lg:flex-row lg:gap-6 lg:px-10 xl:px-12">
            <aside className="flex min-h-[220px] w-full flex-col rounded-2xl border border-stone-200 bg-white shadow-sm lg:min-h-[65vh] lg:w-[360px] lg:shrink-0">
              <div className="border-b border-stone-100 px-5 py-4">
                <h3 className="font-serif text-lg font-bold text-stone-900">Conversations</h3>
                <p className="mt-0.5 text-xs text-stone-500">Messages sent to your faculty profile</p>
              </div>
              <div className="flex-1">
                {conversationsQuery.isLoading ? (
                  <div className="flex items-center justify-center gap-2 p-8 text-sm text-stone-500">
                    <LoaderCircle size={16} className="animate-spin" /> Loading inbox
                  </div>
                ) : conversationsQuery.isError ? (
                  <div role="alert" className="p-5 text-sm text-rose-700">
                    {conversationsQuery.error.message}
                    <button type="button" onClick={() => void conversationsQuery.refetch()} className="mt-3 block font-semibold underline">
                      Try again
                    </button>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <Inbox size={28} className="mx-auto text-stone-300" />
                    <p className="mt-3 font-semibold text-stone-700">Your inbox is clear</p>
                    <p className="mt-1 text-sm text-stone-500">New messages to your profile will appear here.</p>
                  </div>
                ) : (
                  conversations.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(item.id);
                        setReply('');
                      }}
                      className={`block w-full border-b border-stone-100 px-5 py-4 text-left transition hover:bg-amber-50/60 ${
                        selectedId === item.id ? 'bg-amber-50' : ''
                      }`}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span className="truncate text-sm font-bold text-stone-900">
                          {getConversationName(item.parentName, item.studentName)}
                        </span>
                        {item.unreadCount > 0 && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                            {item.unreadCount > 99 ? '99+' : item.unreadCount}
                          </span>
                        )}
                      </span>
                      <span className="mt-2 block truncate text-xs text-stone-600">
                        {item.lastMessage?.body || item.lastMessage?.attachments?.map((file) => file.originalName).join(', ') || 'No messages yet'}
                      </span>
                      <span className="mt-2 block text-[10px] text-stone-400">{formatMessageTime(item.lastMessageAt)}</span>
                    </button>
                  ))
                )}
              </div>
            </aside>

            <section className="flex min-h-[480px] min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm lg:min-h-[65vh]">
              {!selectedId ? (
                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-stone-500">
                  <MessageCircle size={34} className="text-stone-300" />
                  <p className="mt-3 font-serif text-lg font-bold text-stone-700">Choose a conversation</p>
                  <p className="mt-1 text-sm">Select a message on the left to read and reply.</p>
                </div>
              ) : conversationQuery.isLoading ? (
                <div className="flex flex-1 items-center justify-center gap-2 text-sm text-stone-500">
                  <LoaderCircle size={16} className="animate-spin" /> Opening conversation
                </div>
              ) : conversationQuery.isError ? (
                <div role="alert" className="m-auto p-6 text-center text-sm text-rose-700">
                  {conversationQuery.error.message}
                  <button type="button" onClick={() => void conversationQuery.refetch()} className="mt-3 block w-full font-semibold underline">
                    Try again
                  </button>
                </div>
              ) : conversation ? (
                <>
                  <div className="shrink-0 border-b border-stone-100 px-5 py-4">
                    <h3 className="font-serif text-lg font-bold text-stone-900">
                      {getConversationName(conversation.parentName, conversation.studentName)}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-stone-600">
                      {conversation.classGrade && (
                        <span className="rounded-full bg-stone-100 px-2.5 py-1">
                          Class: {conversation.classGrade}
                        </span>
                      )}
                      {conversation.phone && (
                        <a href={`tel:${conversation.phone}`} className="rounded-full bg-stone-100 px-2.5 py-1 hover:text-[#111b5e]">
                          Phone: {conversation.phone}
                        </a>
                      )}
                      {!conversation.classGrade && !conversation.phone && <span>Family message</span>}
                    </div>
                  </div>
                  <div className="min-h-[300px] flex-1 bg-stone-50/70 p-4 sm:p-6">
                    <div className="flex min-h-full flex-col justify-end gap-5">
                    {conversation.messages.map((message) => {
                      const isFacultyReply = message.sender === 'FACULTY';
                      return (
                        <div key={message.id} className={`flex ${isFacultyReply ? 'justify-end' : 'justify-start'}`}>
                          <article className={`max-w-[85%] break-words rounded-2xl px-4 py-3 shadow-sm ${
                            isFacultyReply ? 'rounded-br-md bg-[#0b132b] text-white' : 'rounded-bl-md border border-stone-200 bg-white text-stone-800'
                          }`}>
                            {message.body && <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.body}</p>}
                            {message.attachments?.filter((attachment) => attachment.mimeType.startsWith('image/')).map((attachment) => (
                              <RemoteMessageImagePreview key={`preview-${attachment.id}`} attachment={attachment} />
                            ))}
                            {!!message.attachments?.length && (
                              <div className="mt-3 space-y-2">
                                {message.attachments.map((attachment) => (
                                  <button
                                    key={attachment.id}
                                    type="button"
                                    onClick={() => void downloadAttachment(attachment).catch((error: Error) => setAttachmentError(error.message))}
                                    className={`flex max-w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs ${
                                      isFacultyReply ? 'border-white/20 bg-white/10 text-white' : 'border-stone-200 bg-stone-50 text-stone-700'
                                    }`}
                                  >
                                    <Download size={14} className="shrink-0" />
                                    <span className="truncate">{attachment.originalName}</span>
                                    <span className="shrink-0 opacity-70">{Math.max(1, Math.round(attachment.size / 1024))} KB</span>
                                  </button>
                                ))}
                              </div>
                            )}
                            <p className={`mt-2 text-[10px] ${isFacultyReply ? 'text-stone-300' : 'text-stone-400'}`}>
                              {message.sender === 'VISITOR'
                                ? getConversationName(conversation.parentName, conversation.studentName)
                                : message.sender === 'FACULTY'
                                  ? 'You'
                                  : 'School administration'} · {formatMessageTime(message.createdAt)}
                            </p>
                          </article>
                        </div>
                      );
                    })}
                    </div>
                  </div>
                  <form onSubmit={handleReply} className="shrink-0 border-t border-stone-100 p-4 sm:p-5">
                    {(sendMessage.isError || markRead.isError) && (
                      <p role="alert" className="mb-3 text-xs text-rose-700">
                        {sendMessage.error?.message || markRead.error?.message}
                      </p>
                    )}
                    {attachmentError && <p role="alert" className="mb-3 text-xs text-rose-700">{attachmentError}</p>}
                    <div className="flex items-end gap-2">
                      <label className="inline-flex h-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-stone-200 px-3 text-stone-600 hover:bg-stone-50" title="Attach images or documents">
                        <Paperclip size={17} />
                        <span className="sr-only">Attach files</span>
                        <input
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                          className="sr-only"
                          onChange={(event) => handleFiles(event.target.files)}
                        />
                      </label>
                      <label className="sr-only" htmlFor="faculty-inbox-reply">Write a reply</label>
                      <textarea
                        id="faculty-inbox-reply"
                        value={reply}
                        onChange={(event) => setReply(event.target.value)}
                        maxLength={2000}
                        rows={2}
                        placeholder="Write your reply…"
                        className="max-h-40 min-h-14 flex-1 resize-y rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none transition focus:border-amber-700 focus:bg-white"
                      />
                      <button
                        type="submit"
                        disabled={(!reply.trim() && !selectedFiles.length) || sendMessage.isPending}
                        aria-label="Send reply"
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0b132b] px-4 text-xs font-semibold text-white transition hover:bg-[#16247e] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Send size={15} /><span className="hidden sm:inline">Send</span>
                      </button>
                    </div>
                    {!!selectedFiles.length && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedFiles.filter((file) => file.type.startsWith('image/')).map((file) => (
                          <div key={`${file.name}-${file.lastModified}`} className="rounded-xl border border-stone-200 bg-stone-50 p-2">
                            <LocalMessageImagePreview file={file} />
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
                  </form>
                </>
              ) : null}
            </section>
          </main>
          <div className="shrink-0">
            <Footer />
          </div>
        </div>
      )}
    </>,
    document.body
  );
};
