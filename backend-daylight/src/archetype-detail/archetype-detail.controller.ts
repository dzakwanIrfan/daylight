import { Controller, Get, Put, Body, Param, Query, UseGuards, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ArchetypeDetailService } from './archetype-detail.service';
import { QueryArchetypeDetailDto } from './dto/query-archetype-detail.dto';
import { UpdateArchetypeDetailDto } from './dto/update-archetype-detail.dto';

@Controller('archetype-detail')
export class ArchetypeDetailController {

    constructor(
        private readonly archetypeDetailService: ArchetypeDetailService,
    ) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get()
    async getArchetypeDetailAll(@Query() queryDto: QueryArchetypeDetailDto) {
        return this.archetypeDetailService.getArchetypeDetailAll(queryDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get(':id')
    async getArchetypeDetailById(@Param('id') id: string) {
        return this.archetypeDetailService.getArchetypeDetailById(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Put(':id')
    async updateArchetypeDetail(@Param('id') id: string, @Body() updateDto: UpdateArchetypeDetailDto) {
        return this.archetypeDetailService.updateArchetypeDetail(id, updateDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post('seed')
    async seedArchetypeDetails() {
        return this.archetypeDetailService.seedArchetypeDetails();
    }
}