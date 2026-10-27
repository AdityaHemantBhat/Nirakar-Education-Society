import { PrismaClient } from '@nirakar/db';

const prisma = new PrismaClient();

const SAMPLE_GALLERIES = [
  {
    institutionCode: 'NIRAKAR_HS' as const,
    title: 'Atal Tinkering Robotics & Innovation Lab Showcase',
    category: 'STEM & Robotics',
    description: 'Scholars of Shri Nirakar High School experimenting with microcontroller kits, sensor programming, and 3D prototyping models.',
    coverUrl: '/images/science_lab.jpg',
    items: [
      {
        title: 'Microcontroller Robotics Assembly',
        mediaUrl: '/images/science_lab.jpg',
        caption: 'Students assembling automated obstacle-avoiding sensor robots.',
        order: 0,
      },
      {
        title: 'Science Experiment Workstation',
        mediaUrl: '/images/nirakar_vidyalaya_real.jpg',
        caption: 'Interactive wet chemistry and optics stations at the Mashem campus.',
        order: 1,
      },
      {
        title: 'State Science Fair Project Presenters',
        mediaUrl: '/images/nirakar_student_winner.jpg',
        caption: 'Canacona zonal science exposition prize winners.',
        order: 2,
      },
    ],
  },
  {
    institutionCode: 'NIRAKAR_HS' as const,
    title: 'Inter-School Athletics & Volleyball Championships',
    category: 'Sports & Athletics',
    description: 'State tournament victories, volleyball rallies, and athletics meets hosted at the historic Mashem sports pavilion.',
    coverUrl: '/images/sports_champs.jpg',
    items: [
      {
        title: 'State Volleyball Champions Trophy',
        mediaUrl: '/images/sports_champs.jpg',
        caption: 'Unbroken legacy of district and state volleyball accolades.',
        order: 0,
      },
      {
        title: 'Campus Athletics Track & Field',
        mediaUrl: '/images/mashem_campus.jpg',
        caption: 'Scholars preparing for the All-Goa secondary athletics championship.',
        order: 1,
      },
    ],
  },
  {
    institutionCode: 'TUDAL_HS' as const,
    title: 'Traditional Goan Folk Arts, Natak & Fugdi Festival',
    category: 'Cultural & Heritage',
    description: 'State-awarded traditional folk theatre, Natak, Dhalo, and Fugdi presentations preserving Goan rural performing arts in Gaondongrem.',
    coverUrl: '/images/folk_arts.jpg',
    items: [
      {
        title: 'Goan Traditional Natak Ensemble',
        mediaUrl: '/images/folk_arts.jpg',
        caption: 'State award-winning theatrical performance by Tudal High School students.',
        order: 0,
      },
      {
        title: 'Sahyadri Forest Foothill Campus',
        mediaUrl: '/images/Tudal_High_School_Gaodongrem.webp',
        caption: 'The serene rural sanctuary campus in Gaondongrem.',
        order: 1,
      },
      {
        title: 'Tribal Cultural Heritage Presentation',
        mediaUrl: '/images/tudal_campus.jpg',
        caption: 'Celebrating traditional songs and folklore of the Canacona hinterlands.',
        order: 2,
      },
    ],
  },
  {
    institutionCode: 'TUDAL_HS' as const,
    title: 'Western Ghats Biodiversity & Eco-Sanctuary Walk',
    category: 'Nature & Campus',
    description: 'Field botany excursions, indigenous tree planting, and biodiversity observation clubs across Gaondongrem hills.',
    coverUrl: '/images/tudal_campus.jpg',
    items: [
      {
        title: 'Foothills Nature Garden',
        mediaUrl: '/images/tudal_campus.jpg',
        caption: 'Medicinal plants and biodiversity sanctuary maintained by students.',
        order: 0,
      },
      {
        title: 'Village Outreach & Forest Bus Fleet',
        mediaUrl: '/images/Tudal_High_School_Gaodongrem.webp',
        caption: 'Ensuring education reaches every doorstep across interior forest settlements.',
        order: 1,
      },
    ],
  },
  {
    institutionCode: 'ANGLE_HSS' as const,
    title: 'Higher Secondary Science, Commerce & Arts Conclave',
    category: 'Academic Life',
    description: 'Class XI & XII laboratory practicals, commerce symposiums, and university entrance foundation mentoring sessions at Dapot.',
    coverUrl: '/images/S.S.Angle_Higher_Secondary_School_Dapot.webp',
    items: [
      {
        title: 'Dapot Collegiate Main Building',
        mediaUrl: '/images/S.S.Angle_Higher_Secondary_School_Dapot.webp',
        caption: 'The landmark campus of Satyawati Soiru Angle Higher Secondary School.',
        order: 0,
      },
      {
        title: 'Advanced Computer & Physics Laboratories',
        mediaUrl: '/images/angle_campus.jpg',
        caption: 'Experiential learning environment preparing scholars for medical and engineering entrances.',
        order: 1,
      },
      {
        title: 'Alumni Felicitation & Career Guidance',
        mediaUrl: '/images/nirakar_students_real1.jpg',
        caption: 'Senior educators guiding graduating scholars on college roadmaps.',
        order: 2,
      },
    ],
  },
  {
    institutionCode: 'ANGLE_HSS' as const,
    title: 'Nirakar Maidan Sports & Republic Day Ceremonial Parade',
    category: 'Sports & NCC',
    description: 'NCC cadets, Scouts & Guides, and track events conducted at the sprawling Nirakar Maidan grounds in Dapot.',
    coverUrl: '/images/angle_campus.jpg',
    items: [
      {
        title: 'Nirakar Maidan Sports Complex',
        mediaUrl: '/images/angle_campus.jpg',
        caption: 'Full-scale cricket, football, and athletic pavilion at Dapot.',
        order: 0,
      },
      {
        title: 'NCC Cadet Contingent',
        mediaUrl: '/images/nirakar_students_real2.jpg',
        caption: 'Disciplined youth leadership marching in ceremonial state parades.',
        order: 1,
      },
    ],
  },
];

async function main() {
  console.log('Seeding initial authentic gallery albums across all 3 institutions...');
  
  // Clear any incomplete gallery albums
  await prisma.galleryItem.deleteMany({});
  await prisma.galleryAlbum.deleteMany({});

  for (const alb of SAMPLE_GALLERIES) {
    const created = await prisma.galleryAlbum.create({
      data: {
        institutionCode: alb.institutionCode,
        title: alb.title,
        description: alb.description,
        category: alb.category,
        coverUrl: alb.coverUrl,
        items: {
          create: alb.items,
        },
      },
      include: { items: true },
    });
    console.log(`Created: [${created.institutionCode}] ${created.title} with ${created.items.length} photos`);
  }

  console.log('Successfully seeded authentic gallery albums.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
