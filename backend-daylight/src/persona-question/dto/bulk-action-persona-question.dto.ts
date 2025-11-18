import { IsArray, IsEnum, ArrayMinSize } from 'class-validator';

export enum PersonaQuestionBulkActionType {
  ACTIVATE = 'activate',
  DEACTIVATE = 'deactivate',
  DELETE = 'delete',
}

export class BulkActionPersonaQuestionDto {
  @IsArray()
  @ArrayMinSize(1)
  questionIds: string[];

  @IsEnum(PersonaQuestionBulkActionType)
  action: PersonaQuestionBulkActionType;
}