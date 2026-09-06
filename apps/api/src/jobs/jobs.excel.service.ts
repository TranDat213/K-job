import { Injectable, BadRequestException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { JobStatus, JobType } from '@prisma/client';

export interface RowValidationError {
  row: number;
  column?: string;
  message: string;
}

export interface ParsedJobRow {
  rowNumber: number;
  name: string;
  brandName: string;
  jobType: JobType;
  status: JobStatus;
  quantity?: number;
  requirement?: string;
  brief?: string;
  receivedDate?: Date;
  demoDate?: Date;
  postDate?: Date;
  paymentExpectedDate?: Date;
}

export const JOB_TYPE_MAP: Record<string, string> = {
  PRODUCT_REVIEW: 'Review sản phẩm',
  EVENT: 'Đi sự kiện',
  SELF_PURCHASE: 'Tự mua hàng',
  CONTENT_CREATION: 'Sáng tạo nội dung',
  AFFILIATE: 'Affiliate',
  OTHER: 'Khác',
};

export const REVERSE_JOB_TYPE_MAP: Record<string, JobType> = {
  'review san pham': JobType.PRODUCT_REVIEW,
  'review sản phẩm': JobType.PRODUCT_REVIEW,
  'product_review': JobType.PRODUCT_REVIEW,
  'product review': JobType.PRODUCT_REVIEW,
  'di su kien': JobType.EVENT,
  'đi sự kiện': JobType.EVENT,
  'event': JobType.EVENT,
  'tu mua hang': JobType.SELF_PURCHASE,
  'tự mua hàng': JobType.SELF_PURCHASE,
  'self_purchase': JobType.SELF_PURCHASE,
  'self purchase': JobType.SELF_PURCHASE,
  'sang tao noi dung': JobType.CONTENT_CREATION,
  'sáng tạo nội dung': JobType.CONTENT_CREATION,
  'content_creation': JobType.CONTENT_CREATION,
  'content creation': JobType.CONTENT_CREATION,
  'affiliate': JobType.AFFILIATE,
  'khac': JobType.OTHER,
  'khác': JobType.OTHER,
  'other': JobType.OTHER,
};

export const JOB_STATUS_MAP: Record<string, string> = {
  DRAFT: 'Bản nháp',
  NEW: 'Mới tạo',
  WAITING_PRODUCT: 'Chờ nhận sản phẩm',
  PRODUCT_RECEIVED: 'Đã nhận sản phẩm',
  CREATING: 'Đang sản xuất',
  DEMO: 'Demo',
  REVISION: 'Chỉnh sửa',
  READY_TO_POST: 'Sẵn sàng đăng',
  POSTED: 'Đã đăng bài',
  WAITING_PAYMENT: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

export const REVERSE_JOB_STATUS_MAP: Record<string, JobStatus> = {
  'ban nhap': JobStatus.DRAFT,
  'bản nháp': JobStatus.DRAFT,
  'draft': JobStatus.DRAFT,
  'moi tao': JobStatus.NEW,
  'mới tạo': JobStatus.NEW,
  'new': JobStatus.NEW,
  'cho nhan san pham': JobStatus.WAITING_PRODUCT,
  'chờ nhận sản phẩm': JobStatus.WAITING_PRODUCT,
  'waiting_product': JobStatus.WAITING_PRODUCT,
  'da nhan san pham': JobStatus.PRODUCT_RECEIVED,
  'đã nhận sản phẩm': JobStatus.PRODUCT_RECEIVED,
  'product_received': JobStatus.PRODUCT_RECEIVED,
  'dang san xuat': JobStatus.CREATING,
  'đang sản xuất': JobStatus.CREATING,
  'creating': JobStatus.CREATING,
  'demo': JobStatus.DEMO,
  'chinh sua': JobStatus.REVISION,
  'chỉnh sửa': JobStatus.REVISION,
  'revision': JobStatus.REVISION,
  'san sang dang': JobStatus.READY_TO_POST,
  'sẵn sàng đăng': JobStatus.READY_TO_POST,
  'ready_to_post': JobStatus.READY_TO_POST,
  'da dang bai': JobStatus.POSTED,
  'đã đăng bài': JobStatus.POSTED,
  'da dang': JobStatus.POSTED,
  'đã đăng': JobStatus.POSTED,
  'posted': JobStatus.POSTED,
  'cho thanh toan': JobStatus.WAITING_PAYMENT,
  'chờ thanh toán': JobStatus.WAITING_PAYMENT,
  'waiting_payment': JobStatus.WAITING_PAYMENT,
  'da thanh toan': JobStatus.PAID,
  'đã thanh toán': JobStatus.PAID,
  'paid': JobStatus.PAID,
  'hoan thanh': JobStatus.COMPLETED,
  'hoàn thành': JobStatus.COMPLETED,
  'completed': JobStatus.COMPLETED,
  'da huy': JobStatus.CANCELLED,
  'đã hủy': JobStatus.CANCELLED,
  'cancelled': JobStatus.CANCELLED,
};

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function parseDateCell(val: any): { date?: Date; error?: string } {
  if (val === undefined || val === null || val === '') return { date: undefined };

  if (val instanceof Date) {
    if (isNaN(val.getTime())) return { error: 'Ngày không hợp lệ' };
    return { date: val };
  }

  if (typeof val === 'number') {
    // Excel date serial number
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (isNaN(date.getTime())) return { error: 'Ngày không hợp lệ' };
    return { date };
  }

  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return { date: undefined };

    // DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1;
      const year = parseInt(dmyMatch[3], 10);
      const parsed = new Date(year, month, day);
      if (parsed.getFullYear() === year && parsed.getMonth() === month && parsed.getDate() === day) {
        return { date: parsed };
      }
      return { error: `Ngày không hợp lệ (${trimmed})` };
    }

    // YYYY-MM-DD
    const ymdMatch = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (ymdMatch) {
      const year = parseInt(ymdMatch[1], 10);
      const month = parseInt(ymdMatch[2], 10) - 1;
      const day = parseInt(ymdMatch[3], 10);
      const parsed = new Date(year, month, day);
      if (parsed.getFullYear() === year && parsed.getMonth() === month && parsed.getDate() === day) {
        return { date: parsed };
      }
      return { error: `Ngày không hợp lệ (${trimmed})` };
    }

    const standardDate = new Date(trimmed);
    if (!isNaN(standardDate.getTime())) {
      return { date: standardDate };
    }

    return { error: `Định dạng ngày không hợp lệ (${trimmed}). Vui lòng dùng DD/MM/YYYY` };
  }

  return { error: 'Kiểu dữ liệu ngày không hợp lệ' };
}

function getCellValueAsString(val: any): string {
  if (val === undefined || val === null) return '';
  if (typeof val === 'object') {
    if (val.text) return String(val.text).trim();
    if (val.result) return String(val.result).trim();
    if (val.richText) return val.richText.map((rt: any) => rt.text).join('').trim();
  }
  return String(val).trim();
}

@Injectable()
export class JobsExcelService {
  // ─────────────────────────────────────────────────────────────────
  // EXPORT EXCEL
  // ─────────────────────────────────────────────────────────────────
  async generateExportWorkbook(jobs: any[]): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'KOC Manager';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Danh sách công việc', {
      views: [{ showGridLines: true }],
      properties: { tabColor: { argb: '2563EB' } },
    });

    // Define columns
    sheet.columns = [
      { header: 'STT', key: 'stt', width: 8 },
      { header: 'Tên công việc (*)', key: 'name', width: 32 },
      { header: 'Nhãn hàng (*)', key: 'brandName', width: 24 },
      { header: 'Loại công việc', key: 'jobType', width: 20 },
      { header: 'Trạng thái', key: 'status', width: 22 },
      { header: 'Số lượng', key: 'quantity', width: 12 },
      { header: 'Yêu cầu', key: 'requirement', width: 35 },
      { header: 'Tóm tắt brief', key: 'brief', width: 35 },
      { header: 'Ngày nhận SP', key: 'receivedDate', width: 16 },
      { header: 'Ngày demo', key: 'demoDate', width: 16 },
      { header: 'Ngày đăng', key: 'postDate', width: 16 },
      { header: 'Hạn thanh toán', key: 'paymentExpectedDate', width: 18 },
      { header: 'Số task', key: 'tasksCount', width: 12 },
      { header: 'Số tiền (VNĐ)', key: 'paymentAmount', width: 18 },
    ];

    // Header styling
    const headerRow = sheet.getRow(1);
    headerRow.height = 28;
    headerRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFF' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1E3A8A' }, // Navy blue
    };

    // Add data rows
    jobs.forEach((job, index) => {
      const paymentAmount =
        job.payments && job.payments.length > 0
          ? job.payments.reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0)
          : 0;

      const row = sheet.addRow({
        stt: index + 1,
        name: job.name,
        brandName: job.brand?.name || '—',
        jobType: JOB_TYPE_MAP[job.jobType] || job.jobType || 'Khác',
        status: JOB_STATUS_MAP[job.status] || job.status || 'Mới tạo',
        quantity: job.quantity || '',
        requirement: job.requirement || '',
        brief: job.brief || '',
        receivedDate: formatDate(job.receivedDate),
        demoDate: formatDate(job.demoDate),
        postDate: formatDate(job.postDate),
        paymentExpectedDate: formatDate(job.paymentExpectedDate),
        tasksCount: job._count?.tasks ?? job.tasks?.length ?? 0,
        paymentAmount: paymentAmount,
      });

      row.height = 22;
      row.alignment = { vertical: 'middle' };

      // Zebra striping
      if (index % 2 === 1) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F8FAFC' },
        };
      }

      // Border styling
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'E2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
          left: { style: 'thin', color: { argb: 'E2E8F0' } },
          right: { style: 'thin', color: { argb: 'E2E8F0' } },
        };
      });

      // Center alignment for specific columns
      row.getCell('stt').alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell('jobType').alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell('status').alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell('quantity').alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell('receivedDate').alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell('demoDate').alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell('postDate').alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell('paymentExpectedDate').alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell('tasksCount').alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell('paymentAmount').alignment = { vertical: 'middle', horizontal: 'right' };
      row.getCell('paymentAmount').numFmt = '#,##0';
    });

    return workbook;
  }

  // ─────────────────────────────────────────────────────────────────
  // TEMPLATE EXCEL FOR IMPORT
  // ─────────────────────────────────────────────────────────────────
  async generateTemplateWorkbook(): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'KOC Manager';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Mau_Nhap_Cong_Viec', {
      views: [{ showGridLines: true }],
      properties: { tabColor: { argb: '10B981' } },
    });

    sheet.columns = [
      { header: 'Tên công việc (*)', key: 'name', width: 32 },
      { header: 'Nhãn hàng (*)', key: 'brandName', width: 24 },
      { header: 'Loại công việc', key: 'jobType', width: 22 },
      { header: 'Trạng thái', key: 'status', width: 22 },
      { header: 'Số lượng', key: 'quantity', width: 12 },
      { header: 'Yêu cầu', key: 'requirement', width: 35 },
      { header: 'Tóm tắt brief', key: 'brief', width: 35 },
      { header: 'Ngày nhận SP (DD/MM/YYYY)', key: 'receivedDate', width: 26 },
      { header: 'Ngày demo (DD/MM/YYYY)', key: 'demoDate', width: 24 },
      { header: 'Ngày đăng (DD/MM/YYYY)', key: 'postDate', width: 24 },
      { header: 'Hạn thanh toán (DD/MM/YYYY)', key: 'paymentExpectedDate', width: 28 },
    ];

    const headerRow = sheet.getRow(1);
    headerRow.height = 30;
    headerRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFF' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0F766E' }, // Teal
    };

    // Sample rows
    const sampleData = [
      {
        name: 'Review Son môi M.A.C Matte',
        brandName: 'M.A.C Cosmetics',
        jobType: 'Review sản phẩm',
        status: 'Mới tạo',
        quantity: 1,
        requirement: 'Video TikTok 60s có gắn link bio và giỏ hàng',
        brief: 'Swatch 3 màu son tone đỏ, chất son mịn lì',
        receivedDate: '10/09/2026',
        demoDate: '15/09/2026',
        postDate: '20/09/2026',
        paymentExpectedDate: '30/09/2026',
      },
      {
        name: 'Tham gia sự kiện ra mắt BST Thu Đông',
        brandName: 'Zara Vietnam',
        jobType: 'Đi sự kiện',
        status: 'Đã nhận sản phẩm',
        quantity: 1,
        requirement: 'Check-in sự kiện + 1 Story + 1 Video Recap',
        brief: 'Trang phục tone be/nâu theo dress code sự kiện',
        receivedDate: '12/09/2026',
        demoDate: '',
        postDate: '18/09/2026',
        paymentExpectedDate: '28/09/2026',
      },
    ];

    sampleData.forEach((sample) => {
      const r = sheet.addRow(sample);
      r.height = 24;
      r.alignment = { vertical: 'middle' };
      r.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'E2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
          left: { style: 'thin', color: { argb: 'E2E8F0' } },
          right: { style: 'thin', color: { argb: 'E2E8F0' } },
        };
      });
    });

    // Add Instructions Sheet
    const guideSheet = workbook.addWorksheet('Hướng dẫn nhập', {
      views: [{ showGridLines: true }],
    });

    guideSheet.columns = [
      { header: 'Tên cột', key: 'col', width: 28 },
      { header: 'Quy tắc / Định dạng', key: 'rule', width: 50 },
      { header: 'Giá trị hợp lệ', key: 'values', width: 60 },
    ];

    const guideHeader = guideSheet.getRow(1);
    guideHeader.height = 26;
    guideHeader.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFF' } };
    guideHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '334155' },
    };

    guideSheet.addRow({
      col: 'Tên công việc (*)',
      rule: 'Bắt buộc nhập, không được để trống.',
      values: 'Ví dụ: Review Kem Chống Nắng Anessa',
    });
    guideSheet.addRow({
      col: 'Nhãn hàng (*)',
      rule: 'Bắt buộc. Nếu nhãn hàng chưa có, hệ thống sẽ tự động tạo mới.',
      values: 'Ví dụ: Anessa, L\'Oreal, Shopee...',
    });
    guideSheet.addRow({
      col: 'Loại công việc',
      rule: 'Tùy chọn. Mặc định là "Khác".',
      values: Object.values(JOB_TYPE_MAP).join(', '),
    });
    guideSheet.addRow({
      col: 'Trạng thái',
      rule: 'Tùy chọn. Mặc định là "Mới tạo".',
      values: Object.values(JOB_STATUS_MAP).join(', '),
    });
    guideSheet.addRow({
      col: 'Số lượng',
      rule: 'Tùy chọn. Phải là số nguyên > 0.',
      values: '1, 2, 5...',
    });
    guideSheet.addRow({
      col: 'Ngày nhận / Demo / Đăng / Thanh toán',
      rule: 'Tùy chọn. Định dạng ngày chuẩn: DD/MM/YYYY.',
      values: 'Ví dụ: 15/09/2026',
    });

    return workbook;
  }

  // ─────────────────────────────────────────────────────────────────
  // PARSE & VALIDATE IMPORT FILE
  // ─────────────────────────────────────────────────────────────────
  async parseAndValidateImport(buffer: Buffer): Promise<{
    validRows: ParsedJobRow[];
    errors: RowValidationError[];
  }> {
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(buffer as any);
    } catch (e: any) {
      throw new BadRequestException('File không đúng định dạng Excel .xlsx hợp lệ');
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new BadRequestException('File Excel không có sheet nào');
    }

    const validRows: ParsedJobRow[] = [];
    const errors: RowValidationError[] = [];

    // Row 1 is header, data starts from row 2
    const totalRows = worksheet.rowCount;
    if (totalRows < 2) {
      throw new BadRequestException('File Excel không chứa dòng dữ liệu nào');
    }

    for (let rowNumber = 2; rowNumber <= totalRows; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      
      // Check if whole row is empty
      let hasValue = false;
      row.eachCell(() => {
        hasValue = true;
      });
      if (!hasValue) continue;

      const rawName = getCellValueAsString(row.getCell(1).value);
      const rawBrandName = getCellValueAsString(row.getCell(2).value);
      const rawJobType = getCellValueAsString(row.getCell(3).value);
      const rawStatus = getCellValueAsString(row.getCell(4).value);
      const rawQuantity = row.getCell(5).value;
      const rawRequirement = getCellValueAsString(row.getCell(6).value);
      const rawBrief = getCellValueAsString(row.getCell(7).value);
      const rawReceivedDate = row.getCell(8).value;
      const rawDemoDate = row.getCell(9).value;
      const rawPostDate = row.getCell(10).value;
      const rawPaymentExpectedDate = row.getCell(11).value;

      // 1. Validate Job Name
      if (!rawName) {
        errors.push({
          row: rowNumber,
          column: 'Tên công việc',
          message: 'Tên công việc không được để trống',
        });
      }

      // 2. Validate Brand Name
      if (!rawBrandName) {
        errors.push({
          row: rowNumber,
          column: 'Nhãn hàng',
          message: 'Tên nhãn hàng không được để trống',
        });
      }

      // 3. Validate Job Type
      let jobType: JobType = JobType.OTHER;
      if (rawJobType) {
        const normalized = rawJobType.toLowerCase().trim();
        if (REVERSE_JOB_TYPE_MAP[normalized]) {
          jobType = REVERSE_JOB_TYPE_MAP[normalized];
        } else {
          errors.push({
            row: rowNumber,
            column: 'Loại công việc',
            message: `Loại công việc "${rawJobType}" không hợp lệ. Giá trị hỗ trợ: ${Object.values(JOB_TYPE_MAP).join(', ')}`,
          });
        }
      }

      // 4. Validate Status
      let status: JobStatus = JobStatus.NEW;
      if (rawStatus) {
        const normalized = rawStatus.toLowerCase().trim();
        if (REVERSE_JOB_STATUS_MAP[normalized]) {
          status = REVERSE_JOB_STATUS_MAP[normalized];
        } else {
          errors.push({
            row: rowNumber,
            column: 'Trạng thái',
            message: `Trạng thái "${rawStatus}" không hợp lệ. Giá trị hỗ trợ: ${Object.values(JOB_STATUS_MAP).join(', ')}`,
          });
        }
      }

      // 5. Validate Quantity
      let quantity: number | undefined = undefined;
      if (rawQuantity !== undefined && rawQuantity !== null && rawQuantity !== '') {
        const num = Number(rawQuantity);
        if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
          errors.push({
            row: rowNumber,
            column: 'Số lượng',
            message: 'Số lượng phải là số nguyên không âm',
          });
        } else {
          quantity = num;
        }
      }

      // 6. Validate Dates
      const receivedRes = parseDateCell(rawReceivedDate);
      if (receivedRes.error) {
        errors.push({ row: rowNumber, column: 'Ngày nhận SP', message: receivedRes.error });
      }

      const demoRes = parseDateCell(rawDemoDate);
      if (demoRes.error) {
        errors.push({ row: rowNumber, column: 'Ngày demo', message: demoRes.error });
      }

      const postRes = parseDateCell(rawPostDate);
      if (postRes.error) {
        errors.push({ row: rowNumber, column: 'Ngày đăng', message: postRes.error });
      }

      const paymentRes = parseDateCell(rawPaymentExpectedDate);
      if (paymentRes.error) {
        errors.push({ row: rowNumber, column: 'Hạn thanh toán', message: paymentRes.error });
      }

      validRows.push({
        rowNumber,
        name: rawName,
        brandName: rawBrandName,
        jobType,
        status,
        quantity,
        requirement: rawRequirement || undefined,
        brief: rawBrief || undefined,
        receivedDate: receivedRes.date,
        demoDate: demoRes.date,
        postDate: postRes.date,
        paymentExpectedDate: paymentRes.date,
      });
    }

    if (validRows.length === 0 && errors.length === 0) {
      throw new BadRequestException('Không tìm thấy dòng dữ liệu nào trong file Excel');
    }

    return { validRows, errors };
  }
}
