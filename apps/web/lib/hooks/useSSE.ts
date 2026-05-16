/**
 * useSSE — React hook for Server-Sent Events.
 *
 * Opens an EventSource to the given URL, returns { data, status, error }.
 * Closes the connection on unmount or when url changes.
 *
 * SSE connections pass the access token as a query param (?token=...) since
 * EventSource does not support custom headers in the browser.
 *
 * Data class: access tokens are C6 — only included over HTTPS in production.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { getAccessToken } from "@/lib/api";

export type SSEStatus = "idle" | "connecting" | "open" | "closed" | "error";

interface SSEState<T> {
  data: T | null;
  status: SSEStatus;
  error: Event | null;
}

/**
 * @param url - Full URL to the SSE endpoint. Pass null to disable.
 * @param parseData - Optional parser for the raw message data string.
 */
export function useSSE<T = unknown>(
  url: string | null,
  parseData?: (raw: string) => T
): SSEState<T> {
  const [state, setState] = useState<SSEState<T>>({
    data: null,
    status: "idle",
    error: null,
  });

  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!url) {
      setState({ data: null, status: "idle", error: null });
      return;
    }

    // Append access token as query param
    const token = getAccessToken();
    const fullUrl = token
      ? `${url}${url.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`
      : url;

    setState((prev) => ({ ...prev, status: "connecting", error: null }));

    const es = new EventSource(fullUrl);
    esRef.current = es;

    es.addEventListener("open", () => {
      setState((prev) => ({ ...prev, status: "open" }));
    });

    es.addEventListener("message", (e: MessageEvent) => {
      try {
        const parsed = parseData
          ? parseData(e.data as string)
          : (JSON.parse(e.data as string) as T);
        setState((prev) => ({ ...prev, data: parsed, status: "open" }));
      } catch {
        // Malformed event — ignore
      }
    });

    es.addEventListener("error", (errorEvent) => {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: errorEvent,
      }));
      es.close();
    });

    return () => {
      es.close();
      esRef.current = null;
      setState((prev) => ({ ...prev, status: "closed" }));
    };
  }, [url, parseData]);

  return state;
}
