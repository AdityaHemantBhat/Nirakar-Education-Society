import React, { useEffect, useState } from 'react';

interface Attachment {
  id: string;
  originalName: string;
  mimeType: string;
}

export const LocalMessageImagePreview: React.FC<{ file: File }> = ({ file }) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!url) return null;
  return (
    <img
      src={url}
      alt={`Preview of ${file.name}`}
      className="max-h-40 max-w-56 rounded-lg border border-stone-200 object-contain"
    />
  );
};

export const RemoteMessageImagePreview: React.FC<{
  attachment: Attachment;
  visitorToken?: string;
}> = ({ attachment, visitorToken }) => {
  const [url, setUrl] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();
    let objectUrl = '';

    fetch(`/api/v1/faculty-messages/attachments/${attachment.id}`, {
      credentials: 'same-origin',
      headers: visitorToken ? { 'X-Conversation-Token': visitorToken } : undefined,
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
        if (error instanceof Error && error.name !== 'AbortError') {
          setUrl('');
          setFailed(true);
        }
      });

    return () => {
      abortController.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachment.id, visitorToken]);

  if (failed) {
    return <span className="block text-xs text-rose-500">Image preview unavailable</span>;
  }
  if (!url) {
    return (
      <span className="block text-xs text-stone-400" role="status">
        Loading image preview…
      </span>
    );
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className="mt-2 block">
      <img
        src={url}
        alt={attachment.originalName}
        className="max-h-72 max-w-full rounded-xl border border-stone-200 object-contain"
      />
    </a>
  );
};
