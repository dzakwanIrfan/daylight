import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { BulkActionTransactionDto } from './dto/bulk-action-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) { }

  // ADMIN ENDPOINTS

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('dashboard/stats')
  async getDashboardStats() {
    return this.transactionsService.getDashboardStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async getTransactions(@Query() queryDto: QueryTransactionsDto) {
    return this.transactionsService.getTransactions(queryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('export')
  async exportTransactions(@Query() queryDto: QueryTransactionsDto) {
    return this.transactionsService.exportTransactions(queryDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id')
  async getTransactionById(@Param('id') id: string) {
    return this.transactionsService.getTransactionById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  async updateTransaction(
    @Param('id') id: string,
    @Body() updateDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.updateTransaction(id, updateDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async deleteTransaction(
    @Param('id') id: string,
    @Query('hard') hard?: string,
  ) {
    const hardDelete = hard === 'true';
    return this.transactionsService.deleteTransaction(id, hardDelete);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  async bulkAction(@Body() bulkActionDto: BulkActionTransactionDto) {
    return this.transactionsService.bulkAction(bulkActionDto);
  }
}