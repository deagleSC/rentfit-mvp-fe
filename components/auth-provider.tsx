"use client";

import { useAuthStore } from "@/zustand/stores/auth-store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const pathname = usePathname();
  const router = useRouter();
  const redirectingRef = useRef(false);

  useEffect(() => {
    // Skip on server-side
    if (typeof window === "undefined") return;
    if (!pathname) return;

    // Prevent multiple redirects
    if (redirectingRef.current) return;

    // Check localStorage for stored auth state (handles hydration timing)
    let storedUser = null;
    try {
      const stored = localStorage.getItem("auth-store");
      if (stored) {
        const parsed = JSON.parse(stored);
        storedUser = parsed.state?.currentUser;
      }
    } catch {
      // Ignore localStorage errors
    }

    // Use currentUser if available, otherwise fall back to stored user
    const user = currentUser || storedUser;

    const isAuthRoute = pathname.startsWith("/auth");
    const isBaseRoute = pathname === "" || pathname === "/";

    if (!user && isBaseRoute) {
      redirectingRef.current = true;
      router.push("/auth/login");
      setTimeout(() => {
        redirectingRef.current = false;
      }, 100);
      return;
    }

    if (user && isBaseRoute) {
      redirectingRef.current = true;
      router.push("/dashboard");
      setTimeout(() => {
        redirectingRef.current = false;
      }, 100);
      return;
    }

    // If user is logged in and tries to access auth routes, redirect to dashboard
    if (user && isAuthRoute) {
      redirectingRef.current = true;
      router.push("/dashboard");
      setTimeout(() => {
        redirectingRef.current = false;
      }, 100);
      return;
    }

    // If user is NOT logged in and tries to access non-auth routes, redirect to login
    // Only redirect if we're sure there's no user (both currentUser and storedUser are null)
    if (!user && !isAuthRoute) {
      redirectingRef.current = true;
      router.push("/auth/login");
      setTimeout(() => {
        redirectingRef.current = false;
      }, 100);
      return;
    }

    // If user is logged in and accessing non-auth routes, allow access (do nothing)
  }, [currentUser, pathname, router]);

  return <>{children}</>;
}
