import { prisma } from '../packages/db/src/index';
import argon2 from 'argon2';

async function seedAlumni() {
  console.log('Seeding Real Distinguished Alumni into Supabase DB...');

  const defaultPassword = await argon2.hash('NirakarAlumni@2026!');

  const alumniData = [
    {
      username: 'adv_aditya_desai',
      email: 'aditya.desai@alumni.nirakar.org',
      firstName: 'Adv. Aditya',
      lastName: 'Desai',
      school: 'NIRAKAR_HS' as const,
      batchYear: 1994,
      occupation: 'Senior Advocate, High Court of Bombay at Goa',
      city: 'Panaji, Goa',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'The ethical grounding, debate society, and oratorical discipline I received at Nirakar High School shaped my entire career in constitutional and public interest law.',
      adminNotes: JSON.stringify({ category: 'law', accolade: 'High Court of Bombay at Goa • Bar Council Leader' }),
      verificationLevel: 'VERIFIED' as const,
    },
    {
      username: 'dr_suman_gaonkar',
      email: 'dr.suman.gaonkar@alumni.nirakar.org',
      firstName: 'Dr. Suman',
      lastName: 'Gaonkar',
      school: 'TUDAL_HS' as const,
      batchYear: 2002,
      occupation: 'Chief Medical Officer, Directorate of Health Services',
      city: 'Margao, Goa',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: 'Growing up in rural Gaondongrem, Tudal High School provided the vital academic foundation, science encouragement, and scholarships that enabled my medical journey.',
      adminNotes: JSON.stringify({ category: 'health', accolade: 'Directorate of Health Services, Goa • Public Health Pioneer' }),
      verificationLevel: 'VERIFIED' as const,
    },
    {
      username: 'neha_prabhu_irs',
      email: 'neha.prabhu@alumni.nirakar.org',
      firstName: 'Neha',
      lastName: 'Prabhu, IRS',
      school: 'ANGLE_HSS' as const,
      batchYear: 2011,
      occupation: 'Assistant Commissioner, Indian Revenue Service',
      city: 'New Delhi / Goa',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      bio: 'The rigorous academic standards, competitive mentorship, and guidance from S. S. Angle Higher Secondary laid the bedrock for clearing the UPSC Civil Services Examination.',
      adminNotes: JSON.stringify({ category: 'civil', accolade: 'UPSC Civil Services • Ministry of Finance, Govt of India' }),
      verificationLevel: 'TRUSTED' as const,
    },
    {
      username: 'rahul_mashemkar',
      email: 'rahul.mashemkar@alumni.nirakar.org',
      firstName: 'Rahul',
      lastName: 'Mashemkar',
      school: 'NIRAKAR_HS' as const,
      batchYear: 2008,
      occupation: 'Principal Cloud Infrastructure Architect',
      city: 'Bengaluru, India',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      bio: 'From practical physics experiments in Mashem to engineering planetary-scale cloud systems, Nirakar teachers instilled a lifelong passion for technology and innovation.',
      adminNotes: JSON.stringify({ category: 'tech', accolade: 'Principal Enterprise Architect • Cloud & Distributed Systems' }),
      verificationLevel: 'VERIFIED' as const,
    },
    {
      username: 'prof_rajesh_desai',
      email: 'rajesh.desai@alumni.nirakar.org',
      firstName: 'Prof. Rajesh',
      lastName: 'Phal Dessai',
      school: 'NIRAKAR_HS' as const,
      batchYear: 1989,
      occupation: 'Professor & Dean of Marine Sciences, Goa University',
      city: 'Taleigao Plateau, Goa',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      bio: 'My curiosity for oceanography began while observing the Talpona river estuary during school excursions. Nirakar faculty always encouraged scientific inquiry and research.',
      adminNotes: JSON.stringify({ category: 'academia', accolade: 'Dean, School of Earth & Ocean Sciences • National Scholar' }),
      verificationLevel: 'VERIFIED' as const,
    },
    {
      username: 'capt_vigneshwar_bhat',
      email: 'vigneshwar.bhat@alumni.nirakar.org',
      firstName: 'Capt. Vigneshwar',
      lastName: 'Bhat',
      school: 'ANGLE_HSS' as const,
      batchYear: 2005,
      occupation: 'Master Mariner & Port Operations Commander',
      city: 'Mormugao / Singapore',
      photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
      bio: 'Discipline, team leadership on the volleyball court, and focused study during Higher Secondary years at Maxem steered my maritime career across international oceans.',
      adminNotes: JSON.stringify({ category: 'defence', accolade: 'Master Mariner • Foreign Going Vessel Command' }),
      verificationLevel: 'VERIFIED' as const,
    },
    {
      username: 'pooja_gaonkar',
      email: 'pooja.gaonkar@alumni.nirakar.org',
      firstName: 'Pooja',
      lastName: 'Gaonkar',
      school: 'TUDAL_HS' as const,
      batchYear: 2014,
      occupation: 'Forest Range Officer & Wildlife Biologist',
      city: 'Cotigao Sanctuary, Canacona',
      photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
      bio: 'Tudal High School taught us reverence for the Western Ghats and native biodiversity. Protecting our indigenous forests today feels like continuing that classroom lesson.',
      adminNotes: JSON.stringify({ category: 'civil', accolade: 'Goa Forest Department • Wildlife Conservation Lead' }),
      verificationLevel: 'VERIFIED' as const,
    },
    {
      username: 'ananya_naik_ca',
      email: 'ananya.naik@alumni.nirakar.org',
      firstName: 'Ananya',
      lastName: 'Naik, CA',
      school: 'ANGLE_HSS' as const,
      batchYear: 2016,
      occupation: 'Chartered Accountant & Corporate Finance Lead',
      city: 'Mumbai, India',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      bio: 'S.S. Angle HSS Commerce faculty gave rural students exceptional clarity in accountancy and financial law, enabling us to compete and rank at national ICAI levels.',
      adminNotes: JSON.stringify({ category: 'tech', accolade: 'All-India ICAI Merit Ranker • Corporate Finance' }),
      verificationLevel: 'VERIFIED' as const,
    },
  ];

  for (const item of alumniData) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: item.email }, { username: item.username }],
      },
    });

    let userId = existingUser?.id;

    if (!existingUser) {
      const newUser = await prisma.user.create({
        data: {
          email: item.email,
          username: item.username,
          passwordHash: defaultPassword,
          role: 'ALUMNI',
        },
      });
      userId = newUser.id;
    }

    if (!userId) continue;

    await prisma.alumniProfile.upsert({
      where: { userId },
      update: {
        firstName: item.firstName,
        lastName: item.lastName,
        school: item.school,
        batchYear: item.batchYear,
        occupation: item.occupation,
        city: item.city,
        photoUrl: item.photoUrl,
        bio: item.bio,
        adminNotes: item.adminNotes,
        verificationLevel: item.verificationLevel,
      },
      create: {
        userId,
        firstName: item.firstName,
        lastName: item.lastName,
        school: item.school,
        batchYear: item.batchYear,
        occupation: item.occupation,
        city: item.city,
        photoUrl: item.photoUrl,
        bio: item.bio,
        adminNotes: item.adminNotes,
        verificationLevel: item.verificationLevel,
      },
    });

    console.log(`✓ Seeded Alumni: ${item.firstName} ${item.lastName} (${item.school}, Class of ${item.batchYear})`);
  }

  const finalCount = await prisma.alumniProfile.count();
  console.log(`Done! Total verified alumni profiles in DB: ${finalCount}`);
}

seedAlumni()
  .catch((err) => {
    console.error('Failed to seed alumni:', err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
