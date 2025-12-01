import { Module } from '@nestjs/common';
import { CountryController } from './country.controller';
import { CityController } from './city.controller';
import { CountryService } from './country.service';
import { CityService } from './city.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CountryController, CityController],
  providers: [CountryService, CityService],
  exports: [CountryService, CityService],
})
export class LocationModule {}