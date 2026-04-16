"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { LoadingDots } from "@/components/ui/LoadingDots";

const PUBLIC_PATHS = ["/login", "/register"];
const SETUP_PATH = "/team/setup";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { hydrated, isAuthenticated, user, loadFromStorage } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const redirectTo = useMemo(() => {
    if (!hydrated) return null;
    const isPublic = PUBLIC_PATHS.includes(pathname);
    const isSetup = pathname === SETUP_PATH;

    if (!isAuthenticated && !isPublic) {
      return "/login";
    }
    if (isAuthenticated && isPublic) {
      return user?.teamId ? "/" : SETUP_PATH;
    }
    if (isAuthenticated && !isSetup && !user?.teamId) {
      return SETUP_PATH;
    }
    if (isAuthenticated && isSetup && user?.teamId) {
      return "/";
    }
    return null;
  }, [hydrated, isAuthenticated, pathname, user?.teamId]);

  useEffect(() => {
    if (!redirectTo || redirectTo === pathname) return;
    router.replace(redirectTo);
  }, [pathname, redirectTo, router]);

  if (!hydrated || (redirectTo && redirectTo !== pathname)) {
    return (
      <div className="flex h-full items-center justify-center bg-white">
        <div className="flex items-center gap-2">
          <LoadingDots />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
