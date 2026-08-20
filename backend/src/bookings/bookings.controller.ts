import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('availability')
  getAvailability(@Query('date') date: string) {
    return this.bookingsService.getAvailability(date);
  }

  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  @Get(':queueNumber')
  findOne(@Param('queueNumber') queueNumber: string) {
    return this.bookingsService.findByQueueNumber(queueNumber);
  }
}
