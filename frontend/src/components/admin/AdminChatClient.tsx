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
  CustomerAvatar,
  customerDisplayName,
} from "@/components/admin/admin-customer-display";
import { ADMIN_BOOKING_STATUS_LABELS } from "@/lib/admin/labels";
import {
  CalendarDays,
  LogOut,
  MessageSquare,
  MoreVertical,
  PanelLeft,
  PanelLeftClose,
  Paperclip,
  Search,
  Send,
  Smile,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const SELECTED_CHAT_STORAGE_KEY = "admin_chat_selected_line_user_id";
const SIDEBAR_COLLAPSED_STORAGE_KEY = "admin_chat_sidebar_collapsed";

type MessageItem = AdminChatThread["messages"][number];

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "ตอนนี้";
  if (minutes < 60) return `${minutes} น.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ช.`;
  return new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}

function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDateDivider(iso: string): string {
  return new Date(iso).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function groupMessagesByDate(messages: MessageItem[]): Array<{ date: string; messages: MessageItem[] }> {
  const groups: Array<{ date: string; messages: MessageItem[] }> = [];
  for (const message of messages) {
    const date = formatDateDivider(message.createdAt);
    const last = groups[groups.length - 1];
    if (last?.date === date) {
      last.messages.push(message);
    } else {
      groups.push({ date, messages: [message] });
    }
  }
  return groups;
}

export function AdminChatClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { refreshSession, logout } = useAdmin();
  const { chatUnreadCount, setChatUnreadCount } = useAdminUnread();
  const [conversations, setConversations] = useState<AdminChatConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thread, setThread] = useState<AdminChatThread | null>(null);
  const [reply, setReply] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [threadMenuOpen, setThreadMenuOpen] = useState(false);
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
  const threadMenuRef = useRef<HTMLDivElement | null>(null);
  const lineUserIdParam = searchParams.get("lineUserId")?.trim() ?? "";

  useEffect(() => {
    setChatUnreadCountRef.current = setChatUnreadCount;
  }, [setChatUnreadCount]);

  useEffect(() => {
    if (localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "1") {
      setSidebarCollapsed(true);
    }
  }, []);

  useEffect(() => {
    setThreadMenuOpen(false);
  }, [selectedId]);

  useEffect(() => {
    if (!threadMenuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!threadMenuRef.current?.contains(event.target as Node)) {
        setThreadMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [threadMenuOpen]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

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

  const selectedConversation = conversations.find((c) => c.lineUserId === selectedId) ?? null;
  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((conversation) => {
      const name = customerDisplayName(conversation).toLowerCase();
      const preview = conversation.messages[0]?.text?.toLowerCase() ?? "";
      return name.includes(q) || preview.includes(q) || conversation.lineUserId.toLowerCase().includes(q);
    });
  }, [conversations, searchQuery]);

  const messageGroups = useMemo(
    () => groupMessagesByDate(thread?.messages ?? []),
    [thread?.messages],
  );

  const customerName = selectedConversation
    ? customerDisplayName(selectedConversation)
    : thread
      ? customerDisplayName(thread)
      : "";

  return (
    <AdminLayout title="แชท LINE" variant="chat-dashboard">
      <div
        className={`admin-chat-dash${sidebarCollapsed ? " admin-chat-dash--sidebar-collapsed" : ""}`}
      >
        <aside
          className="admin-chat-dash__sidebar"
          aria-label="เมนูหลัก"
          aria-expanded={!sidebarCollapsed}
        >
          <div className="admin-chat-dash__brand">
            <span className="admin-chat-dash__brand-mark" aria-hidden="true">
              <Sparkles size={18} strokeWidth={2.2} />
            </span>
            <span className="admin-chat-dash__brand-text">Suan Bai</span>
          </div>

          <nav className="admin-chat-dash__nav">
            <Link
              href="/admin/bookings"
              className={`admin-chat-dash__nav-item${pathname.startsWith("/admin/bookings") ? " admin-chat-dash__nav-item--active" : ""}`}
              title="จัดการคิว"
            >
              <CalendarDays size={18} strokeWidth={2} />
              <span className="admin-chat-dash__nav-label">จัดการคิว</span>
            </Link>
            <Link
              href="/admin/chat"
              className={`admin-chat-dash__nav-item${pathname.startsWith("/admin/chat") ? " admin-chat-dash__nav-item--active" : ""}`}
              title="แชท LINE"
            >
              <MessageSquare size={18} strokeWidth={2} />
              <span className="admin-chat-dash__nav-label">แชท LINE</span>
              {chatUnreadCount > 0 ? (
                <span className="admin-chat-dash__nav-badge">
                  {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
                </span>
              ) : null}
            </Link>
          </nav>

          <div className="admin-chat-dash__sidebar-foot">
            <button
              type="button"
              className="admin-chat-dash__sidebar-toggle"
              onClick={toggleSidebar}
              aria-label={sidebarCollapsed ? "ขยายเมนู" : "ย่อเมนู"}
              title={sidebarCollapsed ? "ขยายเมนู" : "ย่อเมนู"}
            >
              {sidebarCollapsed ? (
                <PanelLeft size={18} strokeWidth={2} />
              ) : (
                <PanelLeftClose size={18} strokeWidth={2} />
              )}
              <span className="admin-chat-dash__nav-label">
                {sidebarCollapsed ? "ขยาย" : "ย่อเมนู"}
              </span>
            </button>

            <button
              type="button"
              className="admin-chat-dash__logout"
              onClick={() => void logout()}
              title="ออกจากระบบ"
            >
              <LogOut size={18} strokeWidth={2} />
              <span className="admin-chat-dash__nav-label">ออกจากระบบ</span>
            </button>
          </div>
        </aside>

        <div className="admin-chat-dash__workspace">
          {loading ? (
            <p className="admin-chat-dash__banner admin-muted">กำลังโหลด…</p>
          ) : null}
          {error ? <p className="admin-chat-dash__banner admin-error">{error}</p> : null}

          <aside className="admin-chat-dash__inbox">
            <header className="admin-chat-dash__inbox-head">
              <div>
                <h1 className="admin-chat-dash__inbox-title">Chat</h1>
                <p className="admin-chat-dash__inbox-sub">
                  Inbox
                  {chatUnreadCount > 0 ? (
                    <span className="admin-chat-dash__inbox-pill">{chatUnreadCount} new</span>
                  ) : null}
                </p>
              </div>
            </header>

            <label className="admin-chat-dash__search">
              <Search size={16} strokeWidth={2} aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหา…"
                aria-label="ค้นหาแชท"
              />
            </label>

            {filteredConversations.length === 0 ? (
              <p className="admin-muted admin-chat-dash__inbox-empty">
                {conversations.length === 0
                  ? "ยังไม่มีข้อความ — ให้ลูกค้าทัก LINE OA ก่อน"
                  : "ไม่พบแชทที่ตรงกับคำค้นหา"}
              </p>
            ) : (
              <ul className="admin-chat-dash__contacts">
                {filteredConversations.map((conversation) => {
                  const name = customerDisplayName(conversation);
                  const preview = conversation.messages[0]?.text ?? "";
                  const isActive = selectedId === conversation.lineUserId;
                  const unreadCount = isActive ? 0 : (conversation.unreadCount ?? 0);
                  const bookingHint = conversation.primaryBooking
                    ? `${ADMIN_BOOKING_STATUS_LABELS[conversation.primaryBooking.status]} · ${conversation.primaryBooking.queueNumber}`
                    : "LINE Customer";

                  return (
                    <li key={conversation.id}>
                      <button
                        type="button"
                        className={`admin-chat-dash__contact${isActive ? " admin-chat-dash__contact--active" : ""}`}
                        onClick={() => selectConversation(conversation.lineUserId)}
                      >
                        <CustomerAvatar name={name} seed={conversation.lineUserId} size="md" />
                        <span className="admin-chat-dash__contact-body">
                          <span className="admin-chat-dash__contact-top">
                            <span className="admin-chat-dash__contact-name">{name}</span>
                            <span className="admin-chat-dash__contact-time">
                              {formatRelativeTime(conversation.lastMessageAt)}
                            </span>
                          </span>
                          <span className="admin-chat-dash__contact-role">{bookingHint}</span>
                          <span className="admin-chat-dash__contact-preview">{preview}</span>
                        </span>
                        {unreadCount > 0 ? (
                          <span className="admin-chat-dash__contact-unread">{unreadCount}</span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>

          <section className="admin-chat-dash__thread">
            {!selectedId ? (
              <div className="admin-chat-dash__thread-empty">
                <p className="admin-muted">เลือกแชทจากรายการ Inbox</p>
              </div>
            ) : threadLoading && !thread ? (
              <div className="admin-chat-dash__thread-empty">
                <p className="admin-muted">กำลังโหลดแชท…</p>
              </div>
            ) : !thread ? (
              <div className="admin-chat-dash__thread-empty">
                <p className="admin-muted">ไม่พบแชทนี้</p>
              </div>
            ) : (
              <>
                <header className="admin-chat-dash__thread-head">
                  <div className="admin-chat-dash__thread-user">
                    <CustomerAvatar name={customerName} seed={thread.lineUserId} size="md" />
                    <div>
                      <p className="admin-chat-dash__thread-name">{customerName}</p>
                      <p className="admin-chat-dash__thread-role">LINE Customer</p>
                    </div>
                  </div>
                  <div className="admin-chat-dash__thread-menu" ref={threadMenuRef}>
                    <button
                      type="button"
                      className="admin-chat-dash__icon-btn"
                      aria-label="ตัวเลือกเพิ่มเติม"
                      aria-expanded={threadMenuOpen}
                      onClick={() => setThreadMenuOpen((open) => !open)}
                    >
                      <MoreVertical size={18} />
                    </button>
                    {threadMenuOpen ? (
                      <div className="admin-chat-dash__dropdown" role="menu">
                        <Link
                          href={`/admin/bookings?lineUserId=${encodeURIComponent(thread.lineUserId)}`}
                          className="admin-chat-dash__dropdown-item"
                          role="menuitem"
                          onClick={() => setThreadMenuOpen(false)}
                        >
                          จัดการคิว
                        </Link>
                      </div>
                    ) : null}
                  </div>
                </header>

                <div className="admin-chat-dash__messages">
                  {messageGroups.map((group) => (
                    <div key={group.date} className="admin-chat-dash__message-group">
                      <p className="admin-chat-dash__date-divider">{group.date}</p>
                      {group.messages.map((message) => {
                        const isInbound = message.direction === "INBOUND";
                        return (
                          <div
                            key={message.id}
                            className={`admin-chat-dash__message admin-chat-dash__message--${message.direction.toLowerCase()}`}
                          >
                            {isInbound ? (
                              <CustomerAvatar name={customerName} seed={thread.lineUserId} size="sm" />
                            ) : null}
                            <div className="admin-chat-dash__message-body">
                              <div
                                className={`admin-chat-dash__bubble admin-chat-dash__bubble--${message.direction.toLowerCase()}`}
                              >
                                <p>{message.text}</p>
                              </div>
                              <time
                                className="admin-chat-dash__message-time"
                                dateTime={message.createdAt}
                              >
                                {formatMessageTime(message.createdAt)}
                              </time>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form className="admin-chat-dash__composer" onSubmit={(e) => void handleSend(e)}>
                  <input
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Write a message…"
                    maxLength={2000}
                    required
                    aria-label="ข้อความตอบกลับ"
                  />
                  <div className="admin-chat-dash__composer-actions">
                    <button type="button" className="admin-chat-dash__icon-btn" aria-label="แนบไฟล์">
                      <Paperclip size={18} />
                    </button>
                    <button type="button" className="admin-chat-dash__icon-btn" aria-label="อีโมจิ">
                      <Smile size={18} />
                    </button>
                    <button
                      type="submit"
                      className="admin-chat-dash__send-btn"
                      disabled={sending || !reply.trim()}
                      aria-label="ส่งข้อความ"
                    >
                      <Send size={16} strokeWidth={2.2} />
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
