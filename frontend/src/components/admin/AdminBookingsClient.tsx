"use client";

import { customerDisplayName } from "@/components/admin/admin-customer-display";
import { CustomerQueuePanel } from "@/components/admin/CustomerQueuePanel";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdmin } from "@/components/admin/AdminProvider";
import {
  fetchAdminBookings,
  updateAdminBookingStatusWithSchedule,
  type AdminBookingRecord,
} from "@/lib/admin/api";
import { fetchAdminChatMessages } from "@/lib/admin/chat-api";
import {
  ADMIN_BOOKING_STATUS_LABELS,
  bookingManageDate,
  type LinkedBookingSummary,
} from "@/lib/admin/labels";
import { TIME_SLOTS, toDateString } from "@/lib/queue/types";
import { LineIcon } from "@/components/spa/line/LineIcon";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const SERVICE_LABELS: Record<string, string> = {
  "queue.svc.foot": "นวดฝ่าเท้า",
  pc1n: "นวดแผนไทย",
  pc2n: "อโรมาออยล์",
  pc3n: "สครับสมุนไพร",
  pc4n: "นวดหินร้อน",
  pc5n: "นวดคุณแม่ตั้งครรภ์",
};

const STATUS_LABELS = ADMIN_BOOKING_STATUS_LABELS;

function serviceLabel(nameKey: string): string {
  return SERVICE_LABELS[nameKey] ?? nameKey;
}

function formatDateLabel(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("th-TH", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatServices(booking: AdminBookingRecord): string {
  return booking.items
    .map((item) => `${serviceLabel(item.service.nameKey)} · ${item.service.durationMin} นาที`)
    .join(", ");
}

export function AdminBookingsClient() {
  const searchParams = useSearchParams();
  const { refreshSession } = useAdmin();
  const lineUserId = searchParams.get("lineUserId")?.trim() ?? "";
  const dateParam = searchParams.get("date")?.trim() ?? "";
  const initialDate = dateParam || toDateString(new Date());
  const [date, setDate] = useState(initialDate);
  const [bookings, setBookings] = useState<AdminBookingRecord[]>([]);
  const [customerBookings, setCustomerBookings] = useState<LinkedBookingSummary[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [scheduleDraft, setScheduleDraft] = useState<Record<string, { date: string; time: string }>>({});

  const customerOverviewMode = Boolean(lineUserId && !dateParam);
  const customerManageMode = Boolean(lineUserId && dateParam);

  useEffect(() => {
    const nextDate = searchParams.get("date")?.trim();
    if (nextDate) {
      setDate(nextDate);
    }
  }, [searchParams]);

  const loadCustomer = useCallback(async () => {
    if (!lineUserId) {
      setCustomerBookings([]);
      setCustomerName("");
      return;
    }

    setCustomerLoading(true);
    try {
      const thread = await fetchAdminChatMessages(lineUserId);
      setCustomerBookings(thread.bookings);
      setCustomerName(customerDisplayName(thread));
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") {
        await refreshSession();
        return;
      }
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setCustomerLoading(false);
    }
  }, [lineUserId, refreshSession]);

  const load = useCallback(async () => {
    if (customerOverviewMode) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const rows = await fetchAdminBookings(date);
      setBookings(rows);
    } catch (err) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") {
        await refreshSession();
        return;
      }
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [customerOverviewMode, date, refreshSession]);

  useEffect(() => {
    void loadCustomer();
  }, [loadCustomer]);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleBookings = useMemo(() => {
    if (!customerManageMode) {
      return bookings;
    }
    return bookings.filter((booking) => booking.lineUserId === lineUserId);
  }, [bookings, customerManageMode, lineUserId]);

  async function runAction(id: string, action: () => Promise<void>) {
    setBusyId(id);
    setError(null);
    try {
      await action();
      await load();
      if (lineUserId) {
        await loadCustomer();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  function getScheduleDraft(booking: AdminBookingRecord) {
    return (
      scheduleDraft[booking.id] ?? {
        date: booking.bookingDate.slice(0, 10),
        time: booking.timeSlot,
      }
    );
  }

  return (
    <AdminLayout title="จัดการคิวจอง">
      {customerOverviewMode || customerManageMode ? (
        <div className="admin-bookings__customer-nav">
          {customerManageMode ? (
            <Link
              href={`/admin/bookings?lineUserId=${encodeURIComponent(lineUserId)}`}
              className="admin-customer-panel__link"
            >
              ← คิวทั้งหมดของลูกค้า
            </Link>
          ) : null}
        </div>
      ) : null}

      {customerOverviewMode ? (
        customerLoading ? (
          <p className="admin-muted">กำลังโหลดข้อมูลลูกค้า…</p>
        ) : error ? (
          <p className="admin-error">{error}</p>
        ) : (
          <div className="admin-bookings__customer-overview">
            <div className="admin-card admin-bookings__customer-panel">
              <CustomerQueuePanel
                displayName={customerName}
                lineUserId={lineUserId}
                bookings={customerBookings}
                bookingHref={(booking) =>
                  `/admin/bookings?lineUserId=${encodeURIComponent(lineUserId)}&date=${encodeURIComponent(bookingManageDate(booking))}`
                }
              />
            </div>
          </div>
        )
      ) : (
        <>
          {customerManageMode && customerName ? (
            <div className="admin-bookings__customer-banner admin-card">
              <p className="admin-bookings__customer-banner-title">{customerName}</p>
              <p className="admin-muted">LINE Customer · {lineUserId}</p>
            </div>
          ) : null}

          <div className="admin-toolbar">
            <label className="admin-field admin-field--inline">
              <span>วันที่</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <button type="button" className="admin-btn" onClick={() => void load()} disabled={loading}>
              รีเฟรช
            </button>
            {lineUserId ? (
              <Link
                href={`/admin/chat?lineUserId=${encodeURIComponent(lineUserId)}`}
                className="admin-btn admin-btn--ghost"
              >
                แชท LINE
              </Link>
            ) : null}
          </div>

          {loading ? <p className="admin-muted">กำลังโหลด…</p> : null}
          {error ? <p className="admin-error">{error}</p> : null}

          {!loading && visibleBookings.length === 0 ? (
            <div className="admin-card admin-empty">
              {customerManageMode ? "ไม่มีคิวของลูกค้านี้ในวันนี้" : "ไม่มีการจองในวันนี้"}
            </div>
          ) : null}

          <div className="admin-list">
            {visibleBookings.map((booking) => {
              const draft = getScheduleDraft(booking);
              const isPending = booking.status === "PENDING";
              const isBusy = busyId === booking.id;
              const canManage = isPending;

              const whenLabel = canManage
                ? `${formatDateLabel(draft.date)} · ${draft.time}`
                : `${formatDateLabel(booking.bookingDate)} · ${booking.timeSlot}`;

              return (
                <article key={booking.id} className="admin-booking-card">
                  <header className="admin-booking-card__header">
                    <div className="admin-booking-card__meta">
                      <span
                        className={`admin-booking-card__badge admin-booking-card__badge--${booking.status.toLowerCase()}`}
                      >
                        {STATUS_LABELS[booking.status]}
                      </span>
                      <span className="admin-booking-card__id">Booking #{booking.queueNumber}</span>
                    </div>
                    {booking.lineUserId ? (
                      <Link
                        href={`/admin/chat?lineUserId=${encodeURIComponent(booking.lineUserId)}`}
                        className="admin-booking-card__line-btn mb-2"
                      >
                        <LineIcon />
                        แชท LINE
                      </Link>
                    ) : null}
                  </header>

                  <div className="admin-booking-card__grid">
                    <div className="admin-booking-card__field">
                      <span className="admin-booking-card__label">วันที่และเวลา</span>
                      <span className="admin-booking-card__value">{whenLabel}</span>
                    </div>
                    <div className="admin-booking-card__field">
                      <span className="admin-booking-card__label">บริการ</span>
                      <span className="admin-booking-card__value">{formatServices(booking)}</span>
                    </div>
                    <div className="admin-booking-card__field">
                      <span className="admin-booking-card__label">ลูกค้า</span>
                      <span className="admin-booking-card__value">{booking.guestName}</span>
                      <a className="admin-booking-card__sub" href={`tel:${booking.guestPhone}`}>
                        {booking.guestPhone}
                      </a>
                    </div>
                    <div className="admin-booking-card__field">
                      <span className="admin-booking-card__label">จำนวน / ราคา</span>
                      <span className="admin-booking-card__value">
                        จำนวน {booking.guestCount} ท่าน · {booking.totalPrice.toLocaleString()} ฿
                      </span>
                    </div>
                  </div>

                  {booking.notes ? (
                    <p className="admin-booking-card__notes">หมายเหตุ: {booking.notes}</p>
                  ) : null}

                  {canManage ? (
                    <div className="admin-booking-card__schedule">
                      <span className="admin-booking-card__label">แก้ไขวัน/เวลา</span>
                      <div className="admin-booking-card__schedule-row">
                        <div className="admin-booking-card__schedule-fields">
                          <input
                            type="date"
                            value={draft.date}
                            aria-label="วันที่จอง"
                            onChange={(e) =>
                              setScheduleDraft((prev) => ({
                                ...prev,
                                [booking.id]: { ...draft, date: e.target.value },
                              }))
                            }
                          />
                          <select
                            value={draft.time}
                            aria-label="เวลาจอง"
                            onChange={(e) =>
                              setScheduleDraft((prev) => ({
                                ...prev,
                                [booking.id]: { ...draft, time: e.target.value },
                              }))
                            }
                          >
                            {TIME_SLOTS.map((slot) => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="admin-booking-card__actions">
                          <button
                            type="button"
                            className="admin-booking-card__btn admin-booking-card__btn--ghost"
                            disabled={isBusy}
                            onClick={() =>
                              void runAction(booking.id, () =>
                                updateAdminBookingStatusWithSchedule(
                                  booking,
                                  "CANCELLED",
                                  draft.date,
                                  draft.time,
                                  true,
                                ),
                              )
                            }
                          >
                            ยกเลิก
                          </button>
                          <button
                            type="button"
                            className="admin-booking-card__btn admin-booking-card__btn--primary"
                            disabled={isBusy}
                            onClick={() =>
                              void runAction(booking.id, () =>
                                updateAdminBookingStatusWithSchedule(
                                  booking,
                                  "CONFIRMED",
                                  draft.date,
                                  draft.time,
                                  true,
                                ),
                              )
                            }
                          >
                            ยืนยัน
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : booking.status === "CONFIRMED" ? (
                    <div className="admin-booking-card__note-bar">
                      <p className="admin-booking-card__status-note">ยืนยันแล้ว — ไม่ต้องดำเนินการเพิ่ม</p>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </>
      )}

    </AdminLayout>
  );
}
