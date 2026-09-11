import type { Booking, BookingStatus } from '@prisma/client';

export type LinkedBookingSummary = {
  id: string;
  queueNumber: string;
  guestName: string;
  guestPhone: string;
  guestCount: number;
  bookingDate: string;
  timeSlot: string;
  status: BookingStatus;
  totalPrice: number;
};

export function toLinkedBookingSummary(booking: Booking): LinkedBookingSummary {
  return {
    id: booking.id,
    queueNumber: booking.queueNumber,
    guestName: booking.guestName,
    guestPhone: booking.guestPhone,
    guestCount: booking.guestCount,
    bookingDate: booking.bookingDate.toISOString(),
    timeSlot: booking.timeSlot,
    status: booking.status,
    totalPrice: booking.totalPrice,
  };
}

/** Most recent booking (list must be ordered bookingDate desc, timeSlot desc). */
export function pickPrimaryBooking(
  bookings: LinkedBookingSummary[],
): LinkedBookingSummary | null {
  return bookings[0] ?? null;
}
