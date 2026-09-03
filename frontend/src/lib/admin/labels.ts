export type AdminBookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export const ADMIN_BOOKING_STATUS_LABELS: Record<AdminBookingStatus, string> = {
  PENDING: "รอยืนยัน",
  CONFIRMED: "ยืนยันแล้ว",
  COMPLETED: "เสร็จสิ้น",
  CANCELLED: "ยกเลิก",
};

export type LinkedBookingSummary = {
  id: string;
  queueNumber: string;
  guestName: string;
  guestPhone: string;
  guestCount: number;
  bookingDate: string;
  timeSlot: string;
  status: AdminBookingStatus;
  totalPrice: number;
};

export function formatBookingWhen(booking: Pick<LinkedBookingSummary, "bookingDate" | "timeSlot">) {
  const dateLabel = new Date(booking.bookingDate).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${dateLabel} · ${booking.timeSlot}`;
}

export function bookingManageDate(booking: Pick<LinkedBookingSummary, "bookingDate">) {
  return booking.bookingDate.slice(0, 10);
}
