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
      <header className="border-b border-border bg-white px-4 py-3 sm:px-5 sm:py-0">
        <div className="mx-auto flex max-w-[100rem] flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:h-14">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            {backHref && (
              <Link
                href={backHref}
                className="-ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-secondary transition-all duration-150 hover:bg-surface hover:text-ink"
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
              className="shrink-0 text-lg font-black tracking-tight text-ink transition-opacity hover:opacity-70"
            >
              Emma
            </Link>

            {title && (
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-border">/</span>
                <span className="truncate text-sm font-semibold text-ink">
                  {title}
                </span>
              </div>
            )}
          </div>

          <div className="flex w-full flex-wrap items-center justify-end gap-1.5 sm:w-auto sm:gap-2">
            {children}
            {user && (
              <>
                <Link
                  href="/inbox"
                  className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-secondary transition-all duration-150 hover:bg-surface hover:text-ink sm:px-3"
                >
                  Inbox
                </Link>
                <Link
                  href="/settings"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary transition-all duration-150 hover:bg-surface hover:text-ink"
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
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-xs font-bold text-ink transition-colors hover:bg-border"
                    aria-label="Open profile menu"
                    aria-haspopup="menu"
                    aria-expanded={isProfileMenuOpen}
                  >
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </button>

                  {isProfileMenuOpen && (
                    <div
                      className="absolute right-0 z-30 mt-2 w-40 rounded-xl border border-border bg-white py-1 shadow-lg"
                      role="menu"
                    >
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          router.push("/dashboard");
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-ink-secondary transition-colors hover:bg-surface hover:text-ink"
                        role="menuitem"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-ink-secondary transition-colors hover:bg-surface hover:text-ink"
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
        </div>
      </header>

      {accentColor && (
        <div className={`h-1.5 ${accentColor}`} />
      )}
    </div>
  );
}
