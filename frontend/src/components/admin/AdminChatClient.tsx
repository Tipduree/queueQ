"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdmin } from "@/components/admin/AdminProvider";
import {
  fetchAdminChatMessages,
  fetchAdminConversations,
  sendAdminChatReply,
  type AdminChatConversation,
  type AdminChatThread,
} from "@/lib/admin/chat-api";
import {
  ADMIN_BOOKING_STATUS_LABELS,
  bookingManageDate,
  formatBookingWhen,
  type LinkedBookingSummary,
} from "@/lib/admin/labels";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function displayName(conversation: Pick<AdminChatConversation, "displayName" | "lineUserId">) {
  return conversation.displayName?.trim() || conversation.lineUserId.slice(0, 8);
}

function BookingContext({
  bookings,
  primaryBooking,
}: {
  bookings: LinkedBookingSummary[];
  primaryBooking: LinkedBookingSummary | null;
}) {
  if (bookings.length === 0) {
    return (
      <div className="admin-chat__booking admin-chat__booking--empty">
        <p className="admin-chat__booking-title">คิวที่เกี่ยวข้อง</p>
        <p className="admin-muted">ยังไม่มีการจองจาก LINE user นี้</p>
      </div>
    );
  }

  return (
    <div className="admin-chat__booking">
      <p className="admin-chat__booking-title">คิวที่เกี่ยวข้อง</p>
      {primaryBooking ? (
        <div className="admin-chat__booking-primary">
          <div className="admin-chat__booking-row">
            <strong>{primaryBooking.queueNumber}</strong>
            <span className={`admin-badge admin-badge--${primaryBooking.status.toLowerCase()}`}>
              {ADMIN_BOOKING_STATUS_LABELS[primaryBooking.status]}
            </span>
          </div>
          <p>
            {primaryBooking.guestName} · {primaryBooking.guestPhone}
          </p>
          <p>{formatBookingWhen(primaryBooking)}</p>
          <p className="admin-muted">
            {primaryBooking.guestCount} ท่าน · {primaryBooking.totalPrice.toLocaleString()} ฿
          </p>
          <Link
            href={`/admin/bookings?date=${encodeURIComponent(bookingManageDate(primaryBooking))}`}
            className="admin-btn admin-chat__booking-link"
          >
            ไปจัดการคิว
          </Link>
        </div>
      ) : null}
      {bookings.filter((booking) => booking.id !== primaryBooking?.id).length > 0 ? (
        <ul className="admin-chat__booking-list">
          {bookings
            .filter((booking) => booking.id !== primaryBooking?.id)
            .map((booking) => (
            <li key={booking.id}>
              <span>{booking.queueNumber}</span>
              <span className="admin-muted">
                {ADMIN_BOOKING_STATUS_LABELS[booking.status]} · {formatBookingWhen(booking)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function AdminChatClient() {
  const searchParams = useSearchParams();
  const { refreshSession } = useAdmin();
  const [conversations, setConversations] = useState<AdminChatConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thread, setThread] = useState<AdminChatThread | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const lineUserId = searchParams.get("lineUserId")?.trim();
    if (lineUserId) {
      setSelectedId(lineUserId);
    }
  }, [searchParams]);

  const loadConversations = useCallback(async () => {
    try {
      const rows = await fetchAdminConversations();
      setConversations(rows);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") {
        await refreshSession();
        return;
      }
      setError(err instanceof Error ? err.message : "Load failed");
    }
  }, [refreshSession]);

  const loadThread = useCallback(async (lineUserId: string) => {
    try {
      const data = await fetchAdminChatMessages(lineUserId);
      setThread(data);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") {
        await refreshSession();
        return;
      }
      setError(err instanceof Error ? err.message : "Load failed");
    }
  }, [refreshSession]);

  useEffect(() => {
    let active = true;
    void (async () => {
      setLoading(true);
      await loadConversations();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedId) {
      setThread(null);
      return;
    }

    void loadThread(selectedId);
    const timer = window.setInterval(() => {
      void loadThread(selectedId);
      void loadConversations();
    }, 5000);

    return () => window.clearInterval(timer);
  }, [selectedId, loadThread, loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length]);

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedId || !reply.trim()) return;

    setSending(true);
    setError(null);
    try {
      await sendAdminChatReply(selectedId, reply);
      setReply("");
      await loadThread(selectedId);
      await loadConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  const selectedConversation = conversations.find((c) => c.lineUserId === selectedId);

  return (
    <AdminLayout title="แชท LINE">
      {loading ? <p className="admin-muted">กำลังโหลด…</p> : null}
      {error ? <p className="admin-error">{error}</p> : null}

      <div className="admin-chat">
        <aside className="admin-chat__list admin-card">
          <p className="admin-chat__list-title">ข้อความจากลูกค้า</p>
          {conversations.length === 0 ? (
            <p className="admin-muted">ยังไม่มีข้อความ — ให้ลูกค้าทัก LINE OA ก่อน</p>
          ) : (
            <ul className="admin-chat__conversations">
              {conversations.map((conversation) => {
                const preview = conversation.messages[0]?.text ?? "";
                const isActive = selectedId === conversation.lineUserId;
                const pending = conversation.primaryBooking?.status === "PENDING";
                return (
                  <li key={conversation.id}>
                    <button
                      type="button"
                      className={`admin-chat__conversation${isActive ? " admin-chat__conversation--active" : ""}`}
                      onClick={() => setSelectedId(conversation.lineUserId)}
                    >
                      <span className="admin-chat__conversation-top">
                        <span className="admin-chat__conversation-name">
                          {displayName(conversation)}
                        </span>
                        {pending && conversation.primaryBooking ? (
                          <span className="admin-badge admin-badge--pending">
                            {conversation.primaryBooking.queueNumber}
                          </span>
                        ) : null}
                      </span>
                      <span className="admin-chat__conversation-preview">{preview}</span>
                      {conversation.primaryBooking ? (
                        <span className="admin-chat__conversation-booking">
                          {ADMIN_BOOKING_STATUS_LABELS[conversation.primaryBooking.status]} ·{" "}
                          {formatBookingWhen(conversation.primaryBooking)}
                        </span>
                      ) : null}
                      <span className="admin-chat__conversation-time">
                        {formatTime(conversation.lastMessageAt)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <section className="admin-chat__panel admin-card">
          {!selectedId || !thread ? (
            <div className="admin-chat__empty">
              <p className="admin-muted">เลือกแชทจากรายการด้านซ้าย</p>
            </div>
          ) : (
            <>
              <header className="admin-chat__header">
                <div>
                  <p className="admin-chat__header-name">
                    {displayName(selectedConversation ?? thread)}
                  </p>
                  <p className="admin-muted admin-chat__header-id">{thread.lineUserId}</p>
                </div>
              </header>

              <BookingContext
                bookings={thread.bookings}
                primaryBooking={thread.primaryBooking}
              />

              <div className="admin-chat__messages">
                {thread.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`admin-chat__bubble admin-chat__bubble--${message.direction.toLowerCase()}`}
                  >
                    <p>{message.text}</p>
                    <time>{formatTime(message.createdAt)}</time>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form className="admin-chat__composer" onSubmit={(e) => void handleSend(e)}>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="พิมพ์ข้อความตอบกลับ..."
                  rows={3}
                  maxLength={2000}
                  required
                />
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={sending || !reply.trim()}
                >
                  {sending ? "กำลังส่ง…" : "ส่งข้อความ"}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
