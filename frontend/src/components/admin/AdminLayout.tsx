"use client";

import { useAdmin } from "@/components/admin/AdminProvider";
import { fetchAdminChatUnreadCount } from "@/lib/admin/chat-api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";

const UNREAD_POLL_MS = 4000;

type AdminLayoutProps = {
  children: ReactNode;
  title: string;
};

function UnreadTabBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="admin-unread-badge admin-unread-badge--tab" aria-hidden="true">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { authed, login, logout } = useAdmin();
  const pathname = usePathname();
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await fetchAdminChatUnreadCount();
      setChatUnreadCount(count);
    } catch {
      // ignore background poll errors
    }
  }, []);

  useEffect(() => {
    if (!authed) {
      setChatUnreadCount(0);
      return;
    }

    void loadUnreadCount();
    const timer = window.setInterval(() => {
      void loadUnreadCount();
    }, UNREAD_POLL_MS);

    return () => window.clearInterval(timer);
  }, [authed, loadUnreadCount, pathname]);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoginError(null);
    try {
      await login(password);
      setPassword("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      if (message.includes("not configured")) {
        setLoginError("ยังไม่ได้ตั้ง ADMIN_PASSWORD บน server");
      } else if (message === "Invalid password") {
        setLoginError("รหัสผ่านไม่ถูกต้อง");
      } else {
        setLoginError(message);
      }
    }
  }

  if (authed === null) {
    return (
      <main className="admin-page">
        <p className="admin-muted admin-shell">กำลังโหลด…</p>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="admin-page">
        <div className="admin-card admin-login">
          <h1>Admin</h1>
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
      <div className="admin-shell admin-shell--wide">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">Staff dashboard</p>
            <h1>{title}</h1>
          </div>
          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => void logout()}>
            ออกจากระบบ
          </button>
        </header>

        <nav className="admin-tabs" aria-label="Admin sections">
          <Link
            href="/admin/bookings"
            className={`admin-tab${pathname.startsWith("/admin/bookings") ? " admin-tab--active" : ""}`}
          >
            จัดการคิว
          </Link>
          <Link
            href="/admin/chat"
            className={`admin-tab${pathname.startsWith("/admin/chat") ? " admin-tab--active" : ""}`}
          >
            แชท LINE
            <UnreadTabBadge count={chatUnreadCount} />
          </Link>
        </nav>

        {children}
      </div>
    </main>
  );
}
