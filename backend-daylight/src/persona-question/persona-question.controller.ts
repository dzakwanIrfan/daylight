import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PersonaQuestionService } from './persona-question.service';
import { QueryPersonaQuestionDto } from './dto/query-persona-question.dto';

@Controller('persona-question')
export class PersonaQuestionController {

    constructor(
        private readonly personaQuestionService: PersonaQuestionService,
    ) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get()
    async getPersonaQuestionAll(@Query() queryDto: QueryPersonaQuestionDto) {
        return this.personaQuestionService.getPersonaQuestionAll(queryDto);
    }
}
