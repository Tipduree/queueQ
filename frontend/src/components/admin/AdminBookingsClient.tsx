"use client";

import {
  adminLogin,
  adminLogout,
  fetchAdminBookings,
  updateAdminBookingSchedule,
  updateAdminBookingStatusWithSchedule,
  type AdminBookingRecord,
} from "@/lib/admin/api";
import { TIME_SLOTS, toDateString } from "@/lib/queue/types";
import { useCallback, useEffect, useState } from "react";

const SERVICE_LABELS: Record<string, string> = {
  "queue.svc.foot": "นวดฝ่าเท้า",
  pc1n: "นวดแผนไทย",
  pc2n: "อโรมาออยล์",
  pc3n: "สครับสมุนไพร",
  pc4n: "นวดหินร้อน",
  pc5n: "นวดคุณแม่ตั้งครรภ์",
};

const STATUS_LABELS: Record<AdminBookingRecord["status"], string> = {
  PENDING: "รอยืนยัน",
  CONFIRMED: "ยืนยันแล้ว",
  COMPLETED: "เสร็จสิ้น",
  CANCELLED: "ยกเลิก",
};

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

export function AdminBookingsClient() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [date, setDate] = useState(toDateString(new Date()));
  const [bookings, setBookings] = useState<AdminBookingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [scheduleDraft, setScheduleDraft] = useState<Record<string, { date: string; time: string }>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchAdminBookings(date);
      setBookings(rows);
      setAuthed(true);
    } catch (err) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") {
        setAuthed(false);
        return;
      }
      setError(err instanceof Error ? err.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoginError(null);
    try {
      await adminLogin(password);
      setPassword("");
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      if (message.includes("not configured")) {
        setLoginError("ยังไม่ได้ตั้ง ADMIN_PASSWORD บน server — ดู .env.local หรือ Vercel env");
      } else if (message === "Invalid password") {
        setLoginError("รหัสผ่านไม่ถูกต้อง");
      } else {
        setLoginError(message);
      }
    }
  }

  async function handleLogout() {
    await adminLogout();
    setAuthed(false);
    setBookings([]);
  }

  async function runAction(
    id: string,
    action: () => Promise<void>,
  ) {
    setBusyId(id);
    setError(null);
    try {
      await action();
      await load();
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

  if (authed === false) {
    return (
      <main className="admin-page">
        <div className="admin-card admin-login">
          <h1>Admin — Bookings</h1>
          <p className="admin-muted">Suan Bai Spa staff login</p>
          <form onSubmit={(e) => void handleLogin(e)}>
            <label className="admin-field">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            {loginError ? <p className="admin-error">{loginError}</p> : null}
            <button type="submit" className="admin-btn admin-btn--primary">
              เข้าสู่ระบบ
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">Staff dashboard</p>
            <h1>จัดการคิวจอง</h1>
          </div>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => void handleLogout()}>
            ออกจากระบบ
          </button>
        </header>

        <div className="admin-toolbar">
          <label className="admin-field admin-field--inline">
            <span>วันที่</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <button type="button" className="admin-btn" onClick={() => void load()} disabled={loading}>
            รีเฟรช
          </button>
        </div>

        {loading ? <p className="admin-muted">กำลังโหลด…</p> : null}
        {error ? <p className="admin-error">{error}</p> : null}

        {!loading && bookings.length === 0 ? (
          <div className="admin-card admin-empty">ไม่มีการจองในวันนี้</div>
        ) : null}

        <div className="admin-list">
          {bookings.map((booking) => {
            const draft = getScheduleDraft(booking);
            const isPending = booking.status === "PENDING";
            const isBusy = busyId === booking.id;
            const canManage = isPending;

            return (
              <article
                key={booking.id}
                className={`admin-card admin-booking${isPending ? " admin-booking--pending" : ""}`}
              >
                <div className="admin-booking__top">
                  <div>
                    <span className="admin-booking__queue">{booking.queueNumber}</span>
                    <span className={`admin-badge admin-badge--${booking.status.toLowerCase()}`}>
                      {STATUS_LABELS[booking.status]}
                    </span>
                  </div>
                  <p className="admin-booking__when">
                    {formatDateLabel(booking.bookingDate)} · {booking.timeSlot}
                  </p>
                </div>

                {isPending ? (
                  <div className="admin-contact">
                    <p className="admin-contact__title">ข้อมูลติดต่อลูกค้า (โทรกลับ / เลื่อนเวลา)</p>
                    <p>
                      <strong>{booking.guestName}</strong>
                    </p>
                    <p>
                      <a href={`tel:${booking.guestPhone}`}>{booking.guestPhone}</a>
                    </p>
                    <p>
                      จำนวน {booking.guestCount} ท่าน · {booking.totalPrice.toLocaleString()} ฿
                    </p>
                    {booking.notes ? <p className="admin-muted">หมายเหตุ: {booking.notes}</p> : null}
                  </div>
                ) : (
                  <p>
                    {booking.guestName} · {booking.guestPhone} · {booking.guestCount} ท่าน
                  </p>
                )}

                <ul className="admin-services">
                  {booking.items.map((item) => (
                    <li key={`${booking.id}-${item.service.slug}`}>
                      {serviceLabel(item.service.nameKey)} · {item.service.durationMin} นาที
                    </li>
                  ))}
                </ul>

                {booking.status === "CONFIRMED" ? (
                  <p className="admin-muted">ยืนยันแล้ว — ไม่ต้องดำเนินการเพิ่ม</p>
                ) : null}

                {canManage ? (
                  <div className="admin-schedule">
                    <p className="admin-schedule__label">แก้ไขวัน/เวลา</p>
                    <div className="admin-schedule__fields">
                      <input
                        type="date"
                        value={draft.date}
                        onChange={(e) =>
                          setScheduleDraft((prev) => ({
                            ...prev,
                            [booking.id]: { ...draft, date: e.target.value },
                          }))
                        }
                      />
                      <select
                        value={draft.time}
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
                      <button
                        type="button"
                        className="admin-btn"
                        disabled={isBusy}
                        onClick={() =>
                          void runAction(booking.id, () =>
                            updateAdminBookingSchedule(
                              booking.id,
                              draft.date,
                              draft.time,
                              true,
                            ),
                          )
                        }
                      >
                        บันทึกเวลา
                      </button>
                    </div>
                  </div>
                ) : null}

                {canManage ? (
                <div className="admin-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn--primary"
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
                  <button
                    type="button"
                    className="admin-btn admin-btn--danger"
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
                </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
