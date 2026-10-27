import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { PrismaClient } from '@nirakar/db';

const prisma = new PrismaClient();

const UPLOADS_DIR = path.resolve('uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

interface StdResultData {
  title: string;
  academicYear: string;
  standard: 'V' | 'VI' | 'VII' | 'VIII' | 'IX' | 'X' | 'XI' | 'XII';
  examType: string;
  stream?: string;
  institutionCode: string;
  studentName: string;
  percentage: number;
  grade: string;
  remarks: string;
  isFeatured: boolean;
  rollNumber: string;
  pdfFileName: string;
  records: Array<{
    roll: string;
    name: string;
    score: string;
    grade: string;
    remarks: string;
  }>;
}

const RESULTS_DATA: StdResultData[] = [
  // Std V
  {
    title: 'Std V Annual Evaluation & Merit List (Primary Section)',
    academicYear: '2025–2026',
    standard: 'V',
    examType: 'Annual Evaluation Examination',
    institutionCode: 'NIRAKAR_HS',
    studentName: 'Master Aarav Sachin Desai',
    rollNumber: 'V-001',
    percentage: 95.4,
    grade: 'A+',
    remarks: 'School Topper (Rank 1) — General Proficiency Award',
    isFeatured: true,
    pdfFileName: 'Std_V_Annual_Evaluation_2025_2026.pdf',
    records: [
      { roll: 'V-001', name: 'Master Aarav Sachin Desai', score: '95.40%', grade: 'A+', remarks: 'Rank 1 — Distinction' },
      { roll: 'V-004', name: 'Kumari Ananya Pradeep Velip', score: '93.80%', grade: 'A+', remarks: 'Rank 2 — Distinction' },
      { roll: 'V-012', name: 'Master Tanmay Rajesh Gaonkar', score: '91.20%', grade: 'A+', remarks: 'Rank 3 — Distinction' },
      { roll: 'V-018', name: 'Kumari Siya Datta Komarpant', score: '88.60%', grade: 'A', remarks: 'First Class with Distinction' },
      { roll: 'V-022', name: 'Master Vedant Santosh Naik', score: '87.40%', grade: 'A', remarks: 'First Class' },
    ],
  },
  {
    title: 'Std V Comprehensive Term Assessment Merit Register',
    academicYear: '2025–2026',
    standard: 'V',
    examType: 'Term II Cumulative Assessment',
    institutionCode: 'TUDAL_HS',
    studentName: 'Kumari Sanvi Urvee Phaldessai',
    rollNumber: 'T-V-003',
    percentage: 94.2,
    grade: 'A+',
    remarks: 'Tudal High School Topper — 1st Rank',
    isFeatured: false,
    pdfFileName: 'Std_V_Tudal_Term_Assessment_2025_2026.pdf',
    records: [
      { roll: 'T-V-003', name: 'Kumari Sanvi Urvee Phaldessai', score: '94.20%', grade: 'A+', remarks: 'Rank 1 — Distinction' },
      { roll: 'T-V-008', name: 'Master Shaurya Mahesh Gaonkar', score: '91.60%', grade: 'A+', remarks: 'Rank 2 — Distinction' },
      { roll: 'T-V-015', name: 'Kumari Riya Umesh Velip', score: '89.40%', grade: 'A', remarks: 'Rank 3 — First Class' },
    ],
  },

  // Std VI
  {
    title: 'Std VI Annual Examination Result Sheet & Merit Honour',
    academicYear: '2025–2026',
    standard: 'VI',
    examType: 'Annual School Examination',
    institutionCode: 'NIRAKAR_HS',
    studentName: 'Kumari Diya Dinesh Bhandari',
    rollNumber: 'VI-007',
    percentage: 96.2,
    grade: 'A+',
    remarks: 'Rank 1 — Highest in Science & Mathematics',
    isFeatured: true,
    pdfFileName: 'Std_VI_Annual_Examination_2025_2026.pdf',
    records: [
      { roll: 'VI-007', name: 'Kumari Diya Dinesh Bhandari', score: '96.20%', grade: 'A+', remarks: 'Rank 1 — Gold Medallist' },
      { roll: 'VI-014', name: 'Master Omkar Devendra Naik', score: '94.00%', grade: 'A+', remarks: 'Rank 2 — Distinction' },
      { roll: 'VI-021', name: 'Kumari Pranjal Nitin Gaonkar', score: '92.40%', grade: 'A+', remarks: 'Rank 3 — Distinction' },
      { roll: 'VI-029', name: 'Master Ayush Ramdas Pagui', score: '89.60%', grade: 'A', remarks: 'First Class with Distinction' },
    ],
  },
  {
    title: 'Std VI Mid-Term Progress & Evaluation Report',
    academicYear: '2025–2026',
    standard: 'VI',
    examType: 'Mid-Term Assessment Examination',
    institutionCode: 'TUDAL_HS',
    studentName: 'Master Rohit Krishna Velip',
    rollNumber: 'T-VI-005',
    percentage: 92.5,
    grade: 'A+',
    remarks: 'Tudal High School First Rank in Mathematics',
    isFeatured: false,
    pdfFileName: 'Std_VI_MidTerm_Progress_2025_2026.pdf',
    records: [
      { roll: 'T-VI-005', name: 'Master Rohit Krishna Velip', score: '92.50%', grade: 'A+', remarks: 'Rank 1 — Distinction' },
      { roll: 'T-VI-011', name: 'Kumari Aditi Suresh Phaldessai', score: '90.80%', grade: 'A+', remarks: 'Rank 2 — Distinction' },
    ],
  },

  // Std VII
  {
    title: 'Std VII Annual Academic Assessment Result Register',
    academicYear: '2025–2026',
    standard: 'VII',
    examType: 'Annual Assessment Examination',
    institutionCode: 'NIRAKAR_HS',
    studentName: 'Master Chinmay Gurudas Gaonkar',
    rollNumber: 'VII-012',
    percentage: 95.8,
    grade: 'A+',
    remarks: 'School Topper (Rank 1) — Special Science Award',
    isFeatured: true,
    pdfFileName: 'Std_VII_Annual_Assessment_2025_2026.pdf',
    records: [
      { roll: 'VII-012', name: 'Master Chinmay Gurudas Gaonkar', score: '95.80%', grade: 'A+', remarks: 'Rank 1 — Distinction' },
      { roll: 'VII-019', name: 'Kumari Neha Anand Pagi', score: '94.20%', grade: 'A+', remarks: 'Rank 2 — Distinction' },
      { roll: 'VII-025', name: 'Master Atharv Vinayak Naik', score: '91.80%', grade: 'A+', remarks: 'Rank 3 — Distinction' },
      { roll: 'VII-031', name: 'Kumari Tanvi Manoj Velip', score: '88.50%', grade: 'A', remarks: 'First Class' },
    ],
  },

  // Std VIII
  {
    title: 'Std VIII High School Annual Examination Result Sheet',
    academicYear: '2025–2026',
    standard: 'VIII',
    examType: 'Annual Secondary Examination',
    institutionCode: 'NIRAKAR_HS',
    studentName: 'Kumari Ishita Shailesh Komarpant',
    rollNumber: 'VIII-008',
    percentage: 96.6,
    grade: 'A+',
    remarks: 'Class Topper (Rank 1) — 100/100 in Mathematics',
    isFeatured: true,
    pdfFileName: 'Std_VIII_Annual_Secondary_Exam_2025_2026.pdf',
    records: [
      { roll: 'VIII-008', name: 'Kumari Ishita Shailesh Komarpant', score: '96.60%', grade: 'A+', remarks: 'Rank 1 — Distinction' },
      { roll: 'VIII-016', name: 'Master Pranav Subhash Velip', score: '94.40%', grade: 'A+', remarks: 'Rank 2 — Distinction' },
      { roll: 'VIII-024', name: 'Kumari Disha Ravindra Gaonkar', score: '92.80%', grade: 'A+', remarks: 'Rank 3 — Distinction' },
      { roll: 'VIII-033', name: 'Master Sahil Dayanand Naik', score: '89.20%', grade: 'A', remarks: 'First Class' },
    ],
  },
  {
    title: 'Std VIII Pre-Board Preparatory Assessment Register',
    academicYear: '2025–2026',
    standard: 'VIII',
    examType: 'Preparatory Terminal Examination',
    institutionCode: 'TUDAL_HS',
    studentName: 'Master Sankalp Tukaram Phaldessai',
    rollNumber: 'T-VIII-009',
    percentage: 93.4,
    grade: 'A+',
    remarks: 'Tudal High School Distinction — Rank 1',
    isFeatured: false,
    pdfFileName: 'Std_VIII_Tudal_Preparatory_2025_2026.pdf',
    records: [
      { roll: 'T-VIII-009', name: 'Master Sankalp Tukaram Phaldessai', score: '93.40%', grade: 'A+', remarks: 'Rank 1 — Distinction' },
      { roll: 'T-VIII-014', name: 'Kumari Sneha Prakash Gaonkar', score: '91.00%', grade: 'A+', remarks: 'Rank 2 — Distinction' },
    ],
  },

  // Std IX
  {
    title: 'Std IX Pre-SSC Comprehensive Annual Result Register',
    academicYear: '2025–2026',
    standard: 'IX',
    examType: 'Annual Pre-SSC Examination',
    institutionCode: 'NIRAKAR_HS',
    studentName: 'Master Aryan Prashant Naik',
    rollNumber: 'IX-003',
    percentage: 97.2,
    grade: 'A+',
    remarks: 'School Topper (Rank 1) — Highest Marks across all subjects',
    isFeatured: true,
    pdfFileName: 'Std_IX_Annual_PreSSC_Results_2025_2026.pdf',
    records: [
      { roll: 'IX-003', name: 'Master Aryan Prashant Naik', score: '97.20%', grade: 'A+', remarks: 'Rank 1 — Distinction' },
      { roll: 'IX-011', name: 'Kumari Tanushree Nilesh Desai', score: '95.60%', grade: 'A+', remarks: 'Rank 2 — Distinction' },
      { roll: 'IX-018', name: 'Master Yashodhan Manohar Pagi', score: '93.20%', grade: 'A+', remarks: 'Rank 3 — Distinction' },
      { roll: 'IX-027', name: 'Kumari Gauri Mahadev Velip', score: '90.50%', grade: 'A+', remarks: 'First Class with Distinction' },
    ],
  },

  // Std X (Goa Board SSC)
  {
    title: 'Goa Board SSC Examination 2025–2026 Official Result Sheet',
    academicYear: '2025–2026',
    standard: 'X',
    examType: 'Goa Board SSC Examination (Official)',
    institutionCode: 'NIRAKAR_HS',
    studentName: 'Kumari Sanjana Sandeep Gaonkar',
    rollNumber: 'SSC-2026-1042',
    percentage: 98.4,
    grade: 'Distinction',
    remarks: 'Canacona Taluka Topper — 98.40% (Goa State Merit List)',
    isFeatured: true,
    pdfFileName: 'Goa_Board_SSC_Results_Official_2025_2026.pdf',
    records: [
      { roll: 'SSC-1042', name: 'Kumari Sanjana Sandeep Gaonkar', score: '98.40%', grade: 'Distinction', remarks: 'Taluka Topper — State Rank 4' },
      { roll: 'SSC-1049', name: 'Master Aditya Mahesh Komarpant', score: '97.20%', grade: 'Distinction', remarks: 'School Rank 2 — 100/100 Maths' },
      { roll: 'SSC-1055', name: 'Kumari Purva Pandurang Velip', score: '96.00%', grade: 'Distinction', remarks: 'School Rank 3 — Distinction' },
      { roll: 'SSC-1061', name: 'Master Kaustubh Rajesh Phaldessai', score: '94.80%', grade: 'Distinction', remarks: 'Distinction' },
      { roll: 'SSC-1070', name: 'Kumari Shruti Dattaram Naik', score: '93.60%', grade: 'Distinction', remarks: 'Distinction' },
    ],
  },
  {
    title: 'Goa Board SSC Annual Merit Roll — Shree Nirakar Tudal High School',
    academicYear: '2025–2026',
    standard: 'X',
    examType: 'Goa Board SSC Examination',
    institutionCode: 'TUDAL_HS',
    studentName: 'Master Darshan Rohidas Velip',
    rollNumber: 'SSC-T-2026-088',
    percentage: 95.6,
    grade: 'Distinction',
    remarks: 'Tudal High School Topper (Rank 1) — 100% Institution Passing Rate',
    isFeatured: true,
    pdfFileName: 'Tudal_HS_Goa_Board_SSC_Results_2025_2026.pdf',
    records: [
      { roll: 'SSC-T-088', name: 'Master Darshan Rohidas Velip', score: '95.60%', grade: 'Distinction', remarks: 'Campus Topper — 1st Rank' },
      { roll: 'SSC-T-094', name: 'Kumari Archana Vithal Gaonkar', score: '93.80%', grade: 'Distinction', remarks: 'Campus Rank 2' },
      { roll: 'SSC-T-101', name: 'Master Vaibhav Mohan Velip', score: '91.40%', grade: 'Distinction', remarks: 'Campus Rank 3' },
    ],
  },

  // Std XI - Science
  {
    title: 'Std XI Higher Secondary Annual Results — Science Stream',
    academicYear: '2025–2026',
    standard: 'XI',
    stream: 'Science',
    examType: 'Annual Higher Secondary Examination',
    institutionCode: 'ANGLE_HSS',
    studentName: 'Master Varun Gurudas Naik',
    rollNumber: 'XI-SCI-015',
    percentage: 95.8,
    grade: 'Distinction',
    remarks: 'Science Stream Topper — Highest in Physics & Mathematics',
    isFeatured: true,
    pdfFileName: 'Std_XI_Science_Annual_Results_2025_2026.pdf',
    records: [
      { roll: 'XI-SCI-015', name: 'Master Varun Gurudas Naik', score: '95.80%', grade: 'Distinction', remarks: 'Stream Rank 1' },
      { roll: 'XI-SCI-022', name: 'Kumari Mrunmayee Prashant Desai', score: '94.20%', grade: 'Distinction', remarks: 'Stream Rank 2' },
      { roll: 'XI-SCI-029', name: 'Master Aniket Devidas Velip', score: '92.40%', grade: 'Distinction', remarks: 'Stream Rank 3' },
    ],
  },
  // Std XI - Commerce
  {
    title: 'Std XI Higher Secondary Annual Results — Commerce Stream',
    academicYear: '2025–2026',
    standard: 'XI',
    stream: 'Commerce',
    examType: 'Annual Higher Secondary Examination',
    institutionCode: 'ANGLE_HSS',
    studentName: 'Kumari Radhika Ulhas Komarpant',
    rollNumber: 'XI-COM-008',
    percentage: 94.6,
    grade: 'Distinction',
    remarks: 'Commerce Stream Topper — 100/100 in Accountancy',
    isFeatured: true,
    pdfFileName: 'Std_XI_Commerce_Annual_Results_2025_2026.pdf',
    records: [
      { roll: 'XI-COM-008', name: 'Kumari Radhika Ulhas Komarpant', score: '94.60%', grade: 'Distinction', remarks: 'Stream Rank 1' },
      { roll: 'XI-COM-019', name: 'Master Samarth Gajanan Gaonkar', score: '92.80%', grade: 'Distinction', remarks: 'Stream Rank 2' },
      { roll: 'XI-COM-026', name: 'Kumari Priyanka Prakash Bhandari', score: '90.20%', grade: 'Distinction', remarks: 'Stream Rank 3' },
    ],
  },
  // Std XI - Arts
  {
    title: 'Std XI Higher Secondary Annual Results — Arts & Humanities',
    academicYear: '2025–2026',
    standard: 'XI',
    stream: 'Arts',
    examType: 'Annual Higher Secondary Examination',
    institutionCode: 'ANGLE_HSS',
    studentName: 'Kumari Sakshi Damodar Phaldessai',
    rollNumber: 'XI-ART-004',
    percentage: 93.5,
    grade: 'Distinction',
    remarks: 'Arts Stream Topper — Highest in Political Science & History',
    isFeatured: false,
    pdfFileName: 'Std_XI_Arts_Annual_Results_2025_2026.pdf',
    records: [
      { roll: 'XI-ART-004', name: 'Kumari Sakshi Damodar Phaldessai', score: '93.50%', grade: 'Distinction', remarks: 'Stream Rank 1' },
      { roll: 'XI-ART-011', name: 'Master Harsh Shrikant Velip', score: '90.40%', grade: 'Distinction', remarks: 'Stream Rank 2' },
    ],
  },

  // Std XII - Science
  {
    title: 'Goa Board HSSC Examination 2025–2026 — Science Stream Official Gazette',
    academicYear: '2025–2026',
    standard: 'XII',
    stream: 'Science',
    examType: 'Goa Board HSSC Examination (Official)',
    institutionCode: 'ANGLE_HSS',
    studentName: 'Master Soham Dnyaneshwar Pagi',
    rollNumber: 'HSSC-SCI-2026-302',
    percentage: 97.6,
    grade: 'Distinction',
    remarks: 'South Goa District Rank 2 — Outstanding Excellence in Science',
    isFeatured: true,
    pdfFileName: 'Goa_Board_HSSC_Science_Results_2025_2026.pdf',
    records: [
      { roll: 'HSSC-SCI-302', name: 'Master Soham Dnyaneshwar Pagi', score: '97.60%', grade: 'Distinction', remarks: 'District Rank 2 — Stream Topper' },
      { roll: 'HSSC-SCI-314', name: 'Kumari Tanvi Kishor Gaonkar', score: '96.20%', grade: 'Distinction', remarks: 'School Rank 2 — Distinction' },
      { roll: 'HSSC-SCI-325', name: 'Master Prathamesh Anil Velip', score: '94.80%', grade: 'Distinction', remarks: 'School Rank 3 — Distinction' },
      { roll: 'HSSC-SCI-338', name: 'Kumari Natasha Sudesh Desai', score: '93.50%', grade: 'Distinction', remarks: 'Distinction' },
    ],
  },
  // Std XII - Commerce
  {
    title: 'Goa Board HSSC Examination 2025–2026 — Commerce Stream Official Gazette',
    academicYear: '2025–2026',
    standard: 'XII',
    stream: 'Commerce',
    examType: 'Goa Board HSSC Examination (Official)',
    institutionCode: 'ANGLE_HSS',
    studentName: 'Kumari Siddhi Gurunath Komarpant',
    rollNumber: 'HSSC-COM-2026-418',
    percentage: 96.8,
    grade: 'Distinction',
    remarks: 'Canacona Taluka Commerce Topper — 99/100 in Economics',
    isFeatured: true,
    pdfFileName: 'Goa_Board_HSSC_Commerce_Results_2025_2026.pdf',
    records: [
      { roll: 'HSSC-COM-418', name: 'Kumari Siddhi Gurunath Komarpant', score: '96.80%', grade: 'Distinction', remarks: 'Taluka Topper — Rank 1' },
      { roll: 'HSSC-COM-427', name: 'Master Kunal Jaywant Naik', score: '95.00%', grade: 'Distinction', remarks: 'Rank 2 — Distinction' },
      { roll: 'HSSC-COM-436', name: 'Kumari Manasi Chandrakant Velip', score: '93.20%', grade: 'Distinction', remarks: 'Rank 3 — Distinction' },
    ],
  },
  // Std XII - Arts
  {
    title: 'Goa Board HSSC Examination 2025–2026 — Arts & Humanities Official Gazette',
    academicYear: '2025–2026',
    standard: 'XII',
    stream: 'Arts',
    examType: 'Goa Board HSSC Examination (Official)',
    institutionCode: 'ANGLE_HSS',
    studentName: 'Kumari Avanti Rajendra Phaldessai',
    rollNumber: 'HSSC-ART-2026-109',
    percentage: 94.4,
    grade: 'Distinction',
    remarks: 'Arts Stream Topper — Highest Marks in Psychology & Literature',
    isFeatured: true,
    pdfFileName: 'Goa_Board_HSSC_Arts_Results_2025_2026.pdf',
    records: [
      { roll: 'HSSC-ART-109', name: 'Kumari Avanti Rajendra Phaldessai', score: '94.40%', grade: 'Distinction', remarks: 'Stream Topper — Rank 1' },
      { roll: 'HSSC-ART-118', name: 'Master Rohan Suresh Gaonkar', score: '92.60%', grade: 'Distinction', remarks: 'Stream Rank 2' },
      { roll: 'HSSC-ART-125', name: 'Kumari Payal Mangesh Naik', score: '90.50%', grade: 'Distinction', remarks: 'Stream Rank 3' },
    ],
  },
];

function generatePdfForResult(item: StdResultData): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfPath = path.join(UPLOADS_DIR, item.pdfFileName);
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const writeStream = fs.createWriteStream(pdfPath);

    doc.pipe(writeStream);

    // Decorative top header bar
    doc.fillColor('#0b132b').rect(0, 0, doc.page.width, 95).fill();
    doc.fillColor('#d4af37').rect(0, 95, doc.page.width, 4).fill();

    // Trust Header
    doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold').text('SHREE NIRAKAR EDUCATION SOCIETY', 40, 22, { align: 'center' });
    
    let institutionName = 'Shree Nirakar High School, Mashem, Canacona - Goa';
    if (item.institutionCode === 'TUDAL_HS') {
      institutionName = 'Shree Nirakar Tudal High School, Gaodongrem, Canacona - Goa';
    } else if (item.institutionCode === 'ANGLE_HSS') {
      institutionName = 'Shree Nirakar S. S. Angle Higher Secondary School, Mashem, Canacona - Goa';
    }
    
    doc.fontSize(10).font('Helvetica').fillColor('#cbd5e1').text(institutionName, 40, 44, { align: 'center' });
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#fbbf24').text(
      `OFFICIAL EXAMINATION MERIT GAZETTE & SCORE REGISTER (${item.academicYear})`,
      40,
      64,
      { align: 'center' }
    );

    // Sub-banner info
    doc.moveDown(3);
    doc.fillColor('#1e293b').fontSize(13).font('Helvetica-Bold').text(item.title, 40, 115);
    
    doc.fontSize(9).font('Helvetica').fillColor('#475569');
    const stdStreamText = item.stream ? `Standard: Std ${item.standard} (${item.stream} Stream)` : `Standard: Std ${item.standard}`;
    doc.text(`${stdStreamText}  |  Examination: ${item.examType}`, 40, 135);
    doc.text(`Official Date of Issue: 24th October 2026  |  Status: Verified & Certified`, 40, 150);

    // Merit Topper Highlight Card
    doc.fillColor('#f8fafc').roundedRect(40, 170, doc.page.width - 80, 52, 6).fill();
    doc.lineWidth(1).strokeColor('#e2e8f0').roundedRect(40, 170, doc.page.width - 80, 52, 6).stroke();

    doc.fillColor('#0b132b').fontSize(9).font('Helvetica-Bold').text('MERIT TOPPER HONOUR:', 52, 180);
    doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text(item.studentName, 52, 196);
    doc.fillColor('#047857').fontSize(11).font('Helvetica-Bold').text(`${item.percentage}% (${item.grade})`, doc.page.width - 170, 180, { align: 'right' });
    doc.fillColor('#64748b').fontSize(8).font('Helvetica').text(item.remarks, 52, 210, { width: 380 });

    // Table Header
    let y = 238;
    doc.fillColor('#0b132b').rect(40, y, doc.page.width - 80, 24).fill();
    doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
    doc.text('Seat / Roll No.', 48, y + 7, { width: 90 });
    doc.text('Student Full Name', 145, y + 7, { width: 175 });
    doc.text('Percentage', 330, y + 7, { width: 70 });
    doc.text('Grade', 410, y + 7, { width: 55 });
    doc.text('Merit Standing', 475, y + 7, { width: 80 });

    y += 24;

    doc.font('Helvetica').fontSize(9).fillColor('#1e293b');

    item.records.forEach((rec, idx) => {
      if (idx % 2 === 1) {
        doc.fillColor('#f8fafc').rect(40, y, doc.page.width - 80, 22).fill();
        doc.fillColor('#1e293b');
      }

      doc.text(rec.roll, 48, y + 6, { width: 90, lineBreak: false });
      doc.text(rec.name, 145, y + 6, { width: 175, lineBreak: false });
      doc.text(rec.score, 330, y + 6, { width: 70, lineBreak: false });
      doc.text(rec.grade, 410, y + 6, { width: 55, lineBreak: false });
      doc.text(rec.remarks, 475, y + 6, { width: 80, lineBreak: false });

      y += 22;
    });

    // Institutional Seals and Signature Section
    const sigY = doc.page.height - 110;
    doc.moveTo(40, sigY).lineTo(doc.page.width - 40, sigY).strokeColor('#cbd5e1').lineWidth(0.75).stroke();

    // Dual Signatures
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#0f172a');
    doc.text('Exam Committee In-Charge', 50, sigY + 35);
    doc.fontSize(7).font('Helvetica').fillColor('#64748b').text('Shree Nirakar Education Society', 50, sigY + 47);

    // Official Stamp seal representation
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#94a3b8').text('[ OFFICIAL SEAL ]', 0, sigY + 35, { align: 'center' });

    doc.fontSize(8).font('Helvetica-Bold').fillColor('#0f172a').text('Headmaster / Principal', doc.page.width - 190, sigY + 35, { align: 'right' });
    doc.fontSize(7).font('Helvetica').fillColor('#64748b').text(institutionName.split(',')[0], doc.page.width - 190, sigY + 47, { align: 'right' });

    // Footer note
    doc.fontSize(7).font('Helvetica').fillColor('#94a3b8').text(
      'This document is an authentic computerized academic result gazette certified by the examination board of Shree Nirakar Education Society, Canacona, Goa.',
      40,
      doc.page.height - 35,
      { align: 'center', width: doc.page.width - 80 }
    );

    doc.end();

    writeStream.on('finish', () => {
      resolve(`/uploads/${item.pdfFileName}`);
    });
    writeStream.on('error', reject);
  });
}

async function main() {
  console.log('Seeding official academic results for all standards (V through XII)...');

  // Clear existing dummy results if any to avoid duplicates
  const deleted = await prisma.academicResult.deleteMany({});
  console.log(`Cleared ${deleted.count} existing records.`);

  for (const item of RESULTS_DATA) {
    const pdfUrl = await generatePdfForResult(item);
    console.log(`Generated PDF: ${pdfUrl}`);

    await prisma.academicResult.create({
      data: {
        title: item.title,
        academicYear: item.academicYear,
        standard: item.standard,
        examType: item.examType,
        stream: item.stream || null,
        institutionCode: item.institutionCode as any,
        studentName: item.studentName,
        rollNumber: item.rollNumber,
        percentage: item.percentage,
        grade: item.grade,
        remarks: item.remarks,
        pdfUrl: pdfUrl,
        isFeatured: item.isFeatured,
      },
    });
  }

  const finalCount = await prisma.academicResult.count();
  console.log(`\nSUCCESS! Inserted ${finalCount} academic result entries across standards V, VI, VII, VIII, IX, X, XI, XII.`);
}

main()
  .catch((e) => {
    console.error('FAILED TO SEED RESULTS:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
