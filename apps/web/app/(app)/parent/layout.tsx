/**
 * Parent section layout — guards against non-parent roles.
 * If user.role !== 'parent', redirects to /dashboard.
 */

"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getUsersMe, RevizrApiError } from "@/lib/api";

export default function ParentLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const user = await getUsersMe();
        if (user.role !== "parent") {
          router.replace("/dashboard");
        } else {
          setAuthorized(true);
        }
      } catch (ex) {
        if (ex instanceof RevizrApiError && ex.statusCode === 401) {
          router.replace("/login");
        } else {
          router.replace("/dashboard");
        }
      }
    }
    void check();
  }, [router]);

  if (!authorized) {
    return (
      <div className="page-container py-8">
        <p className="text-text-tertiary text-sm" aria-live="polite">
          Loading…
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
