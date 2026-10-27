import { prisma } from './index.js';
import { seedBatchPhotos } from './seed-batch-photos.js';
import argon2 from 'argon2';
import crypto from 'node:crypto';

async function seed() {
  console.log('--- Starting Database Seeding for Shri Nirakar Education Society ---');

  // 1. Seed Institutions
  console.log('Seeding 3 Institutions...');
  const institutions = [
    {
      code: 'NIRAKAR_HS' as const,
      name: 'Shri Nirakar High School',
      slug: 'nirakar-high-school',
      tagline: 'Excellence in Secondary Education, Mashem, Canacona',
      history:
        'From the noble ideal of ‘Mushtifund’ was born Shri Nirakar Vidyalaya in 1924. The traditional pedagogy of the village found its sustenance through a handful offerings of grain and the unflinching support of its community members. Against all odds of the pre-liberation period it emerged as a full-fledged middle school on 5th of June 1950.\n\nWhile the entire nation and the state was making impressive strides in education, it was only a distant dream for Kankonkars. So the crusade for imparting good education had to be bolstered. During the time when Goa was charged with the spirit of nationalism, the school nurtured young minds and hearts who immensely contributed to the cause of liberation of Goa.\n\nThe actual work of the school began on 5th June 1940. Catering to the educational needs of only 15-20 pupils was its humble beginning. Gradually it progressed due to the dedication and selfless work of teachers like Shri Madhav B. Prabhugaonkar, Shri Venkatesh Y. Bhende, Shri Madhav H. Prabhudesai, Shri Ramchandra V. Prabhudesai and Smt. Sudarabai N. Prabhudesai. Classes were conducted at various places like the veranda of someone’s house, in the assembly hall of Shri Nirakar temple as the school did not have an independent building of its own. However the plans of constructing a school building received overwhelming support of the villagers who generously lent timber and other material required for its construction. As per plans the construction began in the property that belonged to the Shri Nirakar Devalay and in the year 1950 the school building was inaugurated at the hands of Dr. Vasantrao Nagarsekar.\n\nHowever with the subsequent addition of classes space constraint was felt and the school building towards its east side was constructed under the patronage of the then President of the management, Shri Tukaram S. Lolayekar.\n\nIn the year 1950 its first batch of std VII answered the primary school exam from Karwar centre. After its initial success in educational endeavours, Mr. Gopal V. Prabhu made efforts to take it two steps further by introducing std VIII and IX in the years 1954 and 55 respectively. For the approval of the Pune S.S.C. board it was mandatory to have pucca walls for the classes. The school celebrated its silver jubilee in the year 1965. Goa’s first Chief Minister Mr. Bahusaheb Bandodkar was the chief guest for the silver jubilee function. It was in 1969 the building with six classes was inaugurated.\n\nAfter liberation, that is from the year 1961 the school was upgraded to impart quality education upto S.S.C level. The full fledged school was run under the leadership of Shri Suresh Kanekar, Shri Ravindra Pai Raiturkar and Shri Ram V. Bhat. From the year 1964 to 1970 the school was under the tutelage of Shri Ramdas N. Phene, whose competency brought in great stability and many accomplishments. In the year 1971 Shri Suresh Prabhugaonkar was appointed the headmaster of the school. The school celebrated its golden Jubilee during his leadership. Mr. Jairam Gaonkar was appointed as the Headmaster of this institution in the year 1998. Many innovative methods of teaching were carried out in school during his tenure. The society also provided extensive support for students coming from disadvantaged backgrounds. Students not only from Canacona but from different parts of Goa are availing education at this institution. Presently the school is run under the able leadership of Mr. Hemant Kamat. Plans for developments are ongoing and every effort is made by NES to provide the best facilities.\n\nAs envisioned by the founders, the school has lived up to its highest enshrined values and principles and produced excellent leaders in various fields. We are proud of these Nirakarians, who keep the flag of highest values handed over to us by the founders, soaring high...\n\nToday we have a team of the stakeholders of education-the Management, the staff and the parents working creatively to give a new direction to the innovative young minds to excel and shine.',
      vision:
        'To provide inclusive, values-led education that develops capable, compassionate, and confident citizens while preserving Canacona’s cultural heritage and enabling every learner to contribute meaningfully to society.',
      bannerUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1600&q=80',
      profile: {
        commitments:
          'Welcome to the Educational Environs of Nirakarians!\nAt Shri Nirakar High School, we will ensure that student’s unique personality will develop holistically under our care. Our endeavour for academic excellence is supported by a supportive and a happy environment that nurtures talent and encourages individuality allowing your ward to fulfil her/his true potential.\n\nUtmost care is taken for the health and hygiene of the pupils. Valuable guidance for child care is provided to parents through various activities conducted by the school P.T.A.\n\nAll staff knows and cares about the students and encourages their individual development. Strong social and moral codes are part of school life with politeness, tolerance and hard work being the norm.\n\nWe emphasize on imparting educational values, fostering positive attitude and above all holistic development of pupils so that they are prepared for adult life.',
        infrastructure: [
          'Well-equipped library with books in Konkani, Marathi, Hindi and English, educational CDs, local and national dailies, and children\'s magazines',
          'Audio Visual Room with slide projector, LCD projector, coloured television, PCs with multimedia and internet facility',
          'Science laboratories equipped for practical demonstration and scientific experiments',
          'Sports amenities for outdoor and indoor fitness, games, and athletics',
          'Music classes with dedicated musical instruments to foster artistic interest after school hours',
        ],
        rules: [
          'Admission: Students seeking admission to standard V to X should produce leaving certificate from previous school attended, birth certificate, mark sheet, and admission form. Other state students submit transfer certificate.',
          'Attendance: Parents/guardians must ensure regular attendance. Absentees must produce leave note in the diary the following day. 75% attendance is mandatory.',
          'Punctuality: Students must arrive at least 10 minutes before the assembly. Late arrivals will be recorded in diary.',
          'Uniform: Stitched to prescribed school design, neatly ironed. Shoes and tie after monsoons. Girls wear hair in two plaits/ponytails with black rubber bands. No jewellery, tattoos, nailpolish, or mehndi.',
          'Discipline: Scribbling on benches/walls incurs fines. Running, whistling, shouting during class hours will not be tolerated. Chips and chewing gum strictly prohibited.',
          'Electronic gadgets: Mobile phones are strictly prohibited within school premises.',
          'Timings: School 7:45 am to 1:20 pm; Office 8:00 am to 2:30 pm; Remedial classes 2:30 pm to 4:00 pm.',
          'Fee structure: V to VII: Rs. 124/- (Term Fee: Rs. 24/-, PTA: Rs. 100/-); VIII: Rs. 136/- (Term: Rs. 24/-, Pupil Fund: Rs. 12/-, PTA: Rs. 100/-); IX to X: Rs. 136/-.',
          'Evaluation: CCE (Continuous Comprehensive Evaluation) across two semesters with formative & summative assessments (Max 200 marks).',
        ],
        admissions: [
          'Standards V to X: Admission open to students fulfilling age and completion criteria of previous grade.',
          'Required documents: Original leaving certificate from recognized school, attested birth certificate, previous academic marksheet, and passport photographs.',
          'Withdrawal: Written application required for school leaving certificate after clearing all library and fee dues.',
          'Parent cooperation: Check diary regularly, avoid criticizing teachers in presence of wards, attend PTA meetings proactively.',
        ],
        courses: [
          'Primary & Middle School Curriculum: Standards V to VII as per Goa Board / Directorate of Education',
          'Secondary School Curriculum: Standards VIII to X leading to S.S.C. Examination (Goa Board)',
          'Scholastic Subjects: Languages (English, Konkani, Marathi, Hindi), Mathematics, Science, Social Sciences',
          'Co-Scholastic & Life Skills: Physical Education, Art & Work Experience, Environmental Education',
        ],
        activities: [
          'Swadheen Lend-A-Hand India (LAHI): IBT (Introduction to Basic Technology) module equipping students with practical life and technical skills',
          'Post-examination Holistic Child Development Programme for rural student talent nurturing',
          'Reading groups and daily library access monitoring reading progress across 4 languages',
          'Classwise morning assemblies providing presentation opportunities for every pupil',
          'Environmental awareness & sustainability conservation drives',
        ],
      },
    },
    {
      code: 'TUDAL_HS' as const,
      name: 'Tudal High School',
      slug: 'tudal-high-school',
      tagline: 'Fostering Rural Talent with Holistic Character, Gaondongrem',
      history:
        'Tudal High School has the rare distinction of being the only school in Goa named after the village it was meant to be in. And it is in Gaondongrem, a place literally meaning ‘a village nestled among the hills’. It definitely conjures up images of verdant fields fringed by steep towering mountains and dense forests. A picturesque beauty, it is the idyllic setting for a temple of learning.\n\nIn 1998, the reputed educational organization of Shri Nirakar Education Society was invited by the Government of Goa to set up a new school in the middle of a rustic village with an old world charm, not far from the hustle and bustle of the booming new town of Canacona. Inspite of a couple of attempts by other private educational societies to do the same (which obviously ended in failure), Mr. Prasad Lolayekar of Shri Nirakar Education Society took up the cudgels and began the groundwork arduously. The Headmaster of Shri Nirakar Vidyalaya, Mashem, Mr. Jairam K. Gaonkar, was appointed as the acting Headmaster of the school and all efforts began in earnest. In fact, it was he who christened the school at its fledgling stage the lyrical Tudal Middle School.\n\nAlthough this middle school began in a humble shed, the society went on, contradicting critics, in building a school in a location close by with classrooms, a library, a laboratory and an office. The villagers of Tudal, themselves austere, simple folk, generously donated their land for the school.\n\nTo cap it all, a new three-storeyed building was constructed for the high school with the best facilities for the students under the leadership of the Headmaster, Mr. Vijaykumar A. Prabhu. A great amount of credit goes to the astute Chairman of Shri Nirakar Education Society, Mr. Prashant Naik, for successfully establishing the fully modern structure of the school as it now stands.\n\nThe children in the locality of Gaondongrem are the uncut diamonds of our state. The majority not only belongs to the tribal community, they are economically backward and first-generation learners. The sparkle in their eyes to know the world keeps Shri Nirakar Education Society’s lamp of commitment burning. The teaching-learning process would be incomplete without the active participation of the parents. The Parent Teacher Association meetings witness full house attendance with eager, optimistic parents keenly participating in the discussions pertaining to the progress and development of their wards.\n\nTudal High School has much to boast about since its inception. It raced against time to make up for what other schools took decades – be it in academics, sports or co-curricular activities. The students under the guidance of an all-young staff have showcased their talents in different spheres. They have even presented their science projects at prestigious exhibitions all over in India. Since the students live and study in the bosom of nature herself, they know nature in its truest form and hence, passionately participate in nature conservation programmes. The sports champions of the school have won accolades not only for the school but have made our state proud.\n\nLooking back over the years, the development that has taken place in Tudal High School has been tremendous, not just in proving quality education but in changing society to look forward towards a brighter future.',
      vision:
        'Empowering rural youth through quality education, environmental stewardship, and skill-based learning.',
      bannerUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80',
      profile: {
        commitments:
          'To provide young lives complete, thorough and holistic education.\nTo instill young minds a sense of inquisitiveness with the aim of learning more about one’s self and the world around and have a scientific approach.\nTo expose students to the changes in society and the natural environment and help them to find a path which would help in sustaining the health of both.\nTo make students true elements of leadership to guide not just the present generation but even the future ones.\nTo establish in children virtues like respect, sympathy, gratitude and unity.',
        infrastructure: [
          'Modern three-storeyed high school building nestled in scenic Gaondongrem',
          'Science laboratory equipped with experimental apparatus and demonstration models',
          'School library with regional, national books and reference volumes',
          'Spacious classrooms and administrative offices with modern IT integration',
          'Extensive playground for athletic meets, football, and traditional rural sports',
        ],
        rules: [
          'School timing is strictly from 7:50 a.m. to 1:20 p.m.',
          'All students must wear complete prescribed uniform and arrive on time.',
          'Late comers will not be allowed to enter classrooms without prior permission from the Headmaster.',
          'Morning assembly participation is mandatory for all students.',
          'Students may not leave school premises during hours without Headmaster\'s permission.',
          'Fancy hairstyles, nail polish, fashionable items, and electronic gadgets/mobiles strictly prohibited.',
          'Parents must attend all PTA meetings and sign student progress cards in their ward\'s presence.',
          'Bullying, ragging, or abusive language is strictly forbidden and subject to disciplinary action.',
        ],
        admissions: [
          'Admissions open for standards V through X (English medium curriculum).',
          'Permissible maximum division strength is 50 students.',
          'Inclusive policy: School considers admitting students with moderate physical or learning disabilities.',
          'Required documents: Original leaving certificate, original statement of marks, and 4 recent passport photos.',
          'Fee structure: Standards V to VII: Rs. 124/-; Standard VII: Rs. 136/-; Standards VIII to X: Rs. 136/-. Non-refundable.',
          'Applications after one month from opening date are treated as late as per Directorate of Education rules.',
        ],
        courses: [
          'Middle School Curriculum: Standards V, VI, VII (English medium with regional language foundations)',
          'High School Curriculum: Standards VIII, IX, X under Goa Board of Secondary and Higher Secondary Education',
          'Key subjects: English, Marathi/Konkani, Hindi, Mathematics, General Science, Social Sciences',
          'Co-curricular modules: Work experience, Environmental studies, Physical & Health education',
        ],
        activities: [
          'National & State Level Science Exhibition projects presented by rural student teams',
          'Active Nature Conservation and environmental stewardship programmes',
          'Parent Teacher Association interactive workshops and high-attendance community forums',
          'Athletics, sports tournaments, and taluka-level championships',
          'Cultural folklore, drama, and youth empowerment events',
        ],
      },
    },
    {
      code: 'ANGLE_HSS' as const,
      name: 'S. S. Angle Higher Secondary School',
      slug: 'angle-higher-secondary',
      tagline: 'Leading Arts, Science & Commerce Streams with Distinction, Maxem',
      history:
        'Imprints on the Sands of Time\nInspired by a young and energetic team of management members, Shri Nirakar Education Society’s Satyawati Soiru Angle Higher Secondary School commenced classes in June 1993 in the premises of Shree Nirakar Vidyalaya under the dynamic leadership of Dr. Narayan B Desai. The avowed aim was to enable individuals to develop academic and social skills, strength of character, resourcefulness and creativity necessary to become successful family members, citizens and workers, by providing a happy, intellectually stimulating and caring environment in which everyone is given the opportunity to reach their full potential.\n\nThe essence of our school’s mission statement Manavyam Paramam Dheyyam is best expressed in John J. Dunphy award winning essay, The Humanist (1983), when he says, "The battle for humankind\'s future must be waged and won in the public school classroom by teachers who correctly perceive their role as the proselytisers of a new faith: A religion of humanity -- utilizing a classroom instead of a pulpit to carry humanist values into wherever they teach.”\n\nAs we enter into our journey we feel obliged with gratitude to remember the exceptional contribution made by our mentors late Balkrishna Prabhugoankar, late Mangaldas Lolayekar, late Shashank Shirodkar who are no more with us. Their names will always remain etched in our collective memory for many years to come.\n\nThanks to the goodwill and sustained commitment of these and many other visionary people, Angle Higher Secondary School has come a long way to grow in its stature as one of the leading rural institutions in the state. On June 21st 1998 the spacious new building of Shri Nirakar Education Society’s S. S. Angle Higher Secondary School was inaugurated by then Governor of Goa H.E. Lt. General J. F. R. Jacob (PVSM) on the sprawling Nirakar Maidan marking another important milestone in the history of the Society.\n\nIn June 2011 the Society added another feather to its cap when the science stream was introduced with a strength of 24 students and science laboratories equipped with all modern amenities and state of the art technology.\n\nAmidst cycles of greatness and lows too, that can sometimes be very irksome and thorny, we continue to march ahead with renewed commitment and dedication to come in the reckoning of greatness in our pursuit of excellence.\n\nThe Chairman of Shri Nirakar Education Society, Mr Prashant Naik says: “The Higher Secondary has grown to be one of the top rural institutions in the state and can boast of infrastructural facilities that match the best in the country that include a spacious premises/ new building, Full length hall besides a mini hall, Indoor cricket pitch, Sprawling Football/Cricket Ground, well equipped gymnasium, Volleyball Court, Baseball Ground, Recreation Room, Computer Lab, state of the art laboratories, Audio-Visual Room, Library, Music Room, NSS Room, Agriculture plot, and a DEITI centre. The society has big expansion plans and will continue to make the rural institution into a centre for excellence.”\n\nSays our Principal Jairam K Goankar: “Great institutions take a long time and very many great people to build it. Many a factors come together for greatness to happen. Management, teachers, students, parents, in all their diversity, have to come together and a culture has to come about where such greatness becomes a possibility and a norm. With legitimate pride and sound optimism we can say it is a dream destined to be true.”',
      vision:
        'Preparing students for higher academic pursuits and competitive careers through scientific inquiry and entrepreneurial mindset.',
      bannerUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80',
      profile: {
        commitments:
          'S. S. Angle Higher Secondary School is managed by Shri Nirakar Education Society. The Society was established in 1940 and manages two other institutions viz Shri Nirakar Vidyalaya, Mashem and Tudal High School, Gaondongri.\n\nWith various plans for expansion and growth, the society has always endeavoured to provide everything necessary for a conducive learning environment.\nS. S. Angle Higher Secondary School is a leading rural institution with infrastructure and facilities to match the best in the state. The school is a sub centre for Yeshwantrao Chavan Maharashtra Open University.\n\nManavyam Paramam Dheyyam — Imparting academic brilliance, social conscience, and lifelong leadership to every student.',
        infrastructure: [
          'Spacious School Building: Inaugurated in 1998 on sprawling Nirakar Maidan at Dapot, Mashem, with first floor expansion housing modern facilities',
          'Library: Well-equipped collection of over 4,000 volumes, 500+ philanthropic endowment books, newspapers, and academic periodicals',
          'State-of-the-Art Science Labs: Separate modern Wet Laboratories for Physics, Chemistry, and Biology',
          'Computer Labs: High-speed 24-hour broadband internet workstations for computer education',
          'Audio Visual Room: Slide and overhead projectors, LCD projection, colour televisions, multimedia PCs, and musical instruments',
          'DEITI Facility: Direct Receiving System (DRS) established by Goa University under Distance Education, Information and Training Infrastructure with video-conferencing open to the public',
          'Sports Complex: 20,000 sq. metre outdoor grounds (football, baseball, kho-kho, tennicoit, running track, and Goa Cricket Association turf pitch)',
          'Indoor Sports Complex: 200 sq. metre complex housing badminton court, table tennis, chess arena, and Government-assisted gymnasium',
          'Additional Facilities: Full length auditorium hall, mini hall, indoor cricket pitch, volleyball court, NSS room, and agriculture plot',
        ],
        rules: [
          'Conduct: Students must behave with dignity, decency, self-control, and mutual respect.',
          'Attendance & Punctuality: Minimum 75% attendance mandatory to appear for Goa Board examinations. Punctual attendance for morning assembly and remedial classes required.',
          'Campus permissions: No student may leave campus or classroom without written permission of Principal or Teacher-Counsellor.',
          'Uniform: Full prescribed uniform required on all school days and when representing the school. Neat hair length; hair dye, exaggerated hairstyles, tattoos, and jewellery forbidden.',
          'Prohibitions: Cell phones, electronic gadgets, expensive personal items, motor vehicles (bikes/scooters), alcohol, psychotropic substances, and weapons strictly forbidden.',
          'Teacher-Counsellor Confidentiality: Counsellor is bound by code of confidentiality but will intervene in safety, legal, or health risks.',
          'Discipline: Zero tolerance for verbal abuse, casteism, bullying, property damage, or violence.',
        ],
        admissions: [
          'Streams: Admissions open for Standards XI and XII in Arts, Commerce, and Science.',
          'Division strength: Maximum 50 students per division. Subject to availability of merit seats.',
          'Priorities: S.S. Angle siblings, former student siblings, and wards of full-time employees.',
          'Required documents: Completed application form, original and 2 attested copies of SSC/XI statement of marks, original school leaving certificate (not returned) with 2 copies, birth certificate copy, 4 passport photos, and caste certificate (if applicable).',
          'Special category: Students with moderate physical/learning disabilities considered with parental medical details.',
          'Other boards: Students passing SSC from boards other than Goa Board must complete Directorate of Education eligibility procedures.',
        ],
        courses: [
          'Arts Stream: English I / Marathi I, English II / Konkani II / Marathi II, Economics, Political Science, Sociology, Hindi / Secretarial Practice / Co-operation',
          'Commerce Stream: English I / Marathi I, English II / Konkani II / Marathi II, Economics, Accountancy, Business Studies, Hindi / Secretarial Practice / Co-operation',
          'Science Stream: English Language I, Konkani II / Marathi II, Mathematics, Physics, Chemistry, Biology',
          'Internal Assessment Subjects (All Streams): Computer Awareness, NSS / Youth Red Cross, Environmental Studies, Physical Education',
        ],
        activities: [
          'Students Council: Democratic student governance formed under Principal chairmanship with class representatives elected by secret ballot',
          'Annual Monsoon Hike: 16-year tradition trekking spots like Siddhnath Parvath, Chandreshwar Bhuthnath, Karmalghat, and Nadkem',
          'Jagor Cultural Club: Established in 2005 under CCRT; leads state-level youth festivals and performing arts training',
          'NSS & YRC Camps: Annual residential camps fostering community service, first aid skills (with Indian Red Cross), and dignity of labour',
          'Sports Coaching Camps: Summer coaching in baseball, cricket, football, and Kho-Kho in collaboration with Sports Authority of Goa',
          'Science Club: Innovative student research and exhibition models mentored by science faculty',
        ],
      },
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
        profile: inst.profile,
      },
      create: inst,
    });
  }

  // 1b. Seed Dynamic Committees and Rosters for All 3 Institutions
  console.log('Seeding Comprehensive Committees & Governing Bodies...');

  const nirakar = await prisma.institution.findUniqueOrThrow({ where: { code: 'NIRAKAR_HS' } });
  const tudal = await prisma.institution.findUniqueOrThrow({ where: { code: 'TUDAL_HS' } });
  const angle = await prisma.institution.findUniqueOrThrow({ where: { code: 'ANGLE_HSS' } });

  const institutionCommittees = [
    {
      inst: nirakar,
      list: [
        {
          name: 'School Managing Committee',
          slug: 'school-managing-committee',
          description: 'The statutory management body guiding the school’s administration and long-term educational development.',
          members: [
            ['Mr. Prashant Naik', 'Chairman', 'Chairman'],
            ['Mrs. Urmila R. Lolayekar', 'Manager', 'Manager'],
            ['Mrs. Maithili P. Gunagi', "Teacher's Representative", 'Member'],
            ['Mrs. Urvee Phaldesai', 'Headmaster', 'Headmaster'],
            ['Mrs. Deepali Agrasani', 'PTA Representative', 'Member'],
            ['Mr. Nanda V. Satarkar', 'Member', 'Member'],
            ['Mr. Subhash Pagi', 'Member', 'Member'],
            ['Mr. Chetan Acharya', 'Member', 'Member'],
          ],
        },
        {
          name: 'PTA Committee',
          slug: 'pta-committee',
          description: 'Parent-Teacher partnership promoting student welfare, remedial support, and extracurricular enrichment.',
          members: [
            ['Mrs. Deepali Agrasani', 'PTA Chairman', 'Chairman'],
            ['Mr. Sanjay Gaonkar', 'Vice Chairman', 'Member'],
            ['Mrs. Urvee K. Phaldesai', 'President', 'President'],
            ['Mr. Santosh Tawadkar', 'Secretary', 'Secretary'],
            ['Mrs. Aslesha Satoskar', 'Joint Secretary', 'Member'],
            ['Mrs. Swati Sudesh Naik', 'Treasurer', 'Treasurer'],
          ],
        },
      ],
    },
    {
      inst: tudal,
      list: [
        {
          name: 'School Managing Committee',
          slug: 'school-managing-committee',
          description: 'Governing board dedicated to rural education and student development in Gaondongrem.',
          members: [
            ['Mr. Prashant Naik', 'Chairman', 'Chairman'],
            ['Ms. Urmila Lolayekar', 'Member', 'Member'],
            ['Mrs. Meena Kamat', 'Headmistress', 'Headmistress'],
            ['Ms. Tanuja Lolayekar', 'Teacher Representative', 'Member'],
            ['Mr. Divakarji Velip', 'Member', 'Member'],
            ['Mr. Nanda Satarkar', 'Member', 'Member'],
            ['Mr. Chetan Acharya', 'Manager', 'Manager'],
            ['Mr. Nilkanth Phaldessai', 'Member', 'Member'],
            ['Mr. Janu Velip', 'P.T.A. Representative', 'Member'],
          ],
        },
        {
          name: 'P.T.A. Committee',
          slug: 'pta-committee',
          description: 'Active Parent-Teacher Association steering rural school excellence, cultural arts, and community welfare.',
          members: [
            ['Dr. Mayur Bhandari', 'Doctor', 'Advisor'],
            ['Mr. Sanjay Gaonkar', 'Artist', 'Advisor'],
            ['Mr. Arun Devidas', 'Social Worker', 'Advisor'],
            ['Mr. Janu Velip', 'President', 'President'],
            ['Mr. Prashant Kale', 'Vice-President', 'Vice-President'],
            ['Mrs. Tanuja Lolayekar', 'Secretary', 'Secretary'],
            ['Mrs. Veena A. Prabhugaonkar', 'Joint-Secretary', 'Joint-Secretary'],
            ['Mrs. Shobhana S. Velip', 'Treasurer', 'Treasurer'],
            ['Mr. Sonu Gaonkar', 'Parent Member', 'Member'],
            ['Mr. Rajendra Velip', 'Parent Member', 'Member'],
            ['Mr. Arjun Gaonkar', 'Parent Member', 'Member'],
            ['Mr. Anil Bandekar', 'Parent Member', 'Member'],
            ['Mrs. Laksha Gaonkar', 'Parent Member', 'Member'],
            ['Mr. Bhutnath Velip', 'Ex-student', 'Member'],
            ['Mrs. Kavita K. Velip', 'Parent Member', 'Member'],
            ['Shri. Vijaykumar Prabhu', 'Educationalist', 'Advisor'],
            ['Mr. Rajesh Gaonkar', 'Parent Member', 'Member'],
            ['Mr. Keshav Gaonkar', 'Parent Member', 'Member'],
          ],
        },
      ],
    },
    {
      inst: angle,
      list: [
        {
          name: 'School Managing Committee',
          slug: 'school-managing-committee',
          description: 'Steering higher secondary education, state merit excellence, and campus infrastructural growth.',
          members: [
            ['Prashant M. Naik', 'Chairman', 'Chairman'],
            ['Urmila Lolayekar', 'Manager', 'Manager'],
            ['Hemant M. Kamat', 'Head of the School', 'Headmaster'],
            ['Gurudas Raikar', 'Representative of PTA', 'Member'],
            ['Kavindra Phaldesai', 'Teacher of the same school', 'Member'],
            ['Pramod Dessai', 'Educationist', 'Advisor'],
            ['Dr. Rajesh Prabhu', 'Member', 'Member'],
            ['Chetan Acharya', 'Member', 'Member'],
            ['CEO South Zone Margao', 'Departmental Representative', 'Advisor'],
            ['Subhash Pagi', 'Member', 'Member'],
          ],
        },
        {
          name: 'PTA Committee',
          slug: 'pta-committee',
          description: 'Parent-Teacher Council fostering student academic and co-curricular leadership across Arts, Commerce, and Science.',
          members: [
            ['Theu Velip', 'President', 'President'],
            ['Gajanan Gaonkar', 'Vice President', 'Vice-President'],
            ['Umesh Revenkar', 'Treasurer', 'Treasurer'],
            ['Trupti Prabhu Ajgaonkar', 'Secretary', 'Secretary'],
            ['Chandralekha Patil Mestri', 'Joint Secretary', 'Joint-Secretary'],
            ['Balkrishna Nambiar', 'Member', 'Member'],
            ['Arjun Velip', 'Member', 'Member'],
            ['Caitan Fernandes', 'Member', 'Member'],
            ['Venny Martins', 'Member', 'Member'],
            ['Jayashree S.P', 'Member', 'Member'],
            ['Dr. Shaba Gaonkar', 'Medical Advisor', 'Advisor'],
            ['Kamalakar Mhalshi', 'Educationist', 'Advisor'],
            ['Pascaline Fernandes', 'Social Worker', 'Advisor'],
            ['Gajanan Bandekar', 'Artist', 'Advisor'],
            ['J. K. Gaonkar', 'Ex-officio Chairman', 'Chairman'],
          ],
        },
      ],
    },
  ];

  for (const group of institutionCommittees) {
    for (const [order, committee] of group.list.entries()) {
      const record = await prisma.committee.upsert({
        where: { slug_institutionId: { slug: committee.slug, institutionId: group.inst.id } },
        update: { name: committee.name, description: committee.description, order },
        create: { institutionId: group.inst.id, name: committee.name, slug: committee.slug, description: committee.description, order },
      });
      await prisma.committeeMember.deleteMany({ where: { committeeId: record.id } });
      await prisma.committeeMember.createMany({
        data: committee.members.map(([name, designation, role], memberOrder) => ({
          committeeId: record.id, name, designation, role, order: memberOrder,
        })),
      });
    }
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
      passDurationDays: null,
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
    { key: 'SITE_NAME', value: 'Shri Nirakar Education Society', type: 'STRING', description: 'Official institution name' },
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

  // 10. Seed the batch photograph archive
  console.log('Seeding the batch photograph archive...');
  await seedBatchPhotos();

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
