"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

const PUBLIC_PATHS = ["/login", "/register"];
const SETUP_PATH = "/team/setup";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, loadFromStorage } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadFromStorage();
    setReady(true);
  }, [loadFromStorage]);

  useEffect(() => {
    if (!ready) return;

    const isPublic = PUBLIC_PATHS.includes(pathname);
    const isSetup = pathname === SETUP_PATH;

    if (!isAuthenticated && !isPublic) {
      router.replace("/login");
    } else if (isAuthenticated && isPublic) {
      router.replace("/");
    } else if (isAuthenticated && !isSetup && !user?.teamId) {
      // User is logged in but has no team — send to setup
      router.replace(SETUP_PATH);
    } else if (isAuthenticated && isSetup && user?.teamId) {
      // User already has a team — don't show setup
      router.replace("/");
    }
  }, [ready, isAuthenticated, pathname, router]);

  if (!ready) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-ink-tertiary rounded-full" style={{ animation: "pulse-dot 1.4s ease-in-out infinite" }} />
          <div className="w-2 h-2 bg-ink-tertiary rounded-full" style={{ animation: "pulse-dot 1.4s ease-in-out 0.2s infinite" }} />
          <div className="w-2 h-2 bg-ink-tertiary rounded-full" style={{ animation: "pulse-dot 1.4s ease-in-out 0.4s infinite" }} />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
