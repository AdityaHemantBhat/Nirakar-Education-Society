import PDFDocument from 'pdfkit';

export interface AdmissionPdfData {
  applicationNumber: string;
  academicYear: string;
  institutionName: string;
  gradeApplied: string;
  stream?: string | null;
  studentName: string;
  dob: string | Date;
  gender: string;
  placeOfBirth?: string | null;
  nationality: string;
  motherTongue: string;
  aadhaarNumber: string;
  category: string;
  bloodGroup?: string | null;
  fatherName: string;
  fatherOccupation?: string | null;
  motherName: string;
  motherOccupation?: string | null;
  primaryPhone: string;
  alternatePhone?: string | null;
  email: string;
  address: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  pincode: string;
  previousSchool?: string | null;
  previousClass?: string | null;
  previousPercentage?: number | string | null;
  status: string;
  createdAt: string | Date;
}

export const inferPreviousClass = (gradeApplied?: string, enteredPreviousClass?: string) => {
  if (enteredPreviousClass && enteredPreviousClass.trim() && enteredPreviousClass.trim().toUpperCase() !== 'N/A') {
    return enteredPreviousClass.trim();
  }
  if (!gradeApplied) return '';
  const g = gradeApplied.toLowerCase();
  if (g.includes('xi') && !g.includes('xii')) return 'Class X (SSCE)';
  if (g.includes('xii')) return 'Class XI';
  if (g.includes('v') && !g.includes('vi') && !g.includes('vii') && !g.includes('viii')) return 'Class IV';
  if (g.includes('vi') && !g.includes('vii') && !g.includes('viii')) return 'Class V';
  if (g.includes('vii') && !g.includes('viii')) return 'Class VI';
  if (g.includes('viii')) return 'Class VII';
  if (g.includes('ix')) return 'Class VIII';
  if (g.includes('x')) return 'Class IX';
  return '';
};

export const formatPreviousAcademicRecord = (
  gradeApplied?: string,
  prevClass?: string,
  percentage?: number | string | null
) => {
  const resolvedClass = inferPreviousClass(gradeApplied, prevClass);
  const hasPercentage =
    percentage !== null &&
    percentage !== undefined &&
    percentage !== '' &&
    percentage !== 'N/A' &&
    percentage !== 'undefined';

  if (resolvedClass && hasPercentage) {
    return `${resolvedClass} (${percentage}%)`;
  }
  if (hasPercentage) {
    return `${percentage}%`;
  }
  if (resolvedClass) {
    return resolvedClass;
  }
  return 'Not Specified';
};

export const getApplicantLocation = (data: any) => {
  if (data?.village && data?.taluka) {
    return `${data.village}, ${data.taluka}`;
  }
  if (data?.village) {
    return `${data.village}, Goa`;
  }
  if (data?.taluka) {
    return `${data.taluka}, Goa`;
  }
  if (data?.placeOfBirth) {
    return data.placeOfBirth;
  }
  return 'Canacona, Goa';
};

export function generateAdmissionApplicationPdf(
  data: AdmissionPdfData,
  photoBuffer?: Buffer | null,
  signatureBuffer?: Buffer | null
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const margin = 24;
      const pageWidth = 595.28;
      const pageHeight = 841.89;
      const contentWidth = pageWidth - margin * 2; // 547.28

      const doc = new PDFDocument({
        size: 'A4',
        margin: margin,
        info: {
          Title: `Official Admission Form - ${data.applicationNumber}`,
          Author: 'Shri Nirakar Education Society',
          Subject: `Student Admission Form: ${data.studentName}`,
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // 1. Clean Government-School Outer Frame (Covering full A4 page)
      doc.rect(margin, margin, contentWidth, pageHeight - margin * 2)
        .lineWidth(1.2)
        .strokeColor('#000000')
        .stroke();

      let y = margin + 5; // y = 29

      const formattedDate = new Date(data.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      // 2. Application Ref No. & Filing Date (Top Boundary Bar)
      doc.font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor('#000000')
        .text('APPLICATION REF. NO.: ', margin + 8, y, { continued: true })
        .font('Helvetica-Bold')
        .text(data.applicationNumber);

      doc.font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor('#000000')
        .text(`DATE OF FILING: ${formattedDate}`, pageWidth - margin - 180, y, { width: 172, align: 'right' });

      y += 14;
      doc.moveTo(margin, y)
        .lineTo(pageWidth - margin, y)
        .lineWidth(0.8)
        .strokeColor('#000000')
        .stroke();

      // 3. Institutional Top Header
      y += 6;
      doc.font('Helvetica-Bold')
        .fontSize(15.5)
        .fillColor('#000000')
        .text('SHRI NIRAKAR EDUCATION SOCIETY', margin, y, { align: 'center', width: contentWidth });

      y += 18;
      doc.font('Helvetica-Bold')
        .fontSize(9.5)
        .fillColor('#000000')
        .text('CANACONA, SOUTH GOA — 403728', margin, y, { align: 'center', width: contentWidth });

      y += 13;
      doc.font('Helvetica')
        .fontSize(8.5)
        .fillColor('#222222')
        .text('(Recognised by Directorate of Education, Govt. of Goa & Affiliated to G.B.S.H.S.E.)', margin, y, { align: 'center', width: contentWidth });

      y += 12;
      doc.moveTo(margin, y)
        .lineTo(pageWidth - margin, y)
        .lineWidth(0.8)
        .strokeColor('#000000')
        .stroke();

      y += 6;

      // Clean Title Box
      const titleBoxW = contentWidth - 80;
      const titleBoxX = margin + 40;
      doc.rect(titleBoxX, y, titleBoxW, 20)
        .fillAndStroke('#ffffff', '#000000');

      doc.font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#000000')
        .text(`APPLICATION FORM FOR ADMISSION (${data.academicYear})`, titleBoxX, y + 5.5, {
          align: 'center',
          width: titleBoxW,
        });

      y += 26; // y = ~124

      // 4. Campus, Standard & Candidate Passport Photo Block
      const photoWidth = 92;
      const photoHeight = 118;
      const photoX = pageWidth - margin - photoWidth - 4;
      const photoY = y;

      // Draw photo container box
      doc.rect(photoX, photoY, photoWidth, photoHeight)
        .lineWidth(0.8)
        .strokeColor('#000000')
        .stroke();

      if (photoBuffer && photoBuffer.length > 0) {
        try {
          doc.image(photoBuffer, photoX + 2, photoY + 2, {
            fit: [photoWidth - 4, photoHeight - 18],
            align: 'center',
            valign: 'center',
          });
          doc.rect(photoX, photoY + photoHeight - 15, photoWidth, 15)
            .fillAndStroke('#ffffff', '#000000');
          doc.font('Helvetica-Bold')
            .fontSize(7)
            .fillColor('#000000')
            .text('CANDIDATE PHOTO', photoX, photoY + photoHeight - 11, {
              width: photoWidth,
              align: 'center',
            });
        } catch {
          doc.font('Helvetica-Bold')
            .fontSize(7.5)
            .fillColor('#333333')
            .text('AFFIX RECENT\nPASSPORT SIZE\nPHOTO', photoX + 2, photoY + 45, {
              width: photoWidth - 4,
              align: 'center',
            });
        }
      } else {
        doc.font('Helvetica-Bold')
          .fontSize(7.5)
          .fillColor('#333333')
          .text('AFFIX RECENT\nPASSPORT SIZE\nPHOTO (ATTESTED)', photoX + 2, photoY + 42, {
            width: photoWidth - 4,
            align: 'center',
          });
      }

      // Meta Table Alongside Photo (4 rows of 29.5 pt = exactly 118 pt)
      const metaWidth = contentWidth - photoWidth - 8;
      const rowH = 29.5;

      const renderMetaRow = (label1: string, val1: string, label2?: string, val2?: string) => {
        doc.rect(margin, y, metaWidth, rowH)
          .lineWidth(0.5)
          .strokeColor('#000000')
          .stroke();

        if (label2 && val2) {
          const halfW = metaWidth / 2;
          doc.moveTo(margin + halfW, y).lineTo(margin + halfW, y + rowH).stroke();

          doc.font('Helvetica-Bold').fontSize(7).fillColor('#444444').text(label1.toUpperCase(), margin + 5, y + 3.5);
          doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000').text(val1, margin + 5, y + 14, { width: halfW - 10, ellipsis: true });

          doc.font('Helvetica-Bold').fontSize(7).fillColor('#444444').text(label2.toUpperCase(), margin + halfW + 5, y + 3.5);
          doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000').text(val2, margin + halfW + 5, y + 14, { width: halfW - 10, ellipsis: true });
        } else {
          doc.font('Helvetica-Bold').fontSize(7).fillColor('#444444').text(label1.toUpperCase(), margin + 5, y + 3.5);
          doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#000000').text(val1, margin + 5, y + 14, { width: metaWidth - 10, ellipsis: true });
        }
        y += rowH;
      };

      renderMetaRow('Institution / Campus', data.institutionName);
      renderMetaRow(
        'Class & Stream Applied',
        `${data.gradeApplied}${data.stream ? ` — ${data.stream}` : ''}`
      );
      renderMetaRow('Admission Category', data.category || 'GENERAL', 'Medium of Instruction', 'English');
      renderMetaRow('Admission Status', data.status || 'SUBMITTED', 'Academic Session', data.academicYear);

      // Ensure y aligns with bottom of photo block
      if (y < photoY + photoHeight) {
        y = photoY + photoHeight;
      }

      y += 6;

      // Helper function to render clean government section header
      const renderSectionHeader = (title: string) => {
        doc.rect(margin, y, contentWidth, 16)
          .fillAndStroke('#ffffff', '#000000');
        doc.font('Helvetica-Bold')
          .fontSize(8.5)
          .fillColor('#000000')
          .text(title.toUpperCase(), margin + 6, y + 4.5);
        y += 16;
      };

      // Helper to render clean tabular rows
      const renderGridRow = (cols: { label: string; value: string; widthRatio?: number }[], customRowHeight = 26) => {
        doc.rect(margin, y, contentWidth, customRowHeight)
          .lineWidth(0.5)
          .strokeColor('#000000')
          .stroke();

        let currentX = margin;
        cols.forEach((col, idx) => {
          const colWidth = contentWidth * (col.widthRatio || 1 / cols.length);
          if (idx > 0) {
            doc.moveTo(currentX, y)
              .lineTo(currentX, y + customRowHeight)
              .lineWidth(0.5)
              .strokeColor('#000000')
              .stroke();
          }

          doc.font('Helvetica-Bold')
            .fontSize(6.5)
            .fillColor('#444444')
            .text(col.label.toUpperCase(), currentX + 5, y + 3);

          doc.font('Helvetica-Bold')
            .fontSize(9)
            .fillColor('#000000')
            .text(col.value || 'N/A', currentX + 5, y + 13, {
              width: colWidth - 10,
              ellipsis: true,
            });

          currentX += colWidth;
        });

        y += customRowHeight;
      };

      // 5. Section I: Candidate Legal Particulars
      renderSectionHeader('I. Candidate Legal Particulars');
      renderGridRow([
        { label: 'Candidate Full Name (in Block Letters)', value: data.studentName.toUpperCase(), widthRatio: 0.65 },
        { label: 'Gender', value: data.gender, widthRatio: 0.35 },
      ], 26);

      const dobString = new Date(data.dob).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      renderGridRow([
        { label: 'Date of Birth (DD/MM/YYYY)', value: dobString, widthRatio: 0.24 },
        { label: 'Place of Birth', value: data.placeOfBirth || 'Canacona, Goa', widthRatio: 0.26 },
        { label: 'Aadhaar Number (UIDAI)', value: data.aadhaarNumber.replace(/(\d{4})/g, '$1 ').trim(), widthRatio: 0.25 },
        { label: 'Social Category', value: data.category, widthRatio: 0.25 },
      ], 26);

      renderGridRow([
        { label: 'Nationality', value: data.nationality || 'Indian', widthRatio: 0.35 },
        { label: 'Mother Tongue', value: data.motherTongue, widthRatio: 0.35 },
        { label: 'Blood Group', value: data.bloodGroup || 'O+', widthRatio: 0.3 },
      ], 26);

      y += 6;

      // 6. Section II: Parent / Guardian Details
      renderSectionHeader('II. Parent & Guardian Particulars');
      renderGridRow([
        { label: "Father's Full Name", value: data.fatherName, widthRatio: 0.5 },
        { label: "Father's Occupation", value: data.fatherOccupation || 'Employed / Self-Employed', widthRatio: 0.5 },
      ], 26);
      renderGridRow([
        { label: "Mother's Full Name", value: data.motherName, widthRatio: 0.5 },
        { label: "Mother's Occupation", value: data.motherOccupation || 'Homemaker', widthRatio: 0.5 },
      ], 26);
      renderGridRow([
        { label: 'Primary Contact Mobile (+91)', value: `+91 ${data.primaryPhone}`, widthRatio: 0.35 },
        { label: 'Alternate Mobile Contact', value: data.alternatePhone ? `+91 ${data.alternatePhone}` : 'N/A', widthRatio: 0.3 },
        { label: 'Correspondence Email', value: data.email, widthRatio: 0.35 },
      ], 26);
      renderGridRow([
        {
          label: 'Residential House Address',
          value: `${data.address}, ${data.village}, ${data.taluka}, ${data.district}, ${data.state} — PIN: ${data.pincode}`,
          widthRatio: 1.0,
        },
      ], 26);

      y += 6;

      // 7. Section III: Previous Academic Record
      renderSectionHeader('III. Previous Academic Record');
      const academicRecordString = formatPreviousAcademicRecord(
        data.gradeApplied,
        data.previousClass || undefined,
        data.previousPercentage
      );
      renderGridRow([
        { label: 'Last School / Institution Attended', value: data.previousSchool || 'Not Specified', widthRatio: 0.6 },
        { label: 'Class Passed & Score', value: academicRecordString, widthRatio: 0.4 },
      ], 28);

      y += 6;

      // 8. Section IV: Declaration & Signatures
      const decHeight = 84;
      doc.rect(margin, y, contentWidth, decHeight)
        .lineWidth(0.5)
        .strokeColor('#000000')
        .stroke();

      doc.font('Helvetica-Bold')
        .fontSize(7.5)
        .fillColor('#000000')
        .text('DECLARATION & UNDERTAKING BY APPLICANT AND PARENT / GUARDIAN:', margin + 6, y + 4);

      doc.font('Helvetica')
        .fontSize(7)
        .fillColor('#222222')
        .text(
          'I hereby certify that the particulars furnished in this admission application are true and correct to the best of my knowledge and belief. If admitted, we promise to strictly abide by all rules, academic regulations, and discipline of the school and the Goa Board.',
          margin + 6,
          y + 14,
          { width: contentWidth - 12, lineGap: 1.5 }
        );

      const sigY = y + 54;

      // Render Candidate Signature image if present
      if (signatureBuffer && signatureBuffer.length > 0) {
        try {
          doc.image(signatureBuffer, margin + 200, sigY - 20, {
            fit: [100, 20],
            align: 'center',
            valign: 'center',
          });
        } catch {}
      }

      const applicantLocation = getApplicantLocation(data);

      doc.font('Helvetica')
        .fontSize(7.5)
        .fillColor('#444444')
        .text('_________________________________', margin + 15, sigY)
        .font('Helvetica-Bold')
        .fontSize(7.5)
        .fillColor('#000000')
        .text('Signature of Parent / Guardian', margin + 15, sigY + 12);

      doc.font('Helvetica')
        .fontSize(7.5)
        .fillColor('#444444')
        .text('_________________________________', margin + 200, sigY)
        .font('Helvetica-Bold')
        .fontSize(7.5)
        .fillColor('#000000')
        .text('Signature of Candidate', margin + 200, sigY + 12);

      doc.font('Helvetica-Bold')
        .fontSize(7.5)
        .fillColor('#000000')
        .text(`Date: ${formattedDate}`, margin + 390, sigY - 4)
        .text(`Place: ${applicantLocation}`, margin + 390, sigY + 7)
        .font('Helvetica-Bold')
        .fontSize(7.5)
        .fillColor('#000000')
        .text('Date & Place', margin + 390, sigY + 18);

      y += decHeight + 6;

      // 9. Section V: Official School Scrutiny with Large Dedicated Headmaster Stamp Box
      // Remaining page space: fills down to bottom border
      const officeBoxHeight = (pageHeight - margin) - y - 3; // Fills precisely to the bottom outer border!
      doc.rect(margin, y, contentWidth, officeBoxHeight)
        .fillAndStroke('#ffffff', '#000000');

      doc.font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor('#000000')
        .text('FOR OFFICE / SCHOOL SCRUTINY & VERIFICATION ONLY', margin + 6, y + 4.5);

      // Checkboxes row
      const checklistY = y + 18;
      doc.font('Helvetica')
        .fontSize(7.5)
        .fillColor('#000000')
        .text('[   ] Birth Certificate Verified', margin + 10, checklistY)
        .text('[   ] Transfer Certificate (TC/LC)', margin + 145, checklistY)
        .text('[   ] Aadhaar Card Copy Attached', margin + 285, checklistY)
        .text('[   ] Marksheet Verified', margin + 425, checklistY);

      doc.moveTo(margin, y + 30)
        .lineTo(pageWidth - margin, y + 30)
        .lineWidth(0.5)
        .strokeColor('#000000')
        .stroke();

      // Right stamp box sizing
      const stampBoxW = 195;
      const stampBoxH = officeBoxHeight - 40;
      const stampBoxX = pageWidth - margin - stampBoxW - 8;
      const stampBoxY = y + 35;

      // Vertical dividing line between left administrative column and right stamp column
      const dividerX = stampBoxX - 12;
      doc.moveTo(dividerX, y + 30)
        .lineTo(dividerX, y + officeBoxHeight)
        .lineWidth(0.5)
        .strokeColor('#000000')
        .stroke();

      // Left column: office record lines
      const offLeftY = y + 40;
      doc.font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor('#000000')
        .text('Admission Granted to Class: ________________________    Div: ____________', margin + 10, offLeftY)
        .text('General Register (G.R.) No.: ________________________________', margin + 10, offLeftY + 24)
        .text('Date of Admission: ________________________________', margin + 10, offLeftY + 48)
        .text('Scrutiny Clerk Signature: ________________________________', margin + 10, offLeftY + 72);

      // Right column: Dedicated Headmaster Stamp & Signature Box
      doc.rect(stampBoxX, stampBoxY, stampBoxW, stampBoxH)
        .lineWidth(0.8)
        .strokeColor('#000000')
        .dash(3, { space: 3 })
        .stroke()
        .undash();

      doc.font('Helvetica-Bold')
        .fontSize(7.5)
        .fillColor('#000000')
        .text('[ OFFICIAL SCHOOL SEAL / STAMP ]', stampBoxX, stampBoxY + 6, { width: stampBoxW, align: 'center' });

      // Headmaster Signature line at bottom of stamp box
      const hmSigY = stampBoxY + stampBoxH - 22;
      doc.moveTo(stampBoxX + 15, hmSigY)
        .lineTo(stampBoxX + stampBoxW - 15, hmSigY)
        .lineWidth(0.6)
        .strokeColor('#000000')
        .stroke();

      doc.font('Helvetica-Bold')
        .fontSize(7.5)
        .fillColor('#000000')
        .text('Headmaster / Principal Seal & Sign', stampBoxX, hmSigY + 5, { width: stampBoxW, align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
