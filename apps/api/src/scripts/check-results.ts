import { PrismaClient } from '@nirakar/db';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.academicResult.count();
  console.log('ACADEMIC_RESULT_COUNT:', count);
}

main()
  .catch((err) => {
    console.error('ERROR:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
