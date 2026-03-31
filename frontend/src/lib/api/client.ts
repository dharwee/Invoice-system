export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

function toAbsoluteUrl(input: RequestInfo | URL): RequestInfo | URL {
  if (typeof input !== "string") return input;
  if (input.startsWith("http://") || input.startsWith("https://")) return input;
  return `${API_BASE_URL}${input.startsWith("/") ? input : `/${input}`}`;
}

export async function apiFetch<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const isFormData = init?.body instanceof FormData;
  const response = await fetch(toAbsoluteUrl(input), {
    ...init,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      details = undefined;
    }
    const message =
      typeof details === "object" &&
      details !== null &&
      "error" in details &&
      typeof (details as { error?: unknown }).error === "string"
        ? (details as { error: string }).error
        : response.statusText || "Request failed";
    throw new ApiError(message, response.status, details);
  }

  return (await response.json()) as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body ?? {}),
  });
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: "PATCH",
    body: JSON.stringify(body ?? {}),
  });
}

export async function apiPostForm<T>(path: string, formData: FormData): Promise<T> {
  return apiFetch<T>(path, {
    method: "POST",
    body: formData,
  });
}
