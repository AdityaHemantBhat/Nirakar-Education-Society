import { prisma } from '@nirakar/db';
import { AcademicResultCreateInput, AcademicResultQueryInput, AcademicResultUpdateInput } from '@nirakar/shared';
import { AppError } from '../../middleware/error.js';

export class AcademicResultsService {
  async getResults(query: AcademicResultQueryInput) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.standard) {
      where.standard = query.standard.toUpperCase();
    }
    if (query.academicYear) {
      where.academicYear = query.academicYear;
    }
    if (query.institutionCode) {
      where.institutionCode = query.institutionCode;
    }
    if (query.stream) {
      where.stream = { contains: query.stream, mode: 'insensitive' };
    }
    if (query.featured === 'true') {
      where.isFeatured = true;
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { examType: { contains: query.search, mode: 'insensitive' } },
        { studentName: { contains: query.search, mode: 'insensitive' } },
        { rollNumber: { contains: query.search, mode: 'insensitive' } },
        { remarks: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.academicResult.findMany({
        where,
        orderBy: [{ isFeatured: 'desc' }, { percentage: 'desc' }, { studentName: 'asc' }],
        skip,
        take: limit,
      }),
      prisma.academicResult.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getResultById(id: string) {
    const result = await prisma.academicResult.findUnique({ where: { id } });
    if (!result) throw new AppError('NOT_FOUND', 'Academic result not found', 404);
    return result;
  }

  async createResult(input: AcademicResultCreateInput) {
    return prisma.academicResult.create({
      data: {
        title: input.title || null,
        academicYear: input.academicYear,
        standard: input.standard as any,
        examType: input.examType,
        pdfUrl: input.pdfUrl || null,
        studentName: input.studentName || null,
        rollNumber: input.rollNumber || null,
        percentage: input.percentage ?? null,
        cgpa: input.cgpa ?? null,
        grade: input.grade || null,
        stream: input.stream || null,
        institutionCode: (input.institutionCode as any) || 'NIRAKAR_HS',
        remarks: input.remarks || null,
        photoUrl: input.photoUrl || null,
        isFeatured: input.isFeatured ?? false,
      },
    });
  }

  async updateResult(id: string, input: AcademicResultUpdateInput) {
    await this.getResultById(id);
    return prisma.academicResult.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title || null } : {}),
        ...(input.academicYear !== undefined ? { academicYear: input.academicYear } : {}),
        ...(input.standard !== undefined ? { standard: input.standard as any } : {}),
        ...(input.examType !== undefined ? { examType: input.examType } : {}),
        ...(input.pdfUrl !== undefined ? { pdfUrl: input.pdfUrl || null } : {}),
        ...(input.studentName !== undefined ? { studentName: input.studentName || null } : {}),
        ...(input.rollNumber !== undefined ? { rollNumber: input.rollNumber || null } : {}),
        ...(input.percentage !== undefined ? { percentage: input.percentage ?? null } : {}),
        ...(input.cgpa !== undefined ? { cgpa: input.cgpa ?? null } : {}),
        ...(input.grade !== undefined ? { grade: input.grade || null } : {}),
        ...(input.stream !== undefined ? { stream: input.stream || null } : {}),
        ...(input.institutionCode !== undefined ? { institutionCode: input.institutionCode as any } : {}),
        ...(input.remarks !== undefined ? { remarks: input.remarks || null } : {}),
        ...(input.photoUrl !== undefined ? { photoUrl: input.photoUrl || null } : {}),
        ...(input.isFeatured !== undefined ? { isFeatured: input.isFeatured } : {}),
      },
    });
  }

  async deleteResult(id: string) {
    await this.getResultById(id);
    return prisma.academicResult.delete({ where: { id } });
  }
}
