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

export function AdminChatClient() {
  const { refreshSession } = useAdmin();
  const [conversations, setConversations] = useState<AdminChatConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thread, setThread] = useState<AdminChatThread | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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
                return (
                  <li key={conversation.id}>
                    <button
                      type="button"
                      className={`admin-chat__conversation${isActive ? " admin-chat__conversation--active" : ""}`}
                      onClick={() => setSelectedId(conversation.lineUserId)}
                    >
                      <span className="admin-chat__conversation-name">
                        {displayName(conversation)}
                      </span>
                      <span className="admin-chat__conversation-preview">{preview}</span>
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
