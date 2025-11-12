import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { PersonalityService } from './personality.service';
import { SubmitPersonalityTestDto } from './dto/submit-personality-test.dto';
import { GetResultDto } from './dto/get-result.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('personality')
export class PersonalityController {
  constructor(private personalityService: PersonalityService) {}

  @Public()
  @Get('questions')
  async getQuestions() {
    return this.personalityService.getQuestions();
  }

  @Public()
  @Post('submit')
  async submitTest(@Body() submitDto: SubmitPersonalityTestDto) {
    const result = await this.personalityService.saveAnonymousResult(
      submitDto.sessionId,
      submitDto.answers,
      {
        relationshipStatus: submitDto.relationshipStatus,
        intentOnDaylight: submitDto.intentOnDaylight,
        genderMixComfort: submitDto.genderMixComfort,
      },
    );

    return this.personalityService.getResultBySession(submitDto.sessionId);
  }

  @Public()
  @Get('result')
  async getResult(@Query('sessionId') sessionId: string) {
    return this.personalityService.getResultBySession(sessionId);
  }
}