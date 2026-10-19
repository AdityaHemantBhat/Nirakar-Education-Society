import React, { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ReCaptchaProvider, useReCaptcha } from '@wojtekmaj/react-recaptcha-v3';
import { ArrowLeft, Check, Download, MessageCircle, Paperclip, Send, X } from 'lucide-react';
import { Navbar } from './Navbar.js';
import { Footer } from './Footer.js';
import { HeroWaves } from './HeroWaves.js';
import { SectionEdge } from './SectionEdge.js';
import { AuthCaptchaNotice } from './AuthCaptcha.js';
import { LocalMessageImagePreview, RemoteMessageImagePreview } from './FacultyMessageImagePreview.js';

interface FacultyMessage {
  id: string;
  sender: 'VISITOR' | 'ADMIN' | 'FACULTY';
  body: string;
  readAt: string | null;
  createdAt: string;
  attachments: MessageAttachment[];
}

interface MessageAttachment {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
}

interface Conversation {
  id: string;
  parentName: string;
  studentName: string | null;
  classGrade: string | null;
  lastMessageAt: string;
  unreadCount: number;
  messages: FacultyMessage[];
}

interface SavedConversation {
  id: string;
  accessToken: string;
}

interface StartConversationResponse {
  conversation: Conversation;
  accessToken: string;
}

interface StartForm {
  parentName: string;
  studentName: string;
  classGrade: string;
  phone: string;
  email: string;
  message: string;
}

const emptyForm: StartForm = {
  parentName: '',
  studentName: '',
  classGrade: '',
  phone: '',
  email: '',
  message: '',
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isMultipart = init?.body instanceof FormData;
  const response = await fetch(path, {
    ...init,
    headers: isMultipart
      ? init?.headers
      : { 'Content-Type': 'application/json', ...init?.headers },
  });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error?.message || json.message || 'Unable to complete your request.');
  }
  return json.data as T;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value)
  );
}

async function downloadAttachment(attachment: MessageAttachment, token?: string) {
  const response = await fetch(`/api/v1/faculty-messages/attachments/${attachment.id}`, {
    credentials: 'same-origin',
    headers: token ? { 'X-Conversation-Token': token } : undefined,
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

function getSavedConversation(key: string): SavedConversation | null {
  try {
    const value = localStorage.getItem(key);
    if (!value) return null;
    const parsed = JSON.parse(value);
    return typeof parsed.id === 'string' && typeof parsed.accessToken === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

export const FacultyMessageWidget: React.FC<{
  facultyProfileId: string;
  facultyName: string;
}> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('message') === '1') {
      setIsOpen(true);
    }
  }, []);

  if (!siteKey) {
    return (
      <button
        type="button"
        disabled
        title="Secure messaging is not configured yet. Please contact the school directly."
        aria-label="Messaging is temporarily unavailable"
        className="fixed bottom-5 right-5 z-40 inline-flex cursor-not-allowed items-center gap-2 rounded-full bg-stone-500 px-5 py-3.5 text-sm font-semibold text-white opacity-90 shadow-xl"
      >
        <MessageCircle size={18} />
        <span>Messages unavailable</span>
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`Message ${props.facultyName}`}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#0b132b] px-5 py-3.5 text-sm font-semibold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-[#16247e] focus:outline-none focus:ring-4 focus:ring-amber-300/60"
      >
        <MessageCircle size={18} />
        <span>Message</span>
      </button>
      {isOpen && (
        <ReCaptchaProvider reCaptchaKey={siteKey}>
          <FacultyMessageConversation {...props} onClose={() => setIsOpen(false)} />
        </ReCaptchaProvider>
      )}
    </>
  );
};

const FacultyMessageConversation: React.FC<{
  facultyProfileId: string;
  facultyName: string;
  onClose: () => void;
}> = ({ facultyProfileId, facultyName, onClose }) => {
  const { executeRecaptcha } = useReCaptcha();
  const queryClient = useQueryClient();
  const storageKey = `nirakar_faculty_conversation_${facultyProfileId}`;
  const [saved, setSaved] = useState(() => getSavedConversation(storageKey));
  const [startForm, setStartForm] = useState<StartForm>(emptyForm);
  const [reply, setReply] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [storageWarning, setStorageWarning] = useState('');
  const [attachmentError, setAttachmentError] = useState('');

  useEffect(() => {
    const html = document.documentElement;
    const hadStoppedClass = html.classList.contains('lenis-stopped');
    const previousHtmlOverflow = html.style.overflow;
    const previousOverflow = document.body.style.overflow;
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    window.dispatchEvent(new CustomEvent('nirakar:scroll-lock', { detail: true }));
    return () => {
      html.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousOverflow;
      if (!hadStoppedClass) html.classList.remove('lenis-stopped');
      window.dispatchEvent(new CustomEvent('nirakar:scroll-lock', { detail: false }));
    };
  }, []);

  const conversationQuery = useQuery({
    queryKey: ['publicFacultyConversation', saved?.id],
    queryFn: () =>
      request<Conversation>(`/api/v1/faculty-messages/${saved!.id}`, {
        headers: { 'X-Conversation-Token': saved!.accessToken },
      }),
    enabled: Boolean(saved),
    refetchInterval: 12_000,
    retry: false,
  });

  const markRead = useMutation({
    mutationFn: () =>
      request(`/api/v1/faculty-messages/${saved!.id}/read`, {
        method: 'PATCH',
        headers: { 'X-Conversation-Token': saved!.accessToken },
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['publicFacultyConversation', saved?.id] }),
  });

  useEffect(() => {
    if (conversationQuery.data?.unreadCount && !markRead.isPending) {
      markRead.mutate();
    }
  }, [conversationQuery.data?.id, conversationQuery.data?.unreadCount]);

  const startConversation = useMutation({
    mutationFn: async ({ data, files }: { data: StartForm; files: File[] }) => {
      if (!executeRecaptcha) throw new Error('Message verification is loading. Please try again.');
      const captchaToken = await executeRecaptcha('faculty_message');
      if (!captchaToken) throw new Error('Message verification failed. Please try again.');
      const formData = new FormData();
      Object.entries({ ...data, facultyProfileId, captchaToken }).forEach(([key, value]) => {
        formData.append(key, String(value ?? ''));
      });
      files.forEach((file) => formData.append('attachments', file));
      return request<StartConversationResponse>('/api/v1/faculty-messages', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: (result) => {
      const nextSaved = { id: result.conversation.id, accessToken: result.accessToken };
      setSaved(nextSaved);
      setStartForm(emptyForm);
      setSelectedFiles([]);
      setAttachmentError('');
      try {
        localStorage.setItem(storageKey, JSON.stringify(nextSaved));
        setStorageWarning('');
      } catch {
        setStorageWarning('This browser could not save the conversation on this device. Keep this page open to return to it.');
      }
      queryClient.setQueryData(['publicFacultyConversation', result.conversation.id], {
        ...result.conversation,
        unreadCount: 0,
      });
    },
  });

  const sendMessage = useMutation({
    mutationFn: async ({ body, files }: { body: string; files: File[] }) => {
      if (!executeRecaptcha) throw new Error('Message verification is loading. Please try again.');
      const captchaToken = await executeRecaptcha('faculty_message');
      if (!captchaToken) throw new Error('Message verification failed. Please try again.');
      const formData = new FormData();
      formData.append('body', body);
      formData.append('captchaToken', captchaToken);
      files.forEach((file) => formData.append('attachments', file));
      return request<FacultyMessage>(`/api/v1/faculty-messages/${saved!.id}/messages`, {
        method: 'POST',
        headers: { 'X-Conversation-Token': saved!.accessToken },
        body: formData,
      });
    },
    onSuccess: async () => {
      setReply('');
      setSelectedFiles([]);
      setAttachmentError('');
      await queryClient.invalidateQueries({ queryKey: ['publicFacultyConversation', saved?.id] });
    },
  });

  const conversation = conversationQuery.data;
  const handleStart = (event: FormEvent) => {
    event.preventDefault();
    if (startConversation.isPending) return;
    startConversation.mutate({ data: startForm, files: selectedFiles });
  };

  const handleReply = (event: FormEvent) => {
    event.preventDefault();
    const body = reply.trim();
    if ((!body && !selectedFiles.length) || sendMessage.isPending) return;
    sendMessage.mutate({ body, files: selectedFiles });
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
    <div
      data-lenis-prevent
      className="fixed inset-0 z-[80] flex h-[100dvh] flex-col overflow-y-auto overscroll-y-contain bg-[#FAF7F2] text-stone-900"
    >
      <div className="shrink-0">
        <Navbar />
      </div>
      <section className="relative z-0 -mt-0 min-h-36 w-full shrink-0 overflow-hidden bg-[#0b132b] px-4 pb-8 pt-12 text-white sm:px-8 sm:pb-10 sm:pt-16 lg:-mt-[78px] lg:px-12 lg:pb-14 lg:pt-28">
        <HeroWaves opacity={0.85} />
        <div className="relative z-10 mx-auto flex min-h-20 w-full max-w-[1850px] items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            aria-label="Back to faculty profile"
            className="rounded-xl p-2 text-amber-300 transition hover:bg-white/10 hover:text-amber-200"
          >
            <ArrowLeft size={19} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-300">
              Faculty messages
            </p>
            <h1 className="truncate font-serif text-xl font-bold sm:text-2xl">{facultyName}</h1>
          </div>
          {conversation && (
            <span className="hidden items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-[11px] font-semibold text-emerald-100 sm:inline-flex">
              <Check size={13} /> Saved conversation
            </span>
          )}
        </div>
      </section>
      <div className="shrink-0">
        <SectionEdge variant="scoop" color="#FAF7F2" bgColor="#0b132b" height={36} withGoldLine />
      </div>

      <main className="mx-auto flex w-full max-w-[1600px] flex-col px-4 py-6 sm:px-8 sm:py-8 lg:px-12">
            {saved ? (
              conversationQuery.isLoading ? (
                <div className="flex flex-1 items-center justify-center text-sm text-stone-500">
                  Loading your conversation…
                </div>
              ) : conversationQuery.isError ? (
                <div role="alert" className="m-auto max-w-md px-6 text-center">
                  <MessageCircle size={28} className="mx-auto text-stone-300" />
                  <h3 className="mt-3 font-semibold text-stone-800">Could not open this conversation</h3>
                  <p className="mt-1 text-sm text-stone-500">
                    {conversationQuery.error.message}. This conversation is private to the browser where it was started.
                  </p>
                  <button
                    type="button"
                    onClick={() => void conversationQuery.refetch()}
                    className="mt-4 rounded-xl bg-[#0b132b] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#16247e]"
                  >
                    Try again
                  </button>
                </div>
              ) : conversation ? (
                <>
                  <section
                    aria-label="Conversation messages"
                    className="mb-5 min-h-[42vh] rounded-3xl border border-stone-200 bg-white/70 p-5 shadow-sm sm:p-8 lg:p-10"
                  >
                    {conversation.messages.length === 1 && (
                      <p className="mx-auto mb-8 w-full max-w-2xl rounded-2xl border border-amber-200 bg-amber-50/80 px-5 py-4 text-center text-sm leading-relaxed text-stone-600">
                        Your message is in the school inbox. Replies will appear here.
                      </p>
                    )}
                    <div className="space-y-7">
                      {conversation.messages.map((message) => {
                        const ownMessage = message.sender === 'VISITOR';
                        return (
                          <div key={message.id} className={`flex px-1 sm:px-3 ${ownMessage ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[min(82%,48rem)] break-words rounded-2xl px-5 py-4 sm:px-6 ${
                              ownMessage
                                ? 'rounded-br-md bg-[#0b132b] text-white'
                                : 'rounded-bl-md border border-stone-200 bg-white text-stone-800 shadow-sm'
                            }`}>
                              {message.body && <p className="whitespace-pre-wrap [overflow-wrap:anywhere] text-sm leading-relaxed sm:text-base">{message.body}</p>}
                              {message.attachments?.filter((attachment) => attachment.mimeType.startsWith('image/')).map((attachment) => (
                                <RemoteMessageImagePreview key={`preview-${attachment.id}`} attachment={attachment} visitorToken={saved?.accessToken} />
                              ))}
                              {!!message.attachments?.length && (
                                <div className="mt-3 space-y-2">
                                  {message.attachments.map((attachment) => (
                                    <button
                                      key={attachment.id}
                                      type="button"
                                      onClick={() => void downloadAttachment(attachment, saved?.accessToken).catch((error: Error) => setAttachmentError(error.message))}
                                      className={`flex max-w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs ${
                                        ownMessage ? 'border-white/20 bg-white/10 text-white' : 'border-stone-200 bg-stone-50 text-stone-700'
                                      }`}
                                    >
                                      <Download size={14} className="shrink-0" />
                                      <span className="truncate">{attachment.originalName}</span>
                                      <span className="shrink-0 opacity-70">{Math.max(1, Math.round(attachment.size / 1024))} KB</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                              <p className={`mt-3 text-[10px] ${ownMessage ? 'text-stone-300' : 'text-stone-400'}`}>
                                {ownMessage
                                  ? 'You'
                                  : message.sender === 'FACULTY'
                                    ? 'Faculty'
                                    : 'School administration'} · {formatTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                  <div className="mb-6 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
                    {storageWarning && (
                      <p role="status" className="mb-2 text-xs text-amber-800">{storageWarning}</p>
                    )}
                    <AuthCaptchaNotice className="mb-2 justify-start" />
                    <form onSubmit={handleReply} className="flex items-end gap-2">
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
                      <label className="sr-only" htmlFor="faculty-public-reply">Write a message</label>
                      <textarea
                        id="faculty-public-reply"
                        value={reply}
                        onChange={(event) => setReply(event.target.value)}
                        maxLength={2000}
                        rows={3}
                        placeholder="Write a message…"
                        className="max-h-48 min-h-20 flex-1 resize-y rounded-xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-sm outline-none transition focus:border-amber-700 focus:bg-white"
                      />
                      <button
                        type="submit"
                        disabled={(!reply.trim() && !selectedFiles.length) || sendMessage.isPending}
                        aria-label="Send message"
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0b132b] px-5 text-xs font-semibold text-white transition hover:bg-[#16247e] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Send size={15} />
                        <span className="hidden sm:inline">Send</span>
                      </button>
                    </form>
                    {!!selectedFiles.length && (
                      <div className="mb-3 flex flex-wrap gap-2">
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
                    {(attachmentError || sendMessage.isError) && (
                      <p role="alert" className="mt-2 text-xs text-rose-700">{attachmentError || sendMessage.error?.message}</p>
                    )}
                  </div>
                </>
              ) : null
            ) : (
              <div className="flex-1 py-7">
                <div className="w-full">
                  <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                    <h3 className="font-serif text-lg font-bold text-stone-900">Start a conversation</h3>
                    <p className="mt-1 text-sm leading-relaxed text-stone-600">
                      Send a message to the school team about {facultyName}. Replies are saved here on this device.
                    </p>
                  </div>
                  {startConversation.isError && (
                    <p role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                      {startConversation.error.message}
                    </p>
                  )}
                  <AuthCaptchaNotice className="mb-3 justify-start" />
                  <form onSubmit={handleStart} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block text-sm font-semibold text-stone-700">
                        Your name *
                        <input
                          required
                          minLength={2}
                          maxLength={100}
                          value={startForm.parentName}
                          onChange={(event) => setStartForm({ ...startForm, parentName: event.target.value })}
                          className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-base font-normal outline-none focus:border-amber-700"
                          autoComplete="name"
                        />
                      </label>
                      <label className="block text-sm font-semibold text-stone-700">
                        Student name
                        <input
                          maxLength={100}
                          value={startForm.studentName}
                          onChange={(event) => setStartForm({ ...startForm, studentName: event.target.value })}
                          className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-base font-normal outline-none focus:border-amber-700"
                        />
                      </label>
                      <label className="block text-sm font-semibold text-stone-700">
                        Class / grade
                        <input
                          maxLength={50}
                          value={startForm.classGrade}
                          onChange={(event) => setStartForm({ ...startForm, classGrade: event.target.value })}
                          className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-base font-normal outline-none focus:border-amber-700"
                        />
                      </label>
                      <label className="block text-sm font-semibold text-stone-700">
                        Phone
                        <input
                          type="tel"
                          maxLength={40}
                          value={startForm.phone}
                          onChange={(event) => setStartForm({ ...startForm, phone: event.target.value })}
                          className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-base font-normal outline-none focus:border-amber-700"
                          autoComplete="tel"
                        />
                      </label>
                      <label className="block text-sm font-semibold text-stone-700 sm:col-span-2">
                        Email
                        <input
                          type="email"
                          maxLength={254}
                          value={startForm.email}
                          onChange={(event) => setStartForm({ ...startForm, email: event.target.value })}
                          className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-base font-normal outline-none focus:border-amber-700"
                          autoComplete="email"
                        />
                        <span className="mt-1 block text-sm font-normal text-stone-500">Provide at least a phone number or email address.</span>
                      </label>
                    </div>
                    <label className="block text-sm font-semibold text-stone-700">
                      Your message
                      <textarea
                        maxLength={2000}
                        rows={5}
                        value={startForm.message}
                        onChange={(event) => setStartForm({ ...startForm, message: event.target.value })}
                        placeholder="How can the school team help?"
                        className="mt-1.5 w-full resize-y rounded-xl border border-stone-200 bg-white px-3.5 py-3 text-base font-normal leading-relaxed outline-none focus:border-amber-700"
                      />
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-stone-200 px-4 text-sm font-semibold text-stone-700 hover:bg-stone-50">
                        <Paperclip size={16} /> Attach images or documents
                        <input
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.csv"
                          className="sr-only"
                          onChange={(event) => handleFiles(event.target.files)}
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={startConversation.isPending || (!startForm.message.trim() && !selectedFiles.length)}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0b132b] px-5 text-sm font-semibold text-white transition hover:bg-[#16247e] disabled:cursor-wait disabled:opacity-60"
                      >
                        <Send size={15} />
                        {startConversation.isPending ? 'Sending…' : 'Send message'}
                      </button>
                    </div>
                    {!!selectedFiles.length && (
                      <div className="flex flex-wrap gap-2">
                        {selectedFiles.filter((file) => file.type.startsWith('image/')).map((file) => (
                          <div key={`${file.name}-${file.lastModified}`} className="rounded-xl border border-stone-200 bg-stone-50 p-2">
                            <LocalMessageImagePreview file={file} />
                            <p className="mt-1 max-w-56 truncate text-[11px] text-stone-600">{file.name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {!!selectedFiles.length && (
                      <div className="flex flex-wrap gap-2">
                        {selectedFiles.map((file) => (
                          <span key={`${file.name}-${file.lastModified}`} className="inline-flex max-w-full items-center gap-2 rounded-lg bg-stone-100 px-2.5 py-1.5 text-xs text-stone-700">
                            <span className="max-w-56 truncate">{file.name}</span>
                            <button type="button" onClick={() => setSelectedFiles(selectedFiles.filter((item) => item !== file))} aria-label={`Remove ${file.name}`}><X size={13} /></button>
                          </span>
                        ))}
                      </div>
                    )}
                    {(attachmentError || startConversation.isError) && (
                      <p role="alert" className="text-xs text-rose-700">{attachmentError || startConversation.error?.message}</p>
                    )}
                  </form>
                </div>
              </div>
            )}
      </main>
      <div className="shrink-0">
        <Footer />
      </div>
    </div>
  );
};
