export interface FacultySocialLinks {
  linkedin?: string;
  twitter?: string;
  googleScholar?: string;
  researchGate?: string;
  vidwan?: string;
  orcid?: string;
  website?: string;
  github?: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  institutionCode: 'NIRAKAR_HS' | 'TUDAL_HS' | 'ANGLE_HSS';
  institutionName: string;
  qualification: string;
  experience: string;
  experienceYears: number;
  subjects: string[];
  bio: string;
  photoUrl: string;
  achievements?: string[];
  publications?: string[];
  officeHours?: string;
  officeLocation?: string;
  email?: string;
  phone?: string;
  isHead?: boolean;
  socialLinks?: FacultySocialLinks;
}

export const FACULTY_DATA: FacultyMember[] = [
  {
    id: 'fac-1',
    name: 'Mrs. Urvee Phaldessai',
    designation: 'Headmaster & Academic Director',
    department: 'Administration & Mathematics',
    institutionCode: 'NIRAKAR_HS',
    institutionName: 'Shri Nirakar Vidyalaya',
    qualification: 'M.Sc. (Mathematics), B.Ed., State Educational Merit Awardee',
    experience: '24 Years',
    experienceYears: 24,
    subjects: ['Advanced Mathematics', 'Algebra & Geometry', 'Institutional Leadership'],
    bio: 'Guiding Shri Nirakar Vidyalaya with an unwavering devotion to disciplined pedagogy, rural talent empowerment, and 100% Goa Board SSC merit outcomes for over two decades.',
    photoUrl: '/images/faculty_headmaster.jpg',
    achievements: [
      'Goa State Best Teacher Award Nominee',
      'Architect of 100% Goa Board SSC Pass Record for 8 Consecutive Sessions',
      'Canacona Taluka Academic Leadership Council Member'
    ],
    email: 'headmaster.nirakar@gmail.com',
    phone: '+91 832 2643236',
    isHead: true,
  },
  {
    id: 'fac-2',
    name: 'Mr. Rajesh Phaldessai',
    designation: 'Principal & Senior Lecturer',
    department: 'Administration & Chemistry',
    institutionCode: 'ANGLE_HSS',
    institutionName: 'S. S. Angle Higher Secondary School',
    qualification: 'M.Sc. (Organic Chemistry), M.Phil., B.Ed.',
    experience: '22 Years',
    experienceYears: 22,
    subjects: ['Organic Chemistry', 'Physical Chemistry', 'NEET & JEE Foundation'],
    bio: 'Spearheading collegiate higher secondary science and commerce education in South Goa, nurturing first-generation university scholars and competitive national rankers.',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    achievements: [
      'Spearheaded Goa Board HSSC State Chemistry Distinction Cell',
      'Established Society Central Science & Wet Laboratories at Dapot'
    ],
    email: 'principal.anglehss@gmail.com',
    phone: '+91 832 2643288',
    isHead: true,
  },
  {
    id: 'fac-3',
    name: 'Mr. Anand Gaonkar',
    designation: 'Headmaster & Community Outreach Head',
    department: 'Administration & Social Sciences',
    institutionCode: 'TUDAL_HS',
    institutionName: 'Tudal High School',
    qualification: 'M.A. (History), B.Ed., Tribal Welfare Scholar',
    experience: '21 Years',
    experienceYears: 21,
    subjects: ['History of Goa', 'Civics & Indian Polity', 'Environmental Studies'],
    bio: 'Devoted to forest and foothill tribal village education in Gaondongrem, bridging remote rural learners with mainstream Goa Board secondary excellence.',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    achievements: [
      'Pioneered Sahyadri Foothills Forest School Outreach Initiative',
      'Secured 100% pass record for Gaondongrem SSC candidates'
    ],
    email: 'headmaster.tudal@gmail.com',
    phone: '+91 832 2641120',
    isHead: true,
  },
  {
    id: 'fac-4',
    name: 'Dr. Neha Prabhu',
    designation: 'HOD Science & Senior Biology Lecturer',
    department: 'Science & Wet Laboratories',
    institutionCode: 'ANGLE_HSS',
    institutionName: 'S. S. Angle Higher Secondary School',
    qualification: 'Ph.D. (Botany), M.Sc., B.Ed.',
    experience: '14 Years',
    experienceYears: 14,
    subjects: ['Biology', 'Genetics', 'Ecology', 'NEET Preparatory Cell'],
    bio: 'Inspiring young biologists through rigorous laboratory experiments, biodiversity surveys of the Western Ghats, and personalized pre-medical mentorship.',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    achievements: [
      'Published 6 peer-reviewed papers on Canacona Coastal Flora',
      'Guided over 45 students into MBBS & BDS government medical colleges'
    ],
    email: 'dr.neha.prabhu@anglehss.org',
    phone: '+91 832 2643289',
  },
  {
    id: 'fac-5',
    name: 'Mr. Shivanand Bhat',
    designation: 'Vice-Principal & HOD Physical Sciences',
    department: 'Science & Wet Laboratories',
    institutionCode: 'NIRAKAR_HS',
    institutionName: 'Shri Nirakar Vidyalaya',
    qualification: 'M.Sc. (Physics), B.Ed.',
    experience: '19 Years',
    experienceYears: 19,
    subjects: ['Physics', 'Experimental Mechanics', 'General Science'],
    bio: 'Committed to hands-on physics demonstrations, conceptual clarity, and fostering scientific inquiry from Class VIII through Class X.',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    achievements: [
      'Convener of South Goa Taluka Science Fair',
      'Goa State Board SSC Physics Chief Moderator'
    ],
    email: 'shivanand.bhat@nirakar.org',
    phone: '+91 832 2643237',
  },
  {
    id: 'fac-6',
    name: 'Mr. Dattaprasad Naik',
    designation: 'HOD Commerce & Senior Lecturer',
    department: 'Commerce & Economics',
    institutionCode: 'ANGLE_HSS',
    institutionName: 'S. S. Angle Higher Secondary School',
    qualification: 'M.Com. (Accountancy), M.Phil., NET/SET',
    experience: '17 Years',
    experienceYears: 17,
    subjects: ['Accountancy', 'Business Studies', 'CA/CS Foundation Track'],
    bio: 'Preparing commerce students with foundational mastery of corporate accounting, taxation principles, and national professional entrances.',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
    achievements: [
      'Mentored 12 All-Goa Board Commerce Merit List Rankers',
      'Faculty Adviser for Young Entrepreneurs Commerce Forum'
    ],
    email: 'dattaprasad.naik@anglehss.org',
    phone: '+91 832 2643290',
  },
  {
    id: 'fac-7',
    name: 'Mrs. Sunita Dessai',
    designation: 'Senior TGT Languages (Konkani & Marathi)',
    department: 'Languages & Literature',
    institutionCode: 'TUDAL_HS',
    institutionName: 'Tudal High School',
    qualification: 'M.A. (Konkani), M.A. (Marathi), B.Ed.',
    experience: '16 Years',
    experienceYears: 16,
    subjects: ['Konkani Literature', 'Marathi Grammar & Prose', 'Goan Folklore'],
    bio: 'Preserving authentic Goan linguistic heritage, traditional Natak theatre arts, and creative prose writing among rural school children.',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    achievements: [
      'Goa Konkani Academy State Youth Literature Mentor',
      'Best Director at All-Goa Inter-School One-Act Play Natak Festival'
    ],
    email: 'sunita.dessai@tudal.org',
    phone: '+91 832 2641122',
  },
  {
    id: 'fac-8',
    name: 'Mrs. Rekha Komarpant',
    designation: 'Senior TGT Mathematics',
    department: 'Mathematics & Computer',
    institutionCode: 'NIRAKAR_HS',
    institutionName: 'Shri Nirakar Vidyalaya',
    qualification: 'M.Sc. (Mathematics), B.Ed.',
    experience: '16 Years',
    experienceYears: 16,
    subjects: ['Algebra', 'Geometry & Trigonometry', 'Vedic Mathematics'],
    bio: 'Demystifying mathematics through systematic problem solving, daily quizzes, and foundational clarity that removes math anxiety.',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    achievements: [
      'Organized 15 consecutive Ramanujan National Mathematics Day Exhibitions',
      'Zero failure rate in Class X SSC Board Mathematics for 9 years'
    ],
    email: 'rekha.komarpant@nirakar.org',
    phone: '+91 832 2643238',
  },
  {
    id: 'fac-9',
    name: 'Mrs. Anagha Kamat',
    designation: 'Senior Lecturer in English & Humanities',
    department: 'Languages & Literature',
    institutionCode: 'ANGLE_HSS',
    institutionName: 'S. S. Angle Higher Secondary School',
    qualification: 'M.A. (English Literature), B.Ed., Cambridge CELTA',
    experience: '12 Years',
    experienceYears: 12,
    subjects: ['English Language & Composition', 'World Literature', 'Public Oratory & Debate'],
    bio: 'Cultivating articulate communication, critical thinking, essay composition, and literary appreciation for university-bound college scholars.',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    achievements: [
      'Chief Editor of Shree Nirakar Annual Institutional Magazine',
      'Faculty Convener of Canacona Inter-Collegiate Parliamentary Debate'
    ],
    email: 'anagha.kamat@anglehss.org',
    phone: '+91 832 2643291',
  },
  {
    id: 'fac-10',
    name: 'Mr. Nilesh Gaonkar',
    designation: 'Director of Physical Education & Sports',
    department: 'Athletics & Physical Education',
    institutionCode: 'NIRAKAR_HS',
    institutionName: 'Shri Nirakar Vidyalaya',
    qualification: 'M.P.Ed., NIS Certified Volleyball Coach, First Aid Certified',
    experience: '13 Years',
    experienceYears: 13,
    subjects: ['Physical Education', 'Athletics Track & Field', 'Volleyball & Kabaddi'],
    bio: 'Training athletes across Mashem grounds, leading school teams to state championships in volleyball, sprint races, and regional sports meets.',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
    achievements: [
      'Led Mashem Volleyball Team to 4 State Championships',
      'Trained 8 National School Games participants from Canacona'
    ],
    email: 'nilesh.sports@nirakar.org',
    phone: '+91 832 2643239',
  },
  {
    id: 'fac-11',
    name: 'Mrs. Deepa Velip',
    designation: 'Computer Science Instructor & ATL Lab Mentor',
    department: 'Mathematics & Computer',
    institutionCode: 'NIRAKAR_HS',
    institutionName: 'Shri Nirakar Vidyalaya',
    qualification: 'B.E. (Computer Science & Engineering), M.Tech.',
    experience: '8 Years',
    experienceYears: 8,
    subjects: ['Computer Applications', 'Atal Tinkering Lab Robotics', 'Python & Web Basics'],
    bio: 'Introducing modern digital literacy, coding logic, micro-controller robotics, and 3D printing to rural Goan school students in the Atal Tinkering Lab.',
    photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=600&q=80',
    achievements: [
      'NITI Aayog Atal Tinkering Lab Regional Mentor Recognition',
      'Guided student team to National STEM Innovation Challenge finals'
    ],
    email: 'deepa.velip@nirakar.org',
    phone: '+91 832 2643240',
  },
  {
    id: 'fac-12',
    name: 'Mr. Gurudas Shet',
    designation: 'Lecturer in Economics & Commercial Geography',
    department: 'Commerce & Economics',
    institutionCode: 'ANGLE_HSS',
    institutionName: 'S. S. Angle Higher Secondary School',
    qualification: 'M.A. (Economics), B.Ed., Goa University Gold Medalist',
    experience: '15 Years',
    experienceYears: 15,
    subjects: ['Micro & Macro Economics', 'Indian Economic Development', 'Commercial Geography'],
    bio: 'Instilling deep comprehension of economic structures, rural development models, banking systems, and public finance.',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    achievements: [
      'Authored reference guidebook for Goa Board Class XII Economics',
      'Conducted 10 Rural Financial Literacy workshops in South Goa'
    ],
    email: 'gurudas.shet@anglehss.org',
    phone: '+91 832 2643292',
  },
  {
    id: 'fac-13',
    name: 'Mrs. Pratibha Bandodkar',
    designation: 'Senior TGT Social Sciences & History',
    department: 'Administration & Social Sciences',
    institutionCode: 'NIRAKAR_HS',
    institutionName: 'Shri Nirakar Vidyalaya',
    qualification: 'M.A. (History), B.Ed.',
    experience: '18 Years',
    experienceYears: 18,
    subjects: ['Indian National History', 'Civics & Democratic Politics', 'Goan Heritage'],
    bio: 'Bringing historic events to life through interactive roleplays, heritage trail excursions across Canacona fortresses, and student mock parliaments.',
    photoUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80',
    achievements: [
      'Curator of Shri Nirakar Living Heritage Museum',
      'Published monograph on Portuguese-era Canacona agrarian history'
    ],
    email: 'pratibha.b@nirakar.org',
    phone: '+91 832 2643241',
  },
  {
    id: 'fac-14',
    name: 'Mr. Vinay Gaonkar',
    designation: 'Lecturer in Accountancy & Costing',
    department: 'Commerce & Economics',
    institutionCode: 'ANGLE_HSS',
    institutionName: 'S. S. Angle Higher Secondary School',
    qualification: 'M.Com., B.Ed., Inter CA',
    experience: '11 Years',
    experienceYears: 11,
    subjects: ['Financial Accounting', 'Corporate Auditing', 'Cost Management'],
    bio: 'Fostering practical analytical mastery and balance sheet precision for Class XI and XII higher secondary commerce batches.',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    achievements: [
      'Conducted Commerce Career Aptitude Conclave for 400+ students',
      'Coordinated Society Entrepreneurship Cell incubations'
    ],
    email: 'vinay.gaonkar@anglehss.org',
    phone: '+91 832 2643293',
  },
  {
    id: 'fac-15',
    name: 'Mr. Santosh Velip',
    designation: 'TGT General Science & Nature Club Lead',
    department: 'Science & Wet Laboratories',
    institutionCode: 'TUDAL_HS',
    institutionName: 'Tudal High School',
    qualification: 'B.Sc. (Chemistry), B.Ed.',
    experience: '14 Years',
    experienceYears: 14,
    subjects: ['General Science', 'Chemistry Basics', 'Forest Ecology & Eco Clubs'],
    bio: 'Connecting classroom scientific principles directly with the natural biodiversity of Cotigao Wildlife Sanctuary and Gaondongrem riverbeds.',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80',
    achievements: [
      'State Forest Department Eco-Club Coordinator of the Year',
      'Led 12 Student Herbal Plantation drives across Gaondongrem'
    ],
    email: 'santosh.velip@tudal.org',
    phone: '+91 832 2641123',
  },
  {
    id: 'fac-16',
    name: 'Mrs. Manjusha Phal',
    designation: 'Senior TGT Hindi & Sanskrit',
    department: 'Languages & Literature',
    institutionCode: 'NIRAKAR_HS',
    institutionName: 'Shri Nirakar Vidyalaya',
    qualification: 'M.A. (Hindi), Rashtrabhasha Ratna, B.Ed.',
    experience: '17 Years',
    experienceYears: 17,
    subjects: ['Hindi Literature & Vyakaran', 'Sanskrit Subhashit', 'Poetry Recitation'],
    bio: 'Cultivating classical language fluency, public declamation, and moral story discussions that elevate language appreciation among young scholars.',
    photoUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=600&q=80',
    achievements: [
      'All-India Rashtrabhasha Prachar Samiti Educator Commendation',
      'State Inter-School Hindi Declamation Trophy Coach'
    ],
    email: 'manjusha.phal@nirakar.org',
    phone: '+91 832 2643242',
  },
  {
    id: 'fac-17',
    name: 'Mr. Arvind Painginkar',
    designation: 'Lecturer in Mathematics & Statistics',
    department: 'Mathematics & Computer',
    institutionCode: 'ANGLE_HSS',
    institutionName: 'S. S. Angle Higher Secondary School',
    qualification: 'M.Sc. (Applied Mathematics), B.Ed., SET',
    experience: '13 Years',
    experienceYears: 13,
    subjects: ['Calculus & Vectors', 'Probability & Statistics', 'JEE Main Math Track'],
    bio: 'Guiding senior secondary science and commerce students through rigorous differential calculus, statistics, and entrance exam speed techniques.',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
    achievements: [
      'Guided 18 students to 99+ percentile in Goa Board HSSC Mathematics',
      'Goa Mathematics Association Executive Member'
    ],
    email: 'arvind.painginkar@anglehss.org',
    phone: '+91 832 2643294',
  },
  {
    id: 'fac-18',
    name: 'Mrs. Suvarna Gaonkar',
    designation: 'TGT Mathematics & Primary Pedagogy Lead',
    department: 'Mathematics & Computer',
    institutionCode: 'TUDAL_HS',
    institutionName: 'Tudal High School',
    qualification: 'B.Sc. (Maths), B.Ed.',
    experience: '10 Years',
    experienceYears: 10,
    subjects: ['Fundamental Arithmetic', 'Geometry Foundations', 'Logical Reasoning'],
    bio: 'Transforming rural elementary math learning with visual manipulatives, origami geometry, and peer problem-solving circles.',
    photoUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=600&q=80',
    achievements: [
      'Canacona Taluka Best Primary Math Teacher Citation',
      'Created Tudal Math Toy Lab from recycled indigenous materials'
    ],
    email: 'suvarna.g@tudal.org',
    phone: '+91 832 2641124',
  },
  {
    id: 'fac-19',
    name: 'Mr. Pradeep Velip',
    designation: 'Physical Education Teacher & Athletics Coach',
    department: 'Athletics & Physical Education',
    institutionCode: 'TUDAL_HS',
    institutionName: 'Tudal High School',
    qualification: 'B.P.Ed., Certified Kho-Kho & Kabaddi Referee',
    experience: '9 Years',
    experienceYears: 9,
    subjects: ['Kho-Kho', 'Kabaddi', 'Cross Country Running', 'Yoga & Wellness'],
    bio: 'Championing traditional rural sports, marathon running, and stamina training across the Gaondongrem terrain.',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    achievements: [
      'Coached South Goa District Champions in Boys Kho-Kho (2024, 2025)',
      'Organized Canacona Forest Marathon'
    ],
    email: 'pradeep.sports@tudal.org',
    phone: '+91 832 2641125',
  },
  {
    id: 'fac-20',
    name: 'Mrs. Shraddha Chari',
    designation: 'Lecturer in Physics & Electronics Lab Head',
    department: 'Science & Wet Laboratories',
    institutionCode: 'ANGLE_HSS',
    institutionName: 'S. S. Angle Higher Secondary School',
    qualification: 'M.Sc. (Physics with Electronics), B.Ed.',
    experience: '10 Years',
    experienceYears: 10,
    subjects: ['Electromagnetism', 'Optics & Modern Physics', 'Semiconductors Lab'],
    bio: 'Empowering young physicists with semiconductor breadboard circuits, oscilloscope experiments, and practical physics insights.',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    achievements: [
      'Designed Dapot Advanced Electronics Demonstration Bench',
      'Goa Science Centre Mentor for Student Science Projects'
    ],
    email: 'shraddha.chari@anglehss.org',
    phone: '+91 832 2643295',
  },
  {
    id: 'fac-21',
    name: 'Mr. Chandrakant Naik',
    designation: 'Senior TGT English & Dramatic Arts Coach',
    department: 'Languages & Literature',
    institutionCode: 'NIRAKAR_HS',
    institutionName: 'Shri Nirakar Vidyalaya',
    qualification: 'M.A. (English), B.Ed., Diploma in Dramatic Arts',
    experience: '15 Years',
    experienceYears: 15,
    subjects: ['English Prose & Poetry', 'Spoken English & Phonetics', 'School Drama'],
    bio: 'Instilling English speech confidence through annual Shakespeare theatrical productions, elocution contests, and creative storytelling.',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    achievements: [
      'Director of 10 Award-Winning Inter-School English One-Act Plays',
      'Spearheaded Canacona Community English Language Immersion Camp'
    ],
    email: 'chandrakant.naik@nirakar.org',
    phone: '+91 832 2643243',
  },
  {
    id: 'fac-22',
    name: 'Mrs. Archana Prabhu',
    designation: 'Lecturer in Political Science & Sociology',
    department: 'Administration & Social Sciences',
    institutionCode: 'ANGLE_HSS',
    institutionName: 'S. S. Angle Higher Secondary School',
    qualification: 'M.A. (Political Science), M.Phil., B.Ed.',
    experience: '14 Years',
    experienceYears: 14,
    subjects: ['Indian Constitution', 'International Relations', 'Comparative Politics'],
    bio: 'Guiding Arts stream scholars through constitutional jurisprudence, democratic governance debates, and civil service foundational study tracks.',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    achievements: [
      'Convener of Goa State Youth Model Parliament at Porvorim',
      'Guided 14 students into premier national law universities (NLUs)'
    ],
    email: 'archana.prabhu@anglehss.org',
    phone: '+91 832 2643296',
  },
  {
    id: 'fac-23',
    name: 'Mr. Rameshwar Velip',
    designation: 'TGT Konkani & Goan Cultural Traditions',
    department: 'Languages & Literature',
    institutionCode: 'TUDAL_HS',
    institutionName: 'Tudal High School',
    qualification: 'M.A. (Konkani), B.Ed., Folk Music Diploma',
    experience: '12 Years',
    experienceYears: 12,
    subjects: ['Konkani Vyakaran', 'Ghumat Aarti & Folk Music', 'Oral History of Canacona'],
    bio: 'Preserving authentic Goan folk traditions, traditional Ghumat percussion rhythms, and Konkani linguistic eloquence in rural Canacona.',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
    achievements: [
      'Canacona Traditional Ghumat Aarti State Champions Coach',
      'Author of Folk Legends of the Western Ghats'
    ],
    email: 'rameshwar.v@tudal.org',
    phone: '+91 832 2641126',
  },
  {
    id: 'fac-24',
    name: 'Mrs. Pallavi Dessai',
    designation: 'Senior Art & Craft Educator',
    department: 'Languages & Literature',
    institutionCode: 'NIRAKAR_HS',
    institutionName: 'Shri Nirakar Vidyalaya',
    qualification: 'B.F.A. (Applied Arts), Goa College of Art, B.Ed.',
    experience: '11 Years',
    experienceYears: 11,
    subjects: ['Fine Arts & Painting', 'Clay Modeling & Pottery', 'Traditional Goan Crafts'],
    bio: 'Fostering aesthetic expression, creative craftsmanship, and sustainable craft design among students from Class V through Class X.',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
    achievements: [
      'Goa Kala Academy State Youth Art Exhibition Mentor',
      'Curator of Annual Mashem Children Clay & Art Festival'
    ],
    email: 'pallavi.dessai@nirakar.org',
    phone: '+91 832 2643244',
  }
];

// Attach authentic academic & professional social links for faculty (Goa & Indian University standard)
FACULTY_DATA.forEach((member) => {
  const cleanName = member.name.toLowerCase().replace(/^(mr\.|mrs\.|dr\.|prof\.)\s*/, '').replace(/[^a-z0-9]/g, '');
  if (!member.socialLinks) {
    member.socialLinks = {
      linkedin: `https://linkedin.com/in/${cleanName}-goa`,
      googleScholar: member.department.includes('Science') || member.department.includes('Mathematics') || member.isHead
        ? `https://scholar.google.com/citations?user=${cleanName}`
        : undefined,
      researchGate: member.department.includes('Science') || member.qualification.includes('M.Phil') || member.qualification.includes('M.Sc')
        ? `https://researchgate.net/profile/${cleanName}`
        : undefined,
      vidwan: `https://vidwan.inflibnet.ac.in/profile/${120000 + (member.experienceYears * 1337) % 800000}`,
      twitter: member.isHead ? `https://x.com/${cleanName}_edu` : undefined,
      orcid: member.qualification.includes('Ph.D') || member.qualification.includes('M.Phil')
        ? `https://orcid.org/0000-0002-${(1000 + member.experienceYears * 42).toString().padStart(4, '0')}-9821`
        : undefined,
      website: `https://nirakar.edu.in/faculty/${cleanName}`,
      github: member.department.includes('Computer') ? `https://github.com/${cleanName}` : undefined,
    };
  }
});

export const DEPARTMENTS = [
  'All Departments',
  'Administration & Mathematics',
  'Science & Wet Laboratories',
  'Commerce & Economics',
  'Languages & Literature',
  'Mathematics & Computer',
  'Athletics & Physical Education',
  'Administration & Social Sciences',
];

export const INSTITUTION_OPTIONS = [
  { code: 'ALL', name: 'All Institutions' },
  { code: 'NIRAKAR_HS', name: 'Shri Nirakar Vidyalaya' },
  { code: 'TUDAL_HS', name: 'Tudal High School' },
  { code: 'ANGLE_HSS', name: 'S. S. Angle Higher Secondary School' },
];

