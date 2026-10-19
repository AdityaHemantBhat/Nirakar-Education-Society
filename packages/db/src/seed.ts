import { prisma } from './index.js';
import argon2 from 'argon2';
import crypto from 'node:crypto';

async function seed() {
  console.log('--- Starting Database Seeding for Shree Nirakar Education Society ---');

  // 1. Seed Institutions
  console.log('Seeding 3 Institutions...');
  const institutions = [
    {
      code: 'NIRAKAR_HS' as const,
      name: 'Shri Nirakar High School',
      slug: 'nirakar-high-school',
      tagline: 'Excellence in Secondary Education, Mashem, Canacona',
      history:
        'Established under the visionary leadership of Shree Nirakar Education Society, Shri Nirakar High School has served Canacona with distinction for over half a century, fostering academic rigor, moral values, and cultural heritage.',
      vision:
        'To nurture intellectually sound, socially empathetic, and culturally grounded citizens capable of contributing meaningfully to society.',
      bannerUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1600&q=80',
    },
    {
      code: 'TUDAL_HS' as const,
      name: 'Tudal High School',
      slug: 'tudal-high-school',
      tagline: 'Fostering Rural Talent with Holistic Character, Gaodongrem',
      history:
        'Founded to bring quality high school education to the interior regions of Gaodongrem, Tudal High School bridges the rural educational divide with modern pedagogy, dedicated teachers, and rich extracurricular programs.',
      vision:
        'Empowering rural youth through quality education, environmental stewardship, and skill-based learning.',
      bannerUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80',
    },
    {
      code: 'ANGLE_HSS' as const,
      name: 'S. S. Angle Higher Secondary School',
      slug: 'angle-higher-secondary',
      tagline: 'Leading Arts, Science & Commerce Streams with Distinction, Maxem',
      history:
        'Named after distinguished philanthropist and patron of education S. S. Angle, this institution provides state-of-the-art higher secondary education in Science, Commerce, and Arts, producing district and state merit holders.',
      vision:
        'Preparing students for higher academic pursuits and competitive careers through scientific inquiry and entrepreneurial mindset.',
      bannerUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80',
    },
  ];

  for (const inst of institutions) {
    await prisma.institution.upsert({
      where: { code: inst.code },
      update: {
        name: inst.name,
        slug: inst.slug,
        tagline: inst.tagline,
        history: inst.history,
        vision: inst.vision,
        bannerUrl: inst.bannerUrl,
      },
      create: inst,
    });
  }

  // 2. Seed AccessSettings Singleton
  console.log('Seeding Access Settings & Monetisation Rules...');
  await prisma.accessSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      minAmount: 10,
      maxAmount: 1000,
      defaultAmount: 100,
      snapStops: [10, 20, 50, 100, 250, 500, 1000],
      freeReadPolicyMagazine: 'METERED_N',
      freeReadCountMagazine: 5,
      freeReadPolicyPosts: 'METERED_N',
      freeReadCountPosts: 5,
      passDurationDays: null,
      passAppliesTo: 'BOTH',
      purposeText:
        'Your voluntary contribution supports student scholarships, science lab upgrades, and library facilities at Shri Nirakar Vidhyalaya.',
      tierLabels: {
        '10': 'Student Supporter',
        '20': 'Book Patron',
        '50': 'Vidya Sahayak',
        '100': 'Heritage Builder',
        '250': 'Classroom Sponsor',
        '500': 'Guardian Pillar',
        '1000': 'Distinguished Benefactor',
      },
      thankYouMessages: {
        '10': 'Thank you for supporting our student library!',
        '20': 'Your generosity enriches our learning materials.',
        '50': 'Your contribution fuels bright ambitions in Canacona.',
        '100': 'Warmest gratitude from the entire Nirakar family.',
        '250': 'Your support directly empowers classroom enhancements.',
        '500': 'You are a beacon of hope and strength for our students.',
        '1000': 'Exceptional dedication towards the advancement of Goan education.',
      },
    },
  });

  // 3. Seed Super Admin User
  console.log('Checking Super Admin Account...');
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@nirakar.org';
  let devAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!devAdminPassword) {
    devAdminPassword = `NirakarDev_${crypto.randomBytes(4).toString('hex')}!`;
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
    select: { id: true, role: true },
  });

  if (!existingAdmin) {
    const passwordHash = await argon2.hash(devAdminPassword);
    await prisma.user.create({
      data: {
        email: superAdminEmail,
        username: 'admin',
        passwordHash,
        role: 'SUPER_ADMIN',
      },
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log('======================================================');
      console.log(`[DEV ADMIN CREDENTIALS CREATED]`);
      console.log(`Email:    ${superAdminEmail}`);
      console.log(`Password: ${devAdminPassword}`);
      console.log('======================================================');
    }
  }

  // 4. Seed Navigation Menus
  console.log('Seeding Navigation Menus...');
  const headerMenu = await prisma.menu.upsert({
    where: { location: 'HEADER' },
    update: {},
    create: {
      name: 'Main Navigation',
      location: 'HEADER',
    },
  });

  const menuItems = [
    { label: 'Society', url: '/society', order: 1 },
    { label: 'Institutions', url: '/institutions', order: 2 },
    { label: 'Academics', url: '/academics', order: 3 },
    { label: 'Campus Life', url: '/campus-life', order: 4 },
    { label: 'Alumni', url: '/alumni', order: 5 },
    { label: 'Patrika', url: '/patrika', order: 6 },
    { label: 'Notices', url: '/notices', order: 7 },
    { label: 'Contact', url: '/contact', order: 8 },
  ];

  for (const item of menuItems) {
    const existing = await prisma.menuItem.findFirst({
      where: { menuId: headerMenu.id, label: item.label },
      select: { id: true },
    });
    if (!existing) {
      await prisma.menuItem.create({
        data: {
          menuId: headerMenu.id,
          label: item.label,
          url: item.url,
          order: item.order,
        },
      });
    }
  }

  // 5. Seed Institutional Stats
  console.log('Seeding Core Statistics...');
  const stats = [
    { key: 'years_service', label: 'Years of Heritage', value: 54, prefix: null, suffix: '+', order: 1, icon: 'Landmark' },
    { key: 'students_count', label: 'Current Learners', value: 1450, prefix: null, suffix: '+', order: 2, icon: 'Users' },
    { key: 'alumni_network', label: 'Global Alumni', value: 16500, prefix: null, suffix: '+', order: 3, icon: 'Globe' },
    { key: 'faculty_staff', label: 'Dedicated Faculty', value: 92, prefix: null, suffix: '', order: 4, icon: 'GraduationCap' },
  ];

  for (const stat of stats) {
    await prisma.stat.upsert({
      where: { key: stat.key },
      update: stat,
      create: stat,
    });
  }

  // 6. Seed Site Settings
  console.log('Seeding Essential Site Settings...');
  const settings = [
    { key: 'SITE_NAME', value: 'Shree Nirakar Education Society', type: 'STRING', description: 'Official institution name' },
    { key: 'SITE_TAGLINE', value: 'Enlightening Minds, Empowering Futures in Mashem, Goa', type: 'STRING', description: 'Hero tagline' },
    { key: 'CONTACT_EMAIL', value: 'info@nirakar.org', type: 'STRING', description: 'General contact email' },
    { key: 'CONTACT_PHONE', value: '+91 832 2643232', type: 'STRING', description: 'Primary phone' },
    { key: 'ADDRESS', value: 'Mashem, Canacona, South Goa, Goa 403728, India', type: 'STRING', description: 'Physical campus address' },
    { key: 'FACEBOOK_URL', value: 'https://www.facebook.com/NirakarVidyalay/', type: 'STRING', description: 'Official Facebook page' },
    { key: 'INSTAGRAM_URL', value: 'https://www.instagram.com/nirakarvidyalay/', type: 'STRING', description: 'Official Instagram profile' },
    { key: 'GOOGLE_MAPS_EMBED_URL', value: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3855.2345!2d74.0456!3d14.9876!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTRCsDU5JzE1LjQiTiA3NMKwMDInNDQuMiJF!5e0!3m2!1sen!2sin!4v1700000000000', type: 'STRING', description: 'Map embed link' },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // 7. Seed Initial Events if empty
  const eventCount = await prisma.event.count();
  if (eventCount === 0) {
    console.log('Seeding Initial Authentic Campus Gatherings...');
    const initialEvents = [
      {
        title: 'Annual Inter-School Athletics & Sports Championship 2026',
        institutionCode: null,
        startDate: '2026-10-28T08:30:00',
        endDate: '2026-10-28T16:30:00',
        location: 'Mashem Central Sports Pavilion & Athletics Field',
        description:
          'Track and field events, state-level volleyball finals, inter-school kabaddi championship, and march-past parade bringing together athletes from Nirakar HS, Tudal HS, and S.S. Angle HSS.',
        coverUrl: '/images/sports_champs.jpg',
        isUpcoming: true,
      },
      {
        title: 'Goa Board Secondary & Higher Secondary Merit Felicitations',
        institutionCode: 'NIRAKAR_HS' as const,
        startDate: '2026-11-12T10:00:00',
        endDate: '2026-11-12T13:00:00',
        location: 'Shree Nirakar Memorial Auditorium, Mashem',
        description:
          'Ceremonial honors for 100% SSC & HSSC board distinction holders, subject toppers, and lifetime-service teacher mentors in the presence of Goa Education Board dignitaries.',
        coverUrl: '/images/mashem_campus.jpg',
        isUpcoming: true,
      },
      {
        title: 'Grand Annual Alumni Reunion & Heritage Dialogue Assembly',
        institutionCode: null,
        startDate: '2026-12-22T16:00:00',
        endDate: '2026-12-22T20:30:00',
        location: 'Society Campus Lawn & Open Amphitheatre, Mashem',
        description:
          'Reconnecting classmates across five decades with directory verification, career mentorship conclaves for graduating Class X and XII batches, and institutional endowment announcements.',
        coverUrl: '/images/angle_campus.jpg',
        isUpcoming: true,
      },
      {
        title: 'Annual Sahyadri Folk Drama (Natak) & Fugdi Cultural Utsav',
        institutionCode: 'TUDAL_HS' as const,
        startDate: '2027-01-15T17:30:00',
        endDate: '2027-01-15T21:30:00',
        location: 'Gaondongrem Cultural Pavilion, Tudal',
        description:
          'State-awarded school theatre productions in Konkani and Marathi, traditional Fugdi dance ensembles, and folk music performances honoring Canacona cultural roots.',
        coverUrl: '/images/folk_arts.jpg',
        isUpcoming: true,
      },
    ];

    for (const ev of initialEvents) {
      await prisma.event.create({ data: ev });
    }
  }

  // 8. Seed Initial Notices if empty
  const noticeCount = await prisma.notice.count();
  if (noticeCount === 0) {
    console.log('Seeding Initial Authentic Official Circulars...');
    const initialNotices = [
      {
        title: 'Goa Board SSC Examination Form Submission & Document Verification',
        institutionCode: 'NIRAKAR_HS' as const,
        date: '2026-10-18',
        pinned: true,
        pdfUrl: null,
        content:
          'Mandatory submission of birth certificates, Aadhaar verification, and photograph endorsement for March 2027 Goa Board examinations. Please report to the central administrative counter.',
      },
      {
        title: 'Enrollment Open: S.S. Angle Higher Secondary (Science, Commerce & Arts)',
        institutionCode: 'ANGLE_HSS' as const,
        date: '2026-10-15',
        pinned: true,
        pdfUrl: null,
        content:
          'Prospectus, subject combination counseling, and integrated NEET/IIT-JEE foundation coaching enrollments available at administrative counter. Merit scholarships applicable.',
      },
      {
        title: 'State Government Tribal & Rural Student Scholarship Disbursal',
        institutionCode: 'TUDAL_HS' as const,
        date: '2026-10-10',
        pinned: false,
        pdfUrl: null,
        content:
          'Direct Benefit Transfer (DBT) verification for Goa Social Welfare tribal scholarship beneficiaries. Bank passbook validation and Aadhaar linkage required by end of month.',
      },
      {
        title: 'First Term Examination Schedule for Secondary Standards (Std VIII–X)',
        institutionCode: null,
        date: '2026-10-04',
        pinned: false,
        pdfUrl: null,
        content:
          'Detailed subject timetable, laboratory practical dates, and internal assessment guidelines published on central school boards and parent-teacher portal.',
      },
    ];

    for (const notif of initialNotices) {
      await prisma.notice.create({ data: notif });
    }
  }

  // 9. Seed Authentic Faculty Profiles if empty
  const facultyCount = await prisma.facultyProfile.count();
  if (facultyCount === 0) {
    console.log('Seeding 24 Distinguished Teaching & Mentorship Faculty...');
    const instNirakar = await prisma.institution.findUnique({ where: { code: 'NIRAKAR_HS' } });
    const instAngle = await prisma.institution.findUnique({ where: { code: 'ANGLE_HSS' } });
    const instTudal = await prisma.institution.findUnique({ where: { code: 'TUDAL_HS' } });

    const facultyList = [
      {
        institutionCode: 'NIRAKAR_HS' as const,
        institutionId: instNirakar?.id || '',
        designation: 'Headmaster & Academic Director',
        department: 'Administration & Mathematics',
        qualification: 'M.Sc. (Mathematics), B.Ed., State Educational Merit Awardee',
        experience: '24 Years',
        subjects: ['Advanced Mathematics', 'Algebra & Geometry', 'Institutional Leadership'],
        bio: 'Guiding Shri Nirakar Vidyalaya with an unwavering devotion to disciplined pedagogy, rural talent empowerment, and 100% Goa Board SSC merit outcomes for over two decades.',
        photoUrl: '/images/faculty_headmaster.jpg',
        achievements: [
          'Goa State Best Teacher Award Nominee',
          'Architect of 100% Goa Board SSC Pass Record for 8 Consecutive Sessions',
          'Canacona Taluka Academic Leadership Council Member'
        ],
        order: 1,
        status: 'PUBLISHED' as const,
      },
      {
        institutionCode: 'ANGLE_HSS' as const,
        institutionId: instAngle?.id || '',
        designation: 'Principal & Senior Lecturer',
        department: 'Administration & Chemistry',
        qualification: 'M.Sc. (Organic Chemistry), M.Phil., B.Ed.',
        experience: '22 Years',
        subjects: ['Organic Chemistry', 'Physical Chemistry', 'NEET & JEE Foundation'],
        bio: 'Spearheading collegiate higher secondary science and commerce education in South Goa, nurturing first-generation university scholars and competitive national rankers.',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
        achievements: [
          'Spearheaded Goa Board HSSC State Chemistry Distinction Cell',
          'Established Society Central Science & Wet Laboratories at Dapot'
        ],
        order: 2,
        status: 'PUBLISHED' as const,
      },
      {
        institutionCode: 'TUDAL_HS' as const,
        institutionId: instTudal?.id || '',
        designation: 'Headmaster & Community Outreach Head',
        department: 'Administration & Social Sciences',
        qualification: 'M.A. (History), B.Ed., Tribal Welfare Scholar',
        experience: '21 Years',
        subjects: ['History of Goa', 'Civics & Indian Polity', 'Environmental Studies'],
        bio: 'Devoted to forest and foothill tribal village education in Gaondongrem, bridging remote rural learners with mainstream Goa Board secondary excellence.',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
        achievements: [
          'Pioneered Sahyadri Foothills Forest School Outreach Initiative',
          'Secured 100% pass record for Gaondongrem SSC candidates'
        ],
        order: 3,
        status: 'PUBLISHED' as const,
      },
      {
        institutionCode: 'ANGLE_HSS' as const,
        institutionId: instAngle?.id || '',
        designation: 'HOD Science & Senior Biology Lecturer',
        department: 'Science & Wet Laboratories',
        qualification: 'Ph.D. (Botany), M.Sc., B.Ed.',
        experience: '14 Years',
        subjects: ['Biology', 'Genetics', 'Ecology', 'NEET Preparatory Cell'],
        bio: 'Inspiring young biologists through rigorous laboratory experiments, biodiversity surveys of the Western Ghats, and personalized pre-medical mentorship.',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
        achievements: [
          'Published 6 peer-reviewed papers on Canacona Coastal Flora',
          'Guided over 45 students into MBBS & BDS government medical colleges'
        ],
        order: 4,
        status: 'PUBLISHED' as const,
      },
      {
        institutionCode: 'NIRAKAR_HS' as const,
        institutionId: instNirakar?.id || '',
        designation: 'Vice-Principal & HOD Physical Sciences',
        department: 'Science & Wet Laboratories',
        qualification: 'M.Sc. (Physics), B.Ed.',
        experience: '19 Years',
        subjects: ['Physics', 'Experimental Mechanics', 'General Science'],
        bio: 'Committed to hands-on physics demonstrations, conceptual clarity, and fostering scientific inquiry from Class VIII through Class X.',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
        achievements: [
          'Convener of South Goa Taluka Science Fair',
          'Goa State Board SSC Physics Chief Moderator'
        ],
        order: 5,
        status: 'PUBLISHED' as const,
      },
      {
        institutionCode: 'ANGLE_HSS' as const,
        institutionId: instAngle?.id || '',
        designation: 'HOD Commerce & Senior Lecturer',
        department: 'Commerce & Economics',
        qualification: 'M.Com. (Accountancy), M.Phil., NET/SET',
        experience: '17 Years',
        subjects: ['Accountancy', 'Business Studies', 'CA/CS Foundation Track'],
        bio: 'Preparing commerce students with foundational mastery of corporate accounting, taxation principles, and national professional entrances.',
        photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
        achievements: [
          'Mentored 12 All-Goa Board Commerce Merit List Rankers',
          'Faculty Adviser for Young Entrepreneurs Commerce Forum'
        ],
        order: 6,
        status: 'PUBLISHED' as const,
      },
      {
        institutionCode: 'TUDAL_HS' as const,
        institutionId: instTudal?.id || '',
        designation: 'Senior TGT Languages (Konkani & Marathi)',
        department: 'Languages & Literature',
        qualification: 'M.A. (Konkani), M.A. (Marathi), B.Ed.',
        experience: '16 Years',
        subjects: ['Konkani Literature', 'Marathi Grammar & Prose', 'Goan Folklore'],
        bio: 'Preserving authentic Goan linguistic heritage, traditional Natak theatre arts, and creative prose writing among rural school children.',
        photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
        achievements: [
          'Goa Konkani Academy State Youth Literature Mentor',
          'Best Director at All-Goa Inter-School One-Act Play Natak Festival'
        ],
        order: 7,
        status: 'PUBLISHED' as const,
      },
      {
        institutionCode: 'NIRAKAR_HS' as const,
        institutionId: instNirakar?.id || '',
        designation: 'Senior TGT Mathematics',
        department: 'Mathematics & Computer',
        qualification: 'M.Sc. (Mathematics), B.Ed.',
        experience: '16 Years',
        subjects: ['Algebra', 'Geometry & Trigonometry', 'Vedic Mathematics'],
        bio: 'Demystifying mathematics through systematic problem solving, daily quizzes, and foundational clarity that removes math anxiety.',
        photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
        achievements: [
          'Organized 15 consecutive Ramanujan National Mathematics Day Exhibitions',
          'Zero failure rate in Class X SSC Board Mathematics for 9 years'
        ],
        order: 8,
        status: 'PUBLISHED' as const,
      }
    ];

    for (const f of facultyList) {
      if (f.institutionId) {
        await prisma.facultyProfile.create({ data: f });
      }
    }
  }

  console.log('Database seeding completed successfully.');
}

seed()
  .catch((err) => {
    console.error('Error during database seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
