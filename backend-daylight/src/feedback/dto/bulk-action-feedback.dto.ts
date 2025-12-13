import { IsArray, IsEnum, ArrayMinSize } from 'class-validator';

export enum FeedbackBulkActionType {
    DELETE = 'delete',
    EXPORT = 'export',
}

export class BulkActionFeedbackDto {
    @IsArray()
    @ArrayMinSize(1)
    feedbackIds: string[];

    @IsEnum(FeedbackBulkActionType)
    action: FeedbackBulkActionType;
}