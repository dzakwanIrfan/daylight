import { Module } from '@nestjs/common';
import { ArchetypeDetailController } from './archetype-detail.controller';
import { ArchetypeDetailService } from './archetype-detail.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ArchetypeDetailController],
  providers: [ArchetypeDetailService],
  exports: [ArchetypeDetailService],
})
export class ArchetypeDetailModule {}