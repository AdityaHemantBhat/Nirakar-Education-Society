/**
 * Converts every photograph in the seed list to WebP and writes it into
 * the archive's own folder, so that the whole archive is one format and
 * the public gallery does not have to ask for a JPEG it does not need.
 *
 * The original photographs are left where they are, on the Society's
 * server — this only copies them in as WebP.
 */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const target = path.resolve(__dirname, 'prisma/seed/batch-photos.json');
const outputDir = path.resolve(__dirname, '../../uploads/batch');

const MAX_WIDTH = 1600;
const WEBP_QUALITY = 82;

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const records = JSON.parse(fs.readFileSync(target, 'utf8'));

  let done = 0;
  for (const record of records) {
    const source = record.imageUrl;
    const response = await fetch(source);
    if (!response.ok) {
      console.log('skipped', record.id, response.status);
      done += 1;
      continue;
    }
    const buffer = Buffer.from(await response.arrayBuffer());

    const webp = await sharp(buffer)
      .rotate()
      .resize(MAX_WIDTH, MAX_WIDTH, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toBuffer();

    const filename = `batch-${record.id}.webp`;
    await fs.promises.writeFile(path.join(outputDir, filename), webp);

    const meta = await sharp(webp).metadata();
    record.photoUrl = `/uploads/batch/${filename}`;
    record.fileSizeBytes = webp.length;
    record.imageFormat = 'webp';
    record.width = meta.width;
    record.height = meta.height;

    done += 1;
    if (done % 10 === 0) console.log(`converted ${done}/${records.length}`);
  }

  fs.writeFileSync(target, JSON.stringify(records, null, 2) + '\n');
  console.log(`done: ${done}/${records.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
