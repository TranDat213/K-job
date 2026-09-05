import { PartialType } from '@nestjs/mapped-types';
import { CreateTemplateTaskDto } from './create-template-task.dto';

export class UpdateTemplateTaskDto extends PartialType(CreateTemplateTaskDto) {}
