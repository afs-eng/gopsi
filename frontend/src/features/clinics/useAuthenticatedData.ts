"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getCurrentUser } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { User } from "@/lib/types";

export function useAuthenticatedData() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }

    let active = true;
    getCurrentUser()
      .then((currentUser) => {
        if (active) {
          const onPlatformWorkspace = pathname === "/platform" || pathname.startsWith("/platform/");
          const onClinicWorkspace = pathname === "/clinics" || pathname.startsWith("/clinics/");
          if (currentUser.is_platform_admin && onClinicWorkspace) {
            router.replace("/platform");
            return;
          }
          if (!currentUser.is_platform_admin && onPlatformWorkspace) {
            router.replace("/");
            return;
          }
          setUser(currentUser);
        }
      })
      .catch(() => router.replace("/login"))
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [pathname, router]);

  return { loading, user };
}
