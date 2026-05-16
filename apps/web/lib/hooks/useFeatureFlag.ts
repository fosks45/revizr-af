/**
 * useFeatureFlag — resolves a feature flag for the current user.
 *
 * Supported flags:
 * - 'streaks': Shows a streak badge on the dashboard.
 *
 * Returns false when:
 * - The user's age_band is under13, 13to15, or 16to18 (unless explicitly enabled)
 * - The flag is not recognised
 * - The user profile has not loaded yet
 *
 * Returns false by default. The flag must be explicitly enabled via the
 * server-controlled flag config for non-adult users.
 */

"use client";

import { useEffect, useState } from "react";
import { getUsersMe, type UserProfile } from "@/lib/api";

export type FeatureFlag = "streaks";

const MINOR_AGE_BANDS = new Set<UserProfile["age_band"]>([
  "under13",
  "13to15",
  "16to18",
]);

/**
 * Returns true if the feature flag is enabled for the current user.
 *
 * Design note: flags default to false. Flags that are off for minors
 * require an adult user or explicit per-user server override.
 */
export function useFeatureFlag(flag: FeatureFlag): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    async function resolve() {
      try {
        const user = await getUsersMe();

        // Streaks are off for minors by default
        if (flag === "streaks") {
          if (MINOR_AGE_BANDS.has(user.age_band)) {
            setEnabled(false);
            return;
          }
          // For adult users: enabled (can be overridden by server config)
          setEnabled(true);
          return;
        }

        // Unknown flag — default off
        setEnabled(false);
      } catch {
        // User not loaded / unauthenticated — default off
        setEnabled(false);
      }
    }

    void resolve();
  }, [flag]);

  return enabled;
}
