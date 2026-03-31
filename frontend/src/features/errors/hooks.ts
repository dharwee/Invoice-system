"use client";

import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/lib/api/client";

export type ErrorDocument = {
  id: number;
  filename: string;
  status: "failed" | "processed_with_errors";
  vendor_name: string | null;
  invoice_number: string | null;
  confidence_score: number;
  error_count: number;
  error_types: string[];
  failed_fields: string[];
  processed_at: string | null;
};

export type ErrorAnalyticsResponse = {
  total_error_invoices: number;
  error_breakdown: Record<string, number>;
  most_missing_fields: Array<{ field: string; count: number }>;
};

export function useErrors(params?: { page?: number; limit?: number }) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();
  return useQuery({
    queryKey: ["errors", params],
    queryFn: () => apiGet<ErrorDocument[]>(`/errors${query ? `?${query}` : ""}`),
    refetchInterval: 15_000,
  });
}

export function useErrorAnalytics() {
  return useQuery({
    queryKey: ["errors", "analytics"],
    queryFn: () => apiGet<ErrorAnalyticsResponse>("/errors/analytics"),
    refetchInterval: 30_000,
  });
}
