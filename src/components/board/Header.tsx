"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

interface Props {
  title?: string;
  backHref?: string;
  accentColor?: string;
  children?: React.ReactNode;
}

export function Header({ title, backHref, accentColor, children }: Props) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    logout();
    router.push("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!profileMenuRef.current) return;
      if (!profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div className="shrink-0">
      <header className="h-14 flex items-center px-5 justify-between bg-white border-b border-border">
        <div className="flex items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-secondary hover:text-ink hover:bg-surface transition-all duration-150 -ml-1"
              aria-label="Go back"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
            </Link>
          )}

          <Link
            href="/"
            className="font-black text-lg tracking-tight text-ink transition-opacity hover:opacity-70"
          >
            Boards
          </Link>

          {title && (
            <>
              <span className="text-border">/</span>
              <span className="font-semibold text-sm text-ink">{title}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {children}
          {user && (
            <>
              <Link
                href="/inbox"
                className="text-sm font-medium px-3 py-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface transition-all duration-150"
              >
                Inbox
              </Link>
              <Link
                href="/settings"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-secondary hover:text-ink hover:bg-surface transition-all duration-150"
                aria-label="Settings"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </Link>

              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen((open) => !open)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-surface text-ink hover:bg-border transition-colors"
                  aria-label="Open profile menu"
                  aria-haspopup="menu"
                  aria-expanded={isProfileMenuOpen}
                >
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </button>

                {isProfileMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-40 rounded-xl border border-border bg-white shadow-lg py-1 z-30"
                    role="menu"
                  >
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        router.push("/dashboard");
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-ink-secondary hover:text-ink hover:bg-surface transition-colors"
                      role="menuitem"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-ink-secondary hover:text-ink hover:bg-surface transition-colors"
                      role="menuitem"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      {accentColor && (
        <div className={`h-1.5 ${accentColor}`} />
      )}
    </div>
  );
}
