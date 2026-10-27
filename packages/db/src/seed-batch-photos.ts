/**
 * Fills the batch photograph archive with the photographs the Society has
 * been keeping since 1963.
 *
 * The photographs themselves were converted to WebP beforehand, so what
 * goes in here are real records pointing at real files, with the real
 * size of each file written down.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prisma } from './index.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const seedFile = path.resolve(here, '../prisma/seed/batch-photos.json');

interface SeedRecord {
  id: string;
  school: string;
  batchType: string;
  year: number;
  batchSession: string;
  title: string;
  classLevel: string;
  division?: string;
  photoUrl: string;
  caption?: string;
  fileSizeBytes: number;
  imageFormat: string;
  width?: number;
  height?: number;
}

export async function seedBatchPhotos() {
  if (!fs.existsSync(seedFile)) {
    console.log('No batch photograph seed file found, skipping.');
    return 0;
  }

  const records: SeedRecord[] = JSON.parse(fs.readFileSync(seedFile, 'utf8'));

  let created = 0;
  let updated = 0;

  for (const record of records) {
    const data = {
      institutionCode: record.school as any,
      batchYear: record.year,
      title: record.title,
      photoUrl: record.photoUrl,
      caption: record.caption ?? null,
      stream: record.batchType as any,
      batchSession: record.batchSession,
      classLevel: record.classLevel,
      division: record.division ?? null,
      fileSizeBytes: record.fileSizeBytes,
      imageFormat: record.imageFormat,
    };

    /* The seed file carries the identifier the photograph has always
       been known by, so the record can be matched on the second run
       rather than being added a second time. */
    const existing = await prisma.batchPhoto.findUnique({ where: { id: record.id } });

    if (existing) {
      await prisma.batchPhoto.update({ where: { id: record.id }, data });
      updated += 1;
    } else {
      await prisma.batchPhoto.create({ data: { id: record.id, ...data } });
      created += 1;
    }
  }

  console.log(
    `Batch photographs: ${created} added, ${updated} updated (${records.length} in the seed file).`,
  );
  return created + updated;
}
