// Core Shared Interfaces
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    total?: number;
    cursor?: string | null;
    hasNextPage?: boolean;
    page?: number;
    limit?: number;
  };
}

export interface UserSession {
  userId: string;
  email: string;
  username: string;
  role: string;
  institutionCode?: string | null;
  alumniProfileId?: string | null;
  hasActivePass?: boolean;
}

export interface MediaVariant {
  width: number;
  format: 'avif' | 'webp' | 'jpeg' | 'pdf';
  url: string;
}

export interface MediaRecord {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  blurhash: string;
  dominantColor: string;
  focalPoint?: { x: number; y: number } | null;
  variants: MediaVariant[];
  altText?: string | null;
  createdAt: string;
}
