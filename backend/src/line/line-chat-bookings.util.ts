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

export function pickPrimaryBooking(
  bookings: LinkedBookingSummary[],
): LinkedBookingSummary | null {
  const pending = bookings.find((booking) => booking.status === 'PENDING');
  if (pending) return pending;

  const confirmed = bookings.find((booking) => booking.status === 'CONFIRMED');
  if (confirmed) return confirmed;

  return bookings[0] ?? null;
}
