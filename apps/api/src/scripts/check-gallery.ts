import { PrismaClient } from '@nirakar/db';

const prisma = new PrismaClient();

async function main() {
  const albums = await prisma.galleryAlbum.findMany({
    include: { items: true },
  });
  console.log('TOTAL_ALBUMS:', albums.length);
  for (const a of albums) {
    console.log(`[${a.institutionCode || 'ALL'}] ${a.title} (${a.category}) - ${a.items.length} items`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
