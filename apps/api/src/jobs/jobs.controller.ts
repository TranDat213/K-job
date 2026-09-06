import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JobsService, JobsQuery } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JobStatus } from '@prisma/client';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // GET /api/jobs?page=1&limit=20&status=NEW&brandId=...&search=...
  @Get()
  async findAll(
    @CurrentUser() user: { id: string },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: JobStatus,
    @Query('brandId') brandId?: string,
    @Query('search') search?: string,
  ) {
    const query: JobsQuery = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
      status,
      brandId,
      search,
    };
    return this.jobsService.findAll(user.id, query);
  }

  // GET /api/jobs/stats
  @Get('stats')
  async getStats(@CurrentUser() user: { id: string }) {
    const stats = await this.jobsService.getStats(user.id);
    return { data: stats, message: 'Success' };
  }

  // GET /api/jobs/export/excel
  @Get('export/excel')
  async exportExcel(
    @CurrentUser() user: { id: string },
    @Res() res: Response,
    @Query('status') status?: JobStatus,
    @Query('brandId') brandId?: string,
    @Query('search') search?: string,
  ) {
    const workbook = await this.jobsService.exportToExcel(user.id, {
      status,
      brandId,
      search,
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `koc-jobs-${timestamp}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  }

  // GET /api/jobs/template/excel
  @Get('template/excel')
  async getTemplateExcel(@Res() res: Response) {
    const workbook = await this.jobsService.getTemplateExcel();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename="mau-nhap-cong-viec.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  }

  // POST /api/jobs/import/excel
  @Post('import/excel')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async importExcel(
    @CurrentUser() user: { id: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file Excel (.xlsx) để tải lên');
    }

    const result = await this.jobsService.importFromExcel(user.id, file.buffer);
    return {
      data: result,
      message: `Đã nhập thành công ${result.importedCount} công việc vào hệ thống`,
    };
  }

  // GET /api/jobs/:id
  @Get(':id')
  async findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    const job = await this.jobsService.findOne(user.id, id);
    return { data: job, message: 'Success' };
  }

  // POST /api/jobs
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: { id: string }, @Body() dto: CreateJobDto) {
    const job = await this.jobsService.create(user.id, dto);
    return { data: job, message: 'Job created' };
  }

  // PATCH /api/jobs/:id
  @Patch(':id')
  async update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateJobDto,
  ) {
    const job = await this.jobsService.update(user.id, id, dto);
    return { data: job, message: 'Job updated' };
  }

  // DELETE /api/jobs/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.jobsService.remove(user.id, id);
  }

  // POST /api/jobs/:id/notes
  @Post(':id/notes')
  @HttpCode(HttpStatus.CREATED)
  async addNote(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: CreateNoteDto,
  ) {
    const note = await this.jobsService.addNote(user.id, id, dto.content);
    return { data: note, message: 'Note added' };
  }

  // DELETE /api/jobs/:id/notes/:noteId
  @Delete(':id/notes/:noteId')
  @HttpCode(HttpStatus.OK)
  async removeNote(
    @CurrentUser() user: { id: string },
    @Param('noteId') noteId: string,
  ) {
    return this.jobsService.removeNote(user.id, noteId);
  }

  // POST /api/jobs/:id/attachments
  @Post(':id/attachments')
  @HttpCode(HttpStatus.CREATED)
  async addAttachment(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: CreateAttachmentDto,
  ) {
    const att = await this.jobsService.addAttachment(user.id, id, dto);
    return { data: att, message: 'Attachment added' };
  }

  // DELETE /api/jobs/:id/attachments/:attachmentId
  @Delete(':id/attachments/:attachmentId')
  @HttpCode(HttpStatus.OK)
  async removeAttachment(
    @CurrentUser() user: { id: string },
    @Param('attachmentId') attachmentId: string,
  ) {
    return this.jobsService.removeAttachment(user.id, attachmentId);
  }
}

