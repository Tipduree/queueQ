"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAdmin } from "@/components/admin/AdminProvider";
import { useAdminUnread } from "@/components/admin/AdminUnreadContext";
import { useAdminChatEvents } from "@/components/admin/AdminChatEventsProvider";
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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const SELECTED_CHAT_STORAGE_KEY = "admin_chat_selected_line_user_id";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { refreshSession } = useAdmin();
  const { setChatUnreadCount } = useAdminUnread();
  const [conversations, setConversations] = useState<AdminChatConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thread, setThread] = useState<AdminChatThread | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const prevMessageCountRef = useRef(0);
  const selectedIdRef = useRef<string | null>(null);
  const restoredSelectionRef = useRef(false);
  const lastThreadLoadIdRef = useRef<string | null>(null);
  const setChatUnreadCountRef = useRef(setChatUnreadCount);
  const refreshInFlightRef = useRef(false);
  const lineUserIdParam = searchParams.get("lineUserId")?.trim() ?? "";

  useEffect(() => {
    setChatUnreadCountRef.current = setChatUnreadCount;
  }, [setChatUnreadCount]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  const selectConversation = useCallback(
    (lineUserId: string) => {
      if (selectedIdRef.current === lineUserId) {
        return;
      }
      setSelectedId(lineUserId);
      sessionStorage.setItem(SELECTED_CHAT_STORAGE_KEY, lineUserId);
      router.replace(`${pathname}?lineUserId=${encodeURIComponent(lineUserId)}`, { scroll: false });
    },
    [pathname, router],
  );

  useEffect(() => {
    if (lineUserIdParam) {
      restoredSelectionRef.current = true;
      setSelectedId((current) => (current === lineUserIdParam ? current : lineUserIdParam));
      sessionStorage.setItem(SELECTED_CHAT_STORAGE_KEY, lineUserIdParam);
      return;
    }

    if (restoredSelectionRef.current) {
      return;
    }

    const stored = sessionStorage.getItem(SELECTED_CHAT_STORAGE_KEY)?.trim();
    if (!stored) {
      return;
    }

    restoredSelectionRef.current = true;
    setSelectedId(stored);
    router.replace(`${pathname}?lineUserId=${encodeURIComponent(stored)}`, { scroll: false });
  }, [lineUserIdParam, pathname, router]);

  const loadConversations = useCallback(async (options?: { silent?: boolean }) => {
    try {
      const rows = await fetchAdminConversations();
      setConversations(rows);
      const totalUnread = rows.reduce((sum, row) => {
        const isActive = selectedIdRef.current === row.lineUserId;
        return sum + (isActive ? 0 : (row.unreadCount ?? 0));
      }, 0);
      setChatUnreadCountRef.current(totalUnread);
      if (!options?.silent) {
        setError(null);
      }
      return rows;
    } catch (err) {
      if (err instanceof Error && err.message === "UNAUTHORIZED") {
        await refreshSession();
        return null;
      }
      if (!options?.silent) {
        setError(err instanceof Error ? err.message : "Load failed");
      }
      return null;
    }
  }, [refreshSession]);

  const loadThread = useCallback(
    async (lineUserId: string, options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setThreadLoading(true);
      }
      try {
        const data = await fetchAdminChatMessages(lineUserId);
        if (selectedIdRef.current !== lineUserId) {
          return;
        }
        setThread(data);
        if (!options?.silent) {
          setError(null);
        }
      } catch (err) {
        if (err instanceof Error && err.message === "UNAUTHORIZED") {
          await refreshSession();
          return;
        }
        if (!options?.silent) {
          setError(err instanceof Error ? err.message : "Load failed");
        }
      } finally {
        if (!options?.silent && selectedIdRef.current === lineUserId) {
          setThreadLoading(false);
        }
      }
    },
    [refreshSession],
  );

  const loadConversationsRef = useRef(loadConversations);
  const loadThreadRef = useRef(loadThread);

  useEffect(() => {
    loadConversationsRef.current = loadConversations;
  }, [loadConversations]);

  useEffect(() => {
    loadThreadRef.current = loadThread;
  }, [loadThread]);

  const refreshChat = useCallback(async () => {
    if (refreshInFlightRef.current) {
      return;
    }
    refreshInFlightRef.current = true;
    try {
      await loadConversationsRef.current({ silent: true });
      const activeId = selectedIdRef.current;
      if (activeId) {
        await loadThreadRef.current(activeId, { silent: true });
      }
    } finally {
      refreshInFlightRef.current = false;
    }
  }, []);

  useAdminChatEvents(() => {
    void refreshChat();
  });

  useEffect(() => {
    setLoading(true);
    void loadConversations().finally(() => {
      setLoading(false);
    });
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedId) {
      lastThreadLoadIdRef.current = null;
      setThread(null);
      setThreadLoading(false);
      prevMessageCountRef.current = 0;
      return;
    }

    if (lastThreadLoadIdRef.current === selectedId) {
      return;
    }

    lastThreadLoadIdRef.current = selectedId;
    prevMessageCountRef.current = 0;
    void loadThread(selectedId);
  }, [selectedId, loadThread]);

  useEffect(() => {
    const count = thread?.messages.length ?? 0;
    if (count > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessageCountRef.current = count;
  }, [thread?.messages]);

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
                const unreadCount = isActive ? 0 : (conversation.unreadCount ?? 0);
                return (
                  <li key={conversation.id}>
                    <button
                      type="button"
                      className={`admin-chat__conversation${isActive ? " admin-chat__conversation--active" : ""}`}
                      onClick={() => selectConversation(conversation.lineUserId)}
                    >
                      <span className="admin-chat__conversation-top">
                        <span className="admin-chat__conversation-name">
                          {displayName(conversation)}
                        </span>
                        <span className="admin-chat__conversation-badges">
                          {unreadCount > 0 ? (
                            <span className="admin-unread-badge" aria-label={`${unreadCount} ข้อความใหม่`}>
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                          ) : null}
                          {pending && conversation.primaryBooking ? (
                            <span className="admin-badge admin-badge--pending">
                              {conversation.primaryBooking.queueNumber}
                            </span>
                          ) : null}
                        </span>
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
          {!selectedId ? (
            <div className="admin-chat__empty">
              <p className="admin-muted">เลือกแชทจากรายการด้านซ้าย</p>
            </div>
          ) : threadLoading && !thread ? (
            <div className="admin-chat__empty">
              <p className="admin-muted">กำลังโหลดแชท…</p>
            </div>
          ) : !thread ? (
            <div className="admin-chat__empty">
              <p className="admin-muted">ไม่พบแชทนี้</p>
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
