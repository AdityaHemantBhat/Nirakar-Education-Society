import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { Express } from 'express';
import { config } from '../../config/index.js';
import { AppError } from '../../middleware/error.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_TOTAL_SIZE = 25 * 1024 * 1024;
const MAX_FILES = 5;

const supportedTypes: Record<string, { mimeType: string; acceptedMimeTypes: string[]; kind: string }> = {
  '.jpg': { mimeType: 'image/jpeg', acceptedMimeTypes: ['image/jpeg'], kind: 'jpeg' },
  '.jpeg': { mimeType: 'image/jpeg', acceptedMimeTypes: ['image/jpeg'], kind: 'jpeg' },
  '.png': { mimeType: 'image/png', acceptedMimeTypes: ['image/png'], kind: 'png' },
  '.gif': { mimeType: 'image/gif', acceptedMimeTypes: ['image/gif'], kind: 'gif' },
  '.webp': { mimeType: 'image/webp', acceptedMimeTypes: ['image/webp'], kind: 'webp' },
  '.pdf': { mimeType: 'application/pdf', acceptedMimeTypes: ['application/pdf'], kind: 'pdf' },
  '.doc': { mimeType: 'application/msword', acceptedMimeTypes: ['application/msword'], kind: 'ole' },
  '.xls': { mimeType: 'application/vnd.ms-excel', acceptedMimeTypes: ['application/vnd.ms-excel'], kind: 'ole' },
  '.docx': { mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', acceptedMimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'], kind: 'docx' },
  '.xlsx': { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', acceptedMimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'], kind: 'xlsx' },
  '.csv': { mimeType: 'text/csv', acceptedMimeTypes: ['text/csv', 'application/csv', 'application/vnd.ms-excel', 'text/plain'], kind: 'csv' },
};

export interface StoredFacultyAttachment {
  originalName: string;
  storageName: string;
  mimeType: string;
  size: number;
}

function hasSignature(buffer: Buffer, signature: number[], offset = 0) {
  return signature.every((byte, index) => buffer[offset + index] === byte);
}

function isValidCsv(buffer: Buffer) {
  if (buffer.includes(0)) return false;
  const text = buffer.toString('utf8');
  return !text.includes('\uFFFD') && /[,;\t]/.test(text) && /[\r\n]/.test(text);
}

function verifyFile(file: Express.Multer.File, extension: string, kind: string) {
  const buffer = file.buffer;
  switch (kind) {
    case 'jpeg':
      return hasSignature(buffer, [0xff, 0xd8, 0xff]);
    case 'png':
      return hasSignature(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case 'gif':
      return buffer.subarray(0, 6).toString('ascii').match(/^GIF8[79]a$/) !== null;
    case 'webp':
      return buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
        buffer.subarray(8, 12).toString('ascii') === 'WEBP';
    case 'pdf':
      return buffer.subarray(0, 5).toString('ascii') === '%PDF-';
    case 'ole':
      return hasSignature(buffer, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
    case 'docx':
      return isOfficeZip(buffer, 'word/document.xml');
    case 'xlsx':
      return isOfficeZip(buffer, 'xl/workbook.xml');
    case 'csv':
      return extension === '.csv' && isValidCsv(buffer);
    default:
      return false;
  }
}

function isOfficeZip(buffer: Buffer, expectedEntry: string) {
  return hasSignature(buffer, [0x50, 0x4b, 0x03, 0x04]) &&
    buffer.includes(Buffer.from('[Content_Types].xml')) &&
    buffer.includes(Buffer.from(expectedEntry));
}

export async function storeFacultyMessageAttachments(files: Express.Multer.File[]) {
  if (files.length > MAX_FILES) {
    throw new AppError('VALIDATION_ERROR', `Attach no more than ${MAX_FILES} files per message`, 400);
  }
  const totalSize = files.reduce((total, file) => total + file.size, 0);
  if (totalSize > MAX_TOTAL_SIZE) {
    throw new AppError('VALIDATION_ERROR', 'Attachments must total 25 MB or less', 400);
  }

  const directory = path.resolve(config.STORAGE_LOCAL_PATH, 'faculty-messages');
  await fs.mkdir(directory, { recursive: true });
  const stored: StoredFacultyAttachment[] = [];

  try {
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        throw new AppError('VALIDATION_ERROR', `${file.originalname} exceeds the 10 MB file limit`, 400);
      }
      const extension = path.extname(file.originalname).toLowerCase();
      const supported = supportedTypes[extension];
      if (!supported || !supported.acceptedMimeTypes.includes(file.mimetype) || !verifyFile(file, extension, supported.kind)) {
        throw new AppError(
          'VALIDATION_ERROR',
          `${file.originalname} is not a supported or valid image/document file`,
          400
        );
      }
      const storageName = `${randomUUID()}${extension}`;
      await fs.writeFile(path.join(directory, storageName), file.buffer, { flag: 'wx' });
      stored.push({
        originalName: path.basename(file.originalname).replace(/[\\/\0]/g, '').slice(0, 180),
        storageName,
        mimeType: supported.mimeType,
        size: file.size,
      });
    }
    return stored;
  } catch (error) {
    await Promise.all(stored.map((file) => fs.unlink(path.join(directory, file.storageName)).catch(() => undefined)));
    throw error;
  }
}

export async function removeStoredFacultyAttachments(files: StoredFacultyAttachment[]) {
  const directory = path.resolve(config.STORAGE_LOCAL_PATH, 'faculty-messages');
  await Promise.all(files.map((file) => fs.unlink(path.join(directory, file.storageName)).catch(() => undefined)));
}

export function getFacultyAttachmentPath(storageName: string) {
  return path.resolve(config.STORAGE_LOCAL_PATH, 'faculty-messages', storageName);
}
