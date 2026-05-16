/**
 * Revizr Typed API Client
 *
 * Every function corresponds 1:1 to an endpoint in the OpenAPI contract at
 * specs/002-revizr/architecture-pack/contracts/openapi.yaml.
 *
 * Auth token management:
 * - Tokens stored in memory (access) and httpOnly cookie (refresh).
 * - On 401, the client automatically calls /auth/refresh, retries once, then
 *   redirects to /login on second failure.
 * - SSE connections use a dedicated helper (connectSSE).
 *
 * Data classification: access tokens are C6 — never logged, never persisted
 * to localStorage. Refresh token is in httpOnly cookie only.
 */

// ─── Types (mirroring OpenAPI schemas) ────────────────────────────────────

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  role: "student" | "parent" | "teacher";
  age_band: "under13" | "13to15" | "16to18" | "adult";
  locale: "en-GB" | "cy";
  created_at: string;
}

export interface Subject {
  id: string;
  user_id: string;
  subject_name: string;
  exam_board: string;
  level: "11plus" | "ks3" | "gcse" | "alevel";
  is_active: boolean;
}

export interface DiagnosticUploadInitiated {
  job_id: string;
  session_id: string;
  upload_url: string;
  upload_expires_at: string;
}

export interface JobStatus {
  job_id: string;
  status: "pending" | "processing" | "complete" | "failed";
  progress_pct?: number;
  error_message?: string | null;
}

export interface WeaknessResult {
  topic_tag: string;
  weakness_score: number;
}

export interface DiagnosticResults {
  session_id: string;
  results: WeaknessResult[];
}

export interface Question {
  id: string;
  board: string;
  level: "11plus" | "ks3" | "gcse" | "alevel";
  subject: string;
  year?: number;
  paper_ref?: string;
  topic_tags: string[];
  question_text: string;
  mark_scheme_text?: string;
  max_marks: number;
  question_type: "multiple_choice" | "short_answer" | "extended_answer";
  image_refs?: string[];
}

export interface QuestionAttempt {
  id: string;
  question_id: string;
  presented_at: string;
  self_mark_score?: number | null;
  time_spent_seconds?: number | null;
  mark_scheme_viewed: boolean;
}

export interface PracticeSession {
  id: string;
  user_id: string;
  subject_id: string;
  status: "active" | "completed" | "abandoned";
  started_at: string;
  ended_at?: string | null;
  question_count: number;
  attempts?: QuestionAttempt[];
}

export interface TopicProgress {
  topic_tag: string;
  score_avg: number;
  questions_attempted: number;
  questions_correct: number;
}

export interface ProgressSummary {
  user_id: string;
  subject_id: string;
  period: string;
  topics: TopicProgress[];
}

export interface ChildSummary {
  student_id: string;
  display_name: string;
  subjects: Subject[];
}

export interface Subscription {
  id: string;
  plan: "free" | "monthly" | "annual";
  status: "active" | "trialing" | "past_due" | "cancelled" | "incomplete";
  current_period_end: string;
  cancelled_at?: string | null;
}

export interface NotificationPreferences {
  email_session_reminders: boolean;
  email_progress_reports: boolean;
  push_enabled: boolean;
}

export interface LocaleSettings {
  locale: "en-GB" | "cy";
}

export interface ParentalControls {
  student_id: string;
  daily_question_cap: number | null;
  session_duration_minutes: number | null;
}

// ─── Auth Token Store ──────────────────────────────────────────────────────

let _accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

// ─── Base Fetch Wrapper ────────────────────────────────────────────────────

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.revizr.co.uk/v1";

export class RevizrApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly apiError: ApiError
  ) {
    super(apiError.message);
    this.name = "RevizrApiError";
  }
}

type FetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  skipAuth?: boolean;
};

async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { body, skipAuth = false, ...fetchInit } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchInit.headers as Record<string, string>),
  };

  if (!skipAuth && _accessToken) {
    headers["Authorization"] = `Bearer ${_accessToken}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...fetchInit,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Token refresh on 401
  if (response.status === 401 && !skipAuth && !path.includes("/auth/refresh")) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Retry original request with new token
      headers["Authorization"] = `Bearer ${_accessToken}`;
      const retryResponse = await fetch(`${BASE_URL}${path}`, {
        ...fetchInit,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      if (!retryResponse.ok) {
        const err: ApiError = await retryResponse.json();
        throw new RevizrApiError(retryResponse.status, err);
      }
      if (retryResponse.status === 204) return undefined as T;
      return retryResponse.json() as Promise<T>;
    } else {
      // Refresh failed — redirect to login (client-side only)
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw new RevizrApiError(401, {
        code: "SESSION_EXPIRED",
        message: "Your session has expired. Please sign in again.",
      });
    }
  }

  if (!response.ok) {
    let err: ApiError;
    try {
      err = await response.json();
    } catch {
      err = { code: "UNKNOWN", message: response.statusText };
    }
    throw new RevizrApiError(response.status, err);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

async function tryRefreshToken(): Promise<boolean> {
  try {
    // Refresh token is read from httpOnly cookie by the browser automatically
    const result = await apiFetch<TokenPair>("/auth/refresh", {
      method: "POST",
      skipAuth: true,
      body: { refresh_token: "__cookie__" }, // Server reads from cookie
    });
    setAccessToken(result.access_token);
    return true;
  } catch {
    setAccessToken(null);
    return false;
  }
}

// ─── Auth Endpoints ────────────────────────────────────────────────────────

export interface RegisterPayload {
  email: string;
  password: string;
  display_name: string;
  role: "student" | "parent";
  age_band: "under13" | "13to15" | "16to18" | "adult";
  locale?: "en-GB" | "cy";
}

export async function authRegister(
  payload: RegisterPayload
): Promise<TokenPair & { user: UserProfile }> {
  return apiFetch("/auth/register", {
    method: "POST",
    skipAuth: true,
    body: payload,
  });
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function authLogin(
  payload: LoginPayload
): Promise<TokenPair & { user: UserProfile }> {
  return apiFetch("/auth/login", {
    method: "POST",
    skipAuth: true,
    body: payload,
  });
}

export async function authRefresh(
  refreshToken: string
): Promise<TokenPair> {
  return apiFetch("/auth/refresh", {
    method: "POST",
    skipAuth: true,
    body: { refresh_token: refreshToken },
  });
}

export async function authLogout(refreshToken: string): Promise<void> {
  return apiFetch("/auth/logout", {
    method: "POST",
    body: { refresh_token: refreshToken },
  });
}

export async function authForgotPassword(email: string): Promise<{ message: string }> {
  return apiFetch("/auth/forgot-password", {
    method: "POST",
    skipAuth: true,
    body: { email },
  });
}

export async function authResetPassword(
  token: string,
  newPassword: string
): Promise<TokenPair> {
  return apiFetch("/auth/reset-password", {
    method: "POST",
    skipAuth: true,
    body: { token, new_password: newPassword },
  });
}

// ─── Accounts (pairing & consent) ─────────────────────────────────────────

export async function accountsPair(
  studentEmail: string,
  relationship: "parent" | "guardian" | "carer"
): Promise<{ account_id: string; status: string }> {
  return apiFetch("/accounts/pair", {
    method: "POST",
    body: { student_email: studentEmail, relationship },
  });
}

export async function accountsConsent(
  accountId: string,
  consentToken: string
): Promise<{ account_id: string; status: string }> {
  return apiFetch("/accounts/consent", {
    method: "POST",
    body: { account_id: accountId, consent_token: consentToken },
  });
}

// ─── Users ─────────────────────────────────────────────────────────────────

export async function getUsersMe(): Promise<UserProfile> {
  return apiFetch("/users/me");
}

export async function patchUsersMe(
  updates: Partial<Pick<UserProfile, "display_name" | "locale">>
): Promise<UserProfile> {
  return apiFetch("/users/me", { method: "PATCH", body: updates });
}

export async function deleteUsersMe(): Promise<{ message: string }> {
  return apiFetch("/users/me", {
    method: "DELETE",
    body: { confirm: true },
  });
}

export async function getUsersMeExport(): Promise<unknown> {
  return apiFetch("/users/me/export");
}

// ─── Subjects ──────────────────────────────────────────────────────────────

export async function listSubjects(): Promise<{ subjects: Subject[] }> {
  return apiFetch("/subjects");
}

export async function createSubject(payload: {
  subject_name: string;
  exam_board: string;
  level: Subject["level"];
}): Promise<Subject> {
  return apiFetch("/subjects", { method: "POST", body: payload });
}

export async function deleteSubject(id: string): Promise<void> {
  return apiFetch(`/subjects/${id}`, { method: "DELETE" });
}

// ─── Diagnostic ────────────────────────────────────────────────────────────

export async function initiateReportUpload(payload: {
  subject_id: string;
  file_name: string;
  content_type: "application/pdf" | "image/jpeg" | "image/png";
}): Promise<DiagnosticUploadInitiated> {
  return apiFetch("/diagnostic/upload", { method: "POST", body: payload });
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  return apiFetch(`/diagnostic/status/${jobId}`);
}

export async function getDiagnosticResults(
  sessionId: string
): Promise<DiagnosticResults> {
  return apiFetch(`/diagnostic/results/${sessionId}`);
}

export interface DiagnosticQuizPayload {
  subject_id: string;
  responses: Array<{
    topic_tag: string;
    confidence: 1 | 2 | 3 | 4 | 5;
  }>;
}

export async function submitDiagnosticQuiz(
  payload: DiagnosticQuizPayload
): Promise<{ sessionId: string }> {
  return apiFetch("/diagnostic/quiz", { method: "POST", body: payload });
}

/**
 * SSE helper for diagnostic job progress.
 * Returns an EventSource-like interface.
 * Caller must call .close() to clean up.
 */
export interface DiagnosticSSEEvent {
  event: "progress" | "complete" | "failed";
  job_id: string;
  progress_pct?: number;
  session_id?: string;
  error?: string;
}

// F-SEC-001 FIX: Use fetch-based SSE reader with Authorization header instead of
// EventSource with token in URL. EventSource cannot set custom headers, which would
// expose the C6 access token in proxy logs, ALB access logs, and browser history.
export function connectJobSSE(
  jobId: string,
  onEvent: (event: DiagnosticSSEEvent) => void,
  onError?: (err: Error) => void
): AbortController {
  const controller = new AbortController();
  const token = _accessToken ?? "";

  (async () => {
    try {
      const res = await fetch(`${BASE_URL}/diagnostic/events/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        onError?.(new Error(`SSE connection failed: ${res.status}`));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          try {
            const data: DiagnosticSSEEvent = JSON.parse(line.slice(5).trim());
            onEvent(data);
            if (data.event === "complete" || data.event === "failed") {
              controller.abort();
              return;
            }
          } catch {
            // malformed SSE line — skip
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        onError?.(err as Error);
      }
    }
  })();

  return controller;
}

// ─── Practice ──────────────────────────────────────────────────────────────

export async function getPersonalisedQuestions(params: {
  subject_id: string;
  topic_tag?: string;
  count?: number;
}): Promise<{ questions: Question[] }> {
  const qs = new URLSearchParams({ subject_id: params.subject_id });
  if (params.topic_tag) qs.set("topic_tag", params.topic_tag);
  if (params.count !== undefined) qs.set("count", String(params.count));
  return apiFetch(`/practice/questions?${qs.toString()}`);
}

export async function createPracticeSession(payload: {
  subject_id: string;
  question_ids: string[];
}): Promise<PracticeSession> {
  return apiFetch("/practice/sessions", { method: "POST", body: payload });
}

export async function getPracticeSession(id: string): Promise<PracticeSession> {
  return apiFetch(`/practice/sessions/${id}`);
}

export async function updatePracticeSession(
  id: string,
  status: "completed" | "abandoned"
): Promise<PracticeSession> {
  return apiFetch(`/practice/sessions/${id}`, {
    method: "PATCH",
    body: { status },
  });
}

export async function submitQuestionAttempt(
  sessionId: string,
  payload: {
    question_id: string;
    self_mark_score: number;
    time_spent_seconds: number;
    mark_scheme_viewed?: boolean;
  }
): Promise<QuestionAttempt> {
  return apiFetch(`/practice/sessions/${sessionId}/attempt`, {
    method: "POST",
    body: payload,
  });
}

// ─── Progress ──────────────────────────────────────────────────────────────

export async function getProgressSummary(params: {
  subject_id: string;
  period?: string;
}): Promise<ProgressSummary> {
  const qs = new URLSearchParams({ subject_id: params.subject_id });
  if (params.period) qs.set("period", params.period);
  return apiFetch(`/progress?${qs.toString()}`);
}

export async function getProgressTopics(params: {
  subject_id: string;
  weeks?: number;
}): Promise<{ topics: TopicProgress[] }> {
  const qs = new URLSearchParams({ subject_id: params.subject_id });
  if (params.weeks !== undefined) qs.set("weeks", String(params.weeks));
  return apiFetch(`/progress/topics?${qs.toString()}`);
}

// ─── Parent ────────────────────────────────────────────────────────────────

export async function listChildren(): Promise<{ children: ChildSummary[] }> {
  return apiFetch("/parent/children");
}

export async function getChildProgress(
  studentId: string,
  subjectId?: string
): Promise<ProgressSummary[]> {
  const qs = new URLSearchParams();
  if (subjectId) qs.set("subject_id", subjectId);
  const query = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch(`/parent/children/${studentId}/progress${query}`);
}

export async function getChildSessions(
  studentId: string,
  params?: { limit?: number; before?: string }
): Promise<{ sessions: PracticeSession[]; next_cursor: string | null }> {
  const qs = new URLSearchParams();
  if (params?.limit !== undefined) qs.set("limit", String(params.limit));
  if (params?.before) qs.set("before", params.before);
  const query = qs.toString() ? `?${qs.toString()}` : "";
  return apiFetch(`/parent/children/${studentId}/sessions${query}`);
}

export async function updateParentalControls(
  studentId: string,
  payload: {
    daily_question_cap?: number | null;
    session_duration_minutes?: number | null;
  }
): Promise<ParentalControls> {
  return apiFetch(`/parent/children/${studentId}/controls`, {
    method: "POST",
    body: payload,
  });
}

// ─── Subscriptions ─────────────────────────────────────────────────────────

export async function getMySubscription(): Promise<Subscription> {
  return apiFetch("/subscriptions/me");
}

export async function createCheckoutSession(payload: {
  plan: "monthly" | "annual";
  success_url: string;
  cancel_url: string;
}): Promise<{ checkout_url: string }> {
  return apiFetch("/subscriptions/checkout", { method: "POST", body: payload });
}

export async function createBillingPortalSession(
  returnUrl: string
): Promise<{ portal_url: string }> {
  return apiFetch("/subscriptions/portal", {
    method: "POST",
    body: { return_url: returnUrl },
  });
}

// ─── Notifications ─────────────────────────────────────────────────────────

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  return apiFetch("/notifications/preferences");
}

export async function updateNotificationPreferences(
  updates: Partial<NotificationPreferences> & {
    push_subscription?: {
      endpoint: string;
      keys: { p256dh: string; auth: string };
    };
  }
): Promise<NotificationPreferences> {
  return apiFetch("/notifications/preferences", {
    method: "PATCH",
    body: updates,
  });
}

// ─── Settings ──────────────────────────────────────────────────────────────

export async function getLocaleSettings(): Promise<LocaleSettings> {
  return apiFetch("/settings/locale");
}

export async function updateLocaleSettings(
  locale: "en-GB" | "cy"
): Promise<LocaleSettings> {
  return apiFetch("/settings/locale", {
    method: "PATCH",
    body: { locale },
  });
}
