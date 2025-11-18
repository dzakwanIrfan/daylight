import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { PersonaQuestionService } from './persona-question.service';
import { QueryPersonaQuestionDto } from './dto/query-persona-question.dto';
import { CreatePersonaQuestionDto } from './dto/create-persona-question.dto';
import { UpdatePersonaQuestionDto } from './dto/update-persona-question.dto';
import { BulkActionPersonaQuestionDto } from './dto/bulk-action-persona-question.dto';

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

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get('export')
    async exportPersonaQuestions(@Query() queryDto: QueryPersonaQuestionDto) {
        return this.personaQuestionService.exportPersonaQuestions(queryDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get(':id')
    async getPersonaQuestionById(@Param('id') id: string) {
        return this.personaQuestionService.getPersonaQuestionById(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createPersonaQuestion(@Body() createDto: CreatePersonaQuestionDto) {
        return this.personaQuestionService.createPersonaQuestion(createDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Put(':id')
    async updatePersonaQuestion(@Param('id') id: string, @Body() updateDto: UpdatePersonaQuestionDto) {
        return this.personaQuestionService.updatePersonaQuestion(id, updateDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete(':id')
    async deletePersonaQuestion(@Param('id') id: string) {
        return this.personaQuestionService.deletePersonaQuestion(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post('bulk')
    @HttpCode(HttpStatus.OK)
    async bulkAction(@Body() bulkActionDto: BulkActionPersonaQuestionDto) {
        return this.personaQuestionService.bulkAction(bulkActionDto);
    }
}