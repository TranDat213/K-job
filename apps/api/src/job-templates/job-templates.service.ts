import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JobTemplatesRepository } from './job-templates.repository';
import { CreateJobTemplateDto } from './dto/create-job-template.dto';
import { UpdateJobTemplateDto } from './dto/update-job-template.dto';
import { CreateTemplateTaskDto } from './dto/create-template-task.dto';
import { UpdateTemplateTaskDto } from './dto/update-template-task.dto';
import { JobTemplateScope } from '@prisma/client';

@Injectable()
export class JobTemplatesService {
  constructor(private readonly jobTemplatesRepository: JobTemplatesRepository) {}

  // ─────────────────────────────────────────────────────────────────
  // Permission helpers
  // ─────────────────────────────────────────────────────────────────
  private async assertCanView(userId: string, templateId: string) {
    const template = await this.jobTemplatesRepository.findById(templateId);
    if (!template) throw new NotFoundException('Template not found');

    const canView =
      template.scope === JobTemplateScope.SYSTEM ||
      template.ownerId === userId;

    if (!canView) throw new ForbiddenException('Access denied');
    return template;
  }

  private async assertTemplateOwner(userId: string, templateId: string) {
    const template = await this.jobTemplatesRepository.findById(templateId);
    if (!template) throw new NotFoundException('Template not found');

    if (template.scope === JobTemplateScope.SYSTEM) {
      throw new ForbiddenException('System templates cannot be modified or deleted by users');
    }

    if (template.ownerId !== userId) {
      throw new ForbiddenException('Access denied: You do not own this template');
    }

    return template;
  }

  private async assertTaskOwner(userId: string, taskId: string) {
    const task = await this.jobTemplatesRepository.findTaskById(taskId);
    if (!task) throw new NotFoundException('Template task not found');

    if (task.template.scope === JobTemplateScope.SYSTEM) {
      throw new ForbiddenException('System template tasks cannot be modified or deleted by users');
    }

    if (task.template.ownerId !== userId) {
      throw new ForbiddenException('Access denied: You do not own this template');
    }

    return task;
  }

  // ─────────────────────────────────────────────────────────────────
  // USER APIS
  // ─────────────────────────────────────────────────────────────────
  async findAll(userId: string) {
    return this.jobTemplatesRepository.findAllByUser(userId);
  }

  async findOne(userId: string, id: string) {
    return this.assertCanView(userId, id);
  }

  async create(userId: string, dto: CreateJobTemplateDto) {
    return this.jobTemplatesRepository.create({
      name: dto.name,
      description: dto.description,
      jobType: dto.jobType,
      scope: JobTemplateScope.USER,
      owner: { connect: { id: userId } },
      isActive: true,
    });
  }

  async update(userId: string, id: string, dto: UpdateJobTemplateDto) {
    await this.assertTemplateOwner(userId, id);
    return this.jobTemplatesRepository.update(id, dto);
  }

  async remove(userId: string, id: string) {
    await this.assertTemplateOwner(userId, id);
    await this.jobTemplatesRepository.softDelete(id);
    return { message: 'Template deleted' };
  }

  async copy(userId: string, templateId: string) {
    const template = await this.assertCanView(userId, templateId);
    return this.jobTemplatesRepository.copyTemplate(template, userId);
  }

  // ─── Template Tasks (User's custom template) ─────────────────────
  async createTask(userId: string, templateId: string, dto: CreateTemplateTaskDto) {
    await this.assertTemplateOwner(userId, templateId);
    return this.jobTemplatesRepository.createTask({
      template: { connect: { id: templateId } },
      title: dto.title,
      description: dto.description,
      order: dto.order,
      daysBeforePost: dto.daysBeforePost ?? 0,
      isRequired: dto.isRequired ?? true,
    });
  }

  async updateTask(userId: string, taskId: string, dto: UpdateTemplateTaskDto) {
    await this.assertTaskOwner(userId, taskId);
    return this.jobTemplatesRepository.updateTask(taskId, dto);
  }

  async removeTask(userId: string, taskId: string) {
    await this.assertTaskOwner(userId, taskId);
    await this.jobTemplatesRepository.softDeleteTask(taskId);
    return { message: 'Template task deleted' };
  }

  // ─────────────────────────────────────────────────────────────────
  // ADMIN APIS (System Templates)
  // ─────────────────────────────────────────────────────────────────
  async adminFindAll() {
    return this.jobTemplatesRepository.findAllSystemTemplates();
  }

  async adminFindOne(id: string) {
    const template = await this.jobTemplatesRepository.findById(id);
    if (!template || template.scope !== JobTemplateScope.SYSTEM) {
      throw new NotFoundException('System template not found');
    }
    return template;
  }

  async adminCreate(dto: CreateJobTemplateDto) {
    return this.jobTemplatesRepository.create({
      name: dto.name,
      description: dto.description,
      jobType: dto.jobType,
      scope: JobTemplateScope.SYSTEM,
      isActive: true,
    });
  }

  async adminUpdate(id: string, dto: UpdateJobTemplateDto & { isActive?: boolean }) {
    await this.adminFindOne(id);
    return this.jobTemplatesRepository.update(id, dto);
  }

  async adminRemove(id: string) {
    await this.adminFindOne(id);
    await this.jobTemplatesRepository.softDelete(id);
    return { message: 'System template deleted' };
  }

  async adminCreateTask(templateId: string, dto: CreateTemplateTaskDto) {
    await this.adminFindOne(templateId);
    return this.jobTemplatesRepository.createTask({
      template: { connect: { id: templateId } },
      title: dto.title,
      description: dto.description,
      order: dto.order,
      daysBeforePost: dto.daysBeforePost ?? 0,
      isRequired: dto.isRequired ?? true,
    });
  }

  async adminUpdateTask(taskId: string, dto: UpdateTemplateTaskDto) {
    const task = await this.jobTemplatesRepository.findTaskById(taskId);
    if (!task || task.template.scope !== JobTemplateScope.SYSTEM) {
      throw new NotFoundException('System template task not found');
    }
    return this.jobTemplatesRepository.updateTask(taskId, dto);
  }

  async adminRemoveTask(taskId: string) {
    const task = await this.jobTemplatesRepository.findTaskById(taskId);
    if (!task || task.template.scope !== JobTemplateScope.SYSTEM) {
      throw new NotFoundException('System template task not found');
    }
    await this.jobTemplatesRepository.softDeleteTask(taskId);
    return { message: 'System template task deleted' };
  }
}
