import { slugify } from '../utils/slugify.js';

export interface AlumniRecord {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  school: 'NIRAKAR_HS' | 'TUDAL_HS' | 'ANGLE_HSS';
  schoolName: string;
  batchYear: number;
  occupation: string;
  city: string;
  photoUrl: string;
  bio: string;
  verificationLevel: 'VERIFIED_GRADUATE' | 'TRUSTED' | 'VERIFIED';
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
    googleScholar?: string;
    researchGate?: string;
    email?: string;
  };
  familyMembers?: Array<{
    id: string;
    name: string;
    relation: string;
    photoUrl?: string;
  }>;
  vouches?: Array<{
    id: string;
    voucher: { username: string };
    note?: string;
  }>;
  user?: {
    username: string;
  };
}

export const COMPREHENSIVE_ALUMNI: AlumniRecord[] = [
  {
    id: 'alm-1',
    firstName: 'Prashant',
    lastName: 'Kankonkar',
    school: 'NIRAKAR_HS',
    schoolName: 'Shri Nirakar Vidyalaya',
    batchYear: 1996,
    occupation: 'Senior Technical Lead & Cloud Architect',
    city: 'Panaji, Goa',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    bio: 'Proud alumnus of Shri Nirakar Vidyalaya (Batch of 1996). The deep foundations of mathematics, science labs, and community discipline instilled by our dedicated teachers shaped my two-decade engineering journey across global distributed systems and cloud platforms in Goa and Bengaluru.\n\nCurrently mentoring rural Goan youth in open-source software, competitive coding, and technology entrepreneurship.',
    verificationLevel: 'VERIFIED_GRADUATE',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/prashant-kankonkar',
      twitter: 'https://x.com/prashant_k',
      github: 'https://github.com/prashant-k',
      website: 'https://prashantk.dev',
    },
    familyMembers: [
      {
        id: 'fam-1',
        name: 'Gaurish Kankonkar',
        relation: 'Brother (Class of 1999 • Nirakar HS)',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      },
      {
        id: 'fam-2',
        name: 'Sunita Kankonkar',
        relation: 'Mother (Former PTA President • 1994–1998)',
      },
    ],
    vouches: [
      { id: 'v-1', voucher: { username: 'adv_aditya_desai' } },
      { id: 'v-2', voucher: { username: 'sachin-velip' } },
    ],
    user: { username: 'prashant-kankonkar' },
  },
  {
    id: 'alm-2',
    firstName: 'Dr. Neha',
    lastName: 'Phaldessai',
    school: 'ANGLE_HSS',
    schoolName: 'S. S. Angle Higher Secondary School',
    batchYear: 2004,
    occupation: 'Pediatric Surgeon & Assistant Professor',
    city: 'Goa Medical College (GMC), Bambolim',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    bio: 'Completed my Higher Secondary Science stream with Distinction at S. S. Angle Higher Secondary School, Dapot (Class of 2004). The intense laboratory mentorship, pre-medical motivation from my professors, and science exhibition guidance propelled me to crack the Goa Medical entrance examination on my first attempt.\n\nDedicated to serving children across rural Goa through advanced pediatric surgery, clinical education at GMC Bambolim, and neonatal healthcare camps in Canacona taluka.',
    verificationLevel: 'VERIFIED_GRADUATE',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/dr-neha-phaldessai',
      googleScholar: 'https://scholar.google.com/citations?user=neha_phaldessai',
      researchGate: 'https://researchgate.net/profile/Neha-Phaldessai',
    },
    familyMembers: [
      {
        id: 'fam-3',
        name: 'Dr. Rohan Phaldessai',
        relation: 'Spouse & Medical Colleague',
        photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
      },
    ],
    vouches: [{ id: 'v-3', voucher: { username: 'dr_suman_gaonkar' } }],
    user: { username: 'neha-phaldessai' },
  },
  {
    id: 'alm-3',
    firstName: 'Sachin',
    lastName: 'Velip',
    school: 'TUDAL_HS',
    schoolName: 'Tudal High School',
    batchYear: 2008,
    occupation: 'Deputy Collector & State Civil Services Officer',
    city: 'Margao, South Goa',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    bio: 'Hailing from the rural village of Gaondongrem, Tudal High School was the sacred temple of knowledge that ignited my passion for public administration and societal upliftment. The selfless educators at Tudal provided free evening remedial coaching, books, and oratorical mentoring that allowed a village student to top Goa University and clear the Goa Public Service Commission (GPSC) Civil Services.\n\nCommitted to transparent revenue administration, tribal community welfare, and forest rights empowerment across South Goa.',
    verificationLevel: 'VERIFIED_GRADUATE',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/sachin-velip-goa',
      twitter: 'https://x.com/sachinvelip',
    },
    user: { username: 'sachin-velip' },
  },
  {
    id: 'alm-4',
    firstName: 'Anjali',
    lastName: 'Desai',
    school: 'ANGLE_HSS',
    schoolName: 'S. S. Angle Higher Secondary School',
    batchYear: 2012,
    occupation: 'Chartered Accountant & Financial Consultant',
    city: 'Mumbai, Maharashtra',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    bio: 'Graduated from S. S. Angle Higher Secondary School with state-level distinction in Commerce, Accountancy, and Economics (Class of 2012). Qualified as a Chartered Accountant in 2017 with All-India merit rank.\n\nProviding advisory services in corporate tax structuring, startup valuations, and financial audit across Mumbai and Goa.',
    verificationLevel: 'VERIFIED_GRADUATE',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/anjali-desai-ca',
      twitter: 'https://x.com/anjalidesai',
      website: 'https://anjalidesai.in',
    },
    user: { username: 'anjali-desai' },
  },
  {
    id: 'alm-5',
    firstName: 'Rohit',
    lastName: 'Komarpant',
    school: 'NIRAKAR_HS',
    schoolName: 'Shri Nirakar Vidyalaya',
    batchYear: 2015,
    occupation: 'Aerospace Systems Engineer',
    city: 'Bengaluru, Karnataka',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    bio: 'From the computer laboratory of Shri Nirakar Vidyalaya to leading avionics propulsion simulations for commercial aircraft. Forever grateful to the mathematics and physics faculty at Nirakar who nurtured my childhood curiosity in rocketry and aerodynamics.',
    verificationLevel: 'VERIFIED_GRADUATE',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/rohit-komarpant',
      github: 'https://github.com/rohit-komarpant',
      twitter: 'https://x.com/rohit_aero',
    },
    user: { username: 'rohit-komarpant' },
  },
  {
    id: 'alm-6',
    firstName: 'Pooja',
    lastName: 'Gaonkar',
    school: 'TUDAL_HS',
    schoolName: 'Tudal High School',
    batchYear: 2016,
    occupation: 'Environmental Research Fellow & Ecologist',
    city: 'Canacona & Western Ghats',
    photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=600&q=80',
    bio: 'Botanical and wildlife biodiversity researcher studying endemic Western Ghats flora and indigenous sustainable farming traditions in Cotigao Wildlife Sanctuary. Tudal High School fostered my passion for ecological conservation from my earliest school nature clubs.',
    verificationLevel: 'VERIFIED_GRADUATE',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/pooja-gaonkar-eco',
      researchGate: 'https://researchgate.net/profile/Pooja-Gaonkar',
      googleScholar: 'https://scholar.google.com/citations?user=pooja_gaonkar',
    },
    user: { username: 'pooja-gaonkar' },
  },
  {
    id: 'alm-7',
    firstName: 'Mahesh',
    lastName: 'Naik',
    school: 'NIRAKAR_HS',
    schoolName: 'Shri Nirakar Vidyalaya',
    batchYear: 2001,
    occupation: 'High Court Advocate & Legal Counsel',
    city: 'Altinho, Panaji, Goa',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
    bio: 'Practicing Advocate at the High Court of Bombay at Goa specializing in civil litigation, constitutional property rights, and community welfare petitions. Former General Secretary of the Nirakar Students Council.',
    verificationLevel: 'VERIFIED_GRADUATE',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/adv-mahesh-naik',
      twitter: 'https://x.com/adv_maheshnaik',
    },
    user: { username: 'mahesh-naik' },
  },
  {
    id: 'alm-8',
    firstName: 'Divya',
    lastName: 'Phaldessai',
    school: 'ANGLE_HSS',
    schoolName: 'S. S. Angle Higher Secondary School',
    batchYear: 2018,
    occupation: 'Data Scientist & AI Researcher',
    city: 'Pune, Maharashtra',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    bio: 'Developing conversational intelligence and natural language processing models for healthcare diagnostic assistance. Proud alumna of S. S. Angle Higher Secondary School where my journey into computer science began.',
    verificationLevel: 'VERIFIED_GRADUATE',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/divya-phaldessai-ai',
      github: 'https://github.com/divyaphaldessai',
      googleScholar: 'https://scholar.google.com/citations?user=divya_phaldessai',
    },
    user: { username: 'divya-phaldessai' },
  },
  {
    id: 'alm-9',
    firstName: 'Adv. Aditya',
    lastName: 'Desai',
    school: 'NIRAKAR_HS',
    schoolName: 'Shri Nirakar Vidyalaya',
    batchYear: 1994,
    occupation: 'Senior Advocate, High Court of Bombay at Goa',
    city: 'Panaji, Goa',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    bio: 'The ethical grounding, debate society, and oratorical discipline I received at Nirakar High School shaped my entire career in constitutional and public interest law in Goa.',
    verificationLevel: 'VERIFIED_GRADUATE',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/adv-aditya-desai',
      twitter: 'https://x.com/aditya_desai_law',
    },
    user: { username: 'adv_aditya_desai' },
  },
  {
    id: 'alm-10',
    firstName: 'Dr. Suman',
    lastName: 'Gaonkar',
    school: 'TUDAL_HS',
    schoolName: 'Tudal High School',
    batchYear: 2002,
    occupation: 'Chief Medical Officer, Directorate of Health Services',
    city: 'Margao, Goa',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    bio: 'Growing up in rural Gaondongrem, Tudal High School provided the vital academic foundation, science encouragement, and scholarships that enabled my medical journey.',
    verificationLevel: 'VERIFIED_GRADUATE',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/dr-suman-gaonkar',
      googleScholar: 'https://scholar.google.com/citations?user=dr_suman_gaonkar',
    },
    user: { username: 'dr_suman_gaonkar' },
  },
  {
    id: 'alm-11',
    firstName: 'Neha',
    lastName: 'Prabhu, IRS',
    school: 'ANGLE_HSS',
    schoolName: 'S. S. Angle Higher Secondary School',
    batchYear: 2011,
    occupation: 'Assistant Commissioner, Indian Revenue Service',
    city: 'New Delhi / Goa',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    bio: 'The rigorous academic standards, competitive mentorship, and guidance from S. S. Angle Higher Secondary laid the bedrock for clearing the UPSC Civil Services Examination.',
    verificationLevel: 'VERIFIED_GRADUATE',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/neha-prabhu-irs',
      twitter: 'https://x.com/neha_prabhu_irs',
    },
    user: { username: 'neha_prabhu_irs' },
  },
  {
    id: 'alm-12',
    firstName: 'Rahul',
    lastName: 'Mashemkar',
    school: 'NIRAKAR_HS',
    schoolName: 'Shri Nirakar Vidyalaya',
    batchYear: 2008,
    occupation: 'Principal Cloud Infrastructure Architect',
    city: 'Bengaluru, India',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    bio: 'Leading high-scale cloud infrastructure architecture. Forever indebted to the foundational mathematics and science educators at Nirakar Vidyalaya.',
    verificationLevel: 'VERIFIED_GRADUATE',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/rahul-mashemkar',
      github: 'https://github.com/rahul-mashemkar',
    },
    user: { username: 'rahul_mashemkar' },
  },
];

/**
 * Universal alumni finder that matches by username, ID, or slugified name.
 */
export function findAlumniByUsernameOrId(query: string | null | undefined): AlumniRecord | null {
  if (!query) return null;
  const q = decodeURIComponent(query).toLowerCase().trim();
  const slugQ = slugify(q);

  return (
    COMPREHENSIVE_ALUMNI.find((a) => (a.user?.username || '').toLowerCase() === q) ||
    COMPREHENSIVE_ALUMNI.find((a) => a.id.toLowerCase() === q) ||
    COMPREHENSIVE_ALUMNI.find((a) => slugify(`${a.firstName} ${a.lastName}`) === slugQ) ||
    COMPREHENSIVE_ALUMNI.find((a) => slugify(`${a.firstName} ${a.lastName}`) === q) ||
    COMPREHENSIVE_ALUMNI.find(
      (a) =>
        (a.user?.username || '').toLowerCase().includes(q) ||
        q.includes((a.user?.username || '').toLowerCase())
    ) ||
    COMPREHENSIVE_ALUMNI.find((a) => {
      const full = `${a.firstName} ${a.lastName}`.toLowerCase();
      return full.includes(q.replace(/[-_]/g, ' ')) || q.replace(/[-_]/g, ' ').includes(full);
    }) ||
    null
  );
}
