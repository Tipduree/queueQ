import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

function generateQueueNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const letter = chars[Math.floor(Math.random() * chars.length)];
  const num = String(Math.floor(Math.random() * 900) + 100);
  return `${letter}${num}`;
}

function localDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isSlotInPast(bookingDate: string, timeSlot: string, now = new Date()) {
  if (bookingDate !== localDateString(now)) {
    return false;
  }

  const [hours, minutes] = timeSlot.split(':').map(Number);
  const slotAt = new Date(now);
  slotAt.setHours(hours, minutes, 0, 0);
  return slotAt.getTime() <= now.getTime();
}

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAvailability(date: string) {
    const bookingDate = new Date(`${date}T00:00:00.000Z`);

    const bookings = await this.prisma.booking.findMany({
      where: {
        bookingDate,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      select: { timeSlot: true },
    });

    return {
      date,
      bookedSlots: bookings.map((b) => b.timeSlot),
    };
  }

  async create(dto: CreateBookingDto) {
    const bookingDate = new Date(`${dto.bookingDate}T00:00:00.000Z`);

    const services = await this.prisma.service.findMany({
      where: {
        slug: { in: dto.serviceSlugs },
        active: true,
      },
    });

    if (services.length !== dto.serviceSlugs.length) {
      throw new NotFoundException('One or more services were not found');
    }

    if (isSlotInPast(dto.bookingDate, dto.timeSlot)) {
      throw new BadRequestException('Cannot book a time slot in the past');
    }

    const conflict = await this.prisma.booking.findFirst({
      where: {
        bookingDate,
        timeSlot: dto.timeSlot,
        guestPhone: dto.guestPhone,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (conflict) {
      throw new ConflictException(
        'You already have a booking at this date and time',
      );
    }

    const totalPrice = services.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = services.reduce((sum, s) => sum + s.durationMin, 0);

    let queueNumber = generateQueueNumber();
    let attempts = 0;

    while (attempts < 5) {
      const exists = await this.prisma.booking.findUnique({
        where: { queueNumber },
      });
      if (!exists) break;
      queueNumber = generateQueueNumber();
      attempts++;
    }

    if (attempts === 5) {
      throw new BadRequestException('Could not generate a queue number');
    }

    return this.prisma.booking.create({
      data: {
        queueNumber,
        guestName: dto.guestName.trim(),
        guestPhone: dto.guestPhone.trim(),
        guestCount: dto.guestCount,
        lineUserId: dto.lineUserId?.trim() || null,
        notes: dto.notes?.trim() || null,
        bookingDate,
        timeSlot: dto.timeSlot,
        totalPrice,
        totalDuration,
        items: {
          create: services.map((service) => ({
            serviceId: service.id,
            price: service.price,
          })),
        },
      },
      include: {
        items: {
          include: { service: true },
        },
      },
    });
  }

  findByQueueNumber(queueNumber: string) {
    return this.prisma.booking.findUnique({
      where: { queueNumber },
      include: {
        items: {
          include: { service: true },
        },
      },
    });
  }
}
