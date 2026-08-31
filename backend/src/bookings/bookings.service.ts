import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { BookingStatus } from '@prisma/client';
import { LinePushService } from '../line/line-push.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingScheduleDto } from './dto/update-booking-schedule.dto';

const STATUS_SORT_ORDER: Record<BookingStatus, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  COMPLETED: 2,
  CANCELLED: 3,
};

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly linePush: LinePushService,
  ) {}

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
        ...(dto.lineUserId?.trim()
          ? { lineUserId: dto.lineUserId.trim() }
          : {}),
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

  findByLineUserId(lineUserId: string) {
    return this.prisma.booking.findMany({
      where: {
        lineUserId,
        status: { not: 'CANCELLED' },
      },
      orderBy: [{ bookingDate: 'desc' }, { timeSlot: 'desc' }],
      include: {
        items: {
          include: { service: true },
        },
      },
    });
  }

  async findForAdmin(date: string) {
    const bookingDate = new Date(`${date}T00:00:00.000Z`);
    const bookings = await this.prisma.booking.findMany({
      where: { bookingDate },
      include: {
        items: {
          include: { service: true },
        },
      },
    });

    return bookings.sort((a, b) => {
      const statusDiff = STATUS_SORT_ORDER[a.status] - STATUS_SORT_ORDER[b.status];
      if (statusDiff !== 0) return statusDiff;
      return a.timeSlot.localeCompare(b.timeSlot);
    });
  }

  async updateStatus(id: string, status: BookingStatus, notify = true) {
    const existing = await this.prisma.booking.findUnique({
      where: { id },
      include: { items: { include: { service: true } } },
    });
    if (!existing) {
      throw new NotFoundException('Booking not found');
    }

    const booking = await this.prisma.booking.update({
      where: { id },
      data: { status },
      include: { items: { include: { service: true } } },
    });

    if (notify && existing.lineUserId) {
      await this.notifyStatusChange(existing, status);
    }

    return booking;
  }

  async updateSchedule(id: string, dto: UpdateBookingScheduleDto) {
    const existing = await this.prisma.booking.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Booking not found');
    }

    if (isSlotInPast(dto.bookingDate, dto.timeSlot)) {
      throw new BadRequestException('Cannot move booking to a past time slot');
    }

    const bookingDate = new Date(`${dto.bookingDate}T00:00:00.000Z`);
    const booking = await this.prisma.booking.update({
      where: { id },
      data: {
        bookingDate,
        timeSlot: dto.timeSlot,
      },
      include: { items: { include: { service: true } } },
    });

    if (dto.notify !== false && existing.lineUserId) {
      const dateLabel = dto.bookingDate;
      await this.linePush.pushText({
        lineUserId: existing.lineUserId,
        text:
          `เลื่อนการจอง ${existing.queueNumber} แล้วค่ะ\n\n` +
          `วันที่ใหม่: ${dateLabel}\n` +
          `เวลาใหม่: ${dto.timeSlot}\n\n` +
          `หากมีข้อสงสัย ติดต่อร้านได้เลยค่ะ`,
      });
    }

    return booking;
  }

  private async notifyStatusChange(
    booking: {
      queueNumber: string;
      guestName: string;
      bookingDate: Date;
      timeSlot: string;
      totalPrice: number;
      lineUserId: string | null;
    },
    status: BookingStatus,
  ) {
    if (!booking.lineUserId) return;

    const dateLabel = booking.bookingDate.toISOString().slice(0, 10);
    const price = booking.totalPrice.toLocaleString('th-TH');
    let text: string | null = null;

    if (status === 'CONFIRMED') {
      text =
        `ยืนยันการจองแล้วค่ะ ${booking.guestName} ✅\n\n` +
        `เลขคิว: ${booking.queueNumber}\n` +
        `วันที่: ${dateLabel}\n` +
        `เวลา: ${booking.timeSlot}\n` +
        `ยอดรวม: ${price} บาท\n\n` +
        `กรุณามาถึงก่อนเวลานัด 10 นาทีค่ะ`;
    } else if (status === 'CANCELLED') {
      text =
        `การจอง ${booking.queueNumber} ถูกยกเลิกแล้วค่ะ\n\n` +
        `วันที่: ${dateLabel}\n` +
        `เวลา: ${booking.timeSlot}\n\n` +
        `หากต้องการจองใหม่ สามารถจองผ่าน LINE ได้เลยค่ะ`;
    } else if (status === 'COMPLETED') {
      text =
        `ขอบคุณที่ใช้บริการค่ะ ${booking.guestName} 🙏\n\n` +
        `เลขคิว: ${booking.queueNumber}\n` +
        `หวังว่าจะได้ดูแลอีกครั้งนะคะ`;
    }

    if (text) {
      await this.linePush.pushText({ lineUserId: booking.lineUserId, text });
    }
  }
}
