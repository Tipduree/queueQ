"use client";

import { CustomerAvatar } from "@/components/admin/admin-customer-display";
import {
  ADMIN_BOOKING_STATUS_LABELS,
  formatBookingWhen,
  type LinkedBookingSummary,
} from "@/lib/admin/labels";
import Link from "next/link";

type CustomerQueuePanelProps = {
  displayName: string;
  lineUserId: string;
  bookings: LinkedBookingSummary[];
  bookingHref?: (booking: LinkedBookingSummary) => string;
};

export function CustomerQueuePanel({
  displayName,
  lineUserId,
  bookings,
  bookingHref,
}: CustomerQueuePanelProps) {
  return (
    <div className="admin-customer-panel">
      <div className="admin-customer-panel__profile">
        <CustomerAvatar name={displayName} seed={lineUserId} size="xl" />
        <div className="admin-customer-panel__profile-copy">
          <h2 className="admin-customer-panel__name">{displayName}</h2>
          <p className="admin-customer-panel__sub">LINE Customer</p>
          <p className="admin-customer-panel__id">{lineUserId}</p>
        </div>
      </div>

      <div className="admin-customer-panel__section">
        <div className="admin-customer-panel__section-head">
          <h3>คิวล่าสุด</h3>
          <Link
            href={`/admin/chat?lineUserId=${encodeURIComponent(lineUserId)}`}
            className="admin-customer-panel__link"
          >
            กลับแชท
          </Link>
        </div>

        {bookings.length === 0 ? (
          <p className="admin-muted admin-customer-panel__empty">ยังไม่มีการจอง</p>
        ) : (
          <ul className="admin-customer-panel__booking-list">
            {bookings.map((booking) => {
              const content = (
                <>
                  <div className="admin-customer-panel__booking-thumb" aria-hidden="true">
                    {booking.queueNumber.slice(-2)}
                  </div>
                  <div className="admin-customer-panel__booking-copy">
                    <p className="admin-customer-panel__booking-title">
                      {booking.queueNumber} · {booking.guestName}
                    </p>
                    <p className="admin-customer-panel__booking-meta">
                      {ADMIN_BOOKING_STATUS_LABELS[booking.status]} · {formatBookingWhen(booking)}
                    </p>
                  </div>
                  <span className="admin-customer-panel__booking-price">
                    {booking.totalPrice.toLocaleString()} ฿
                  </span>
                </>
              );

              const href = bookingHref?.(booking);
              if (href) {
                return (
                  <li key={booking.id}>
                    <Link href={href} className="admin-customer-panel__booking-item">
                      {content}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={booking.id} className="admin-customer-panel__booking-item">
                  {content}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
