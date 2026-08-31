import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminApiKeyGuard } from '../auth/admin-api-key.guard';
import { BookingsService } from './bookings.service';
import { UpdateBookingScheduleDto } from './dto/update-booking-schedule.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@Controller('admin/bookings')
@UseGuards(AdminApiKeyGuard)
export class AdminBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  list(@Query('date') date?: string) {
    const targetDate = date?.trim() || localDateString();
    return this.bookingsService.findForAdmin(targetDate);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateBookingStatusDto) {
    return this.bookingsService.updateStatus(id, dto.status, dto.notify ?? true);
  }

  @Patch(':id/schedule')
  updateSchedule(@Param('id') id: string, @Body() dto: UpdateBookingScheduleDto) {
    return this.bookingsService.updateSchedule(id, dto);
  }
}

function localDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
