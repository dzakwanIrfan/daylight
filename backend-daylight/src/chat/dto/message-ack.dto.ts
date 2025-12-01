export class MessageAckDto {
  success: boolean;
  message?: any;
  error?: string;
  timestamp: Date;
}