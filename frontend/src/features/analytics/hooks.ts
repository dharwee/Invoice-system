"use client";

import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/lib/api/client";

export type AnalyticsResponse = {
  total_processed: number;
  success_rate: number;
  avg_processing_time_ms: number;
  avg_confidence_score: number;
  confidence_distribution: {
    high: { range: string; count: number; percentage: number };
    medium: { range: string; count: number; percentage: number };
    low: { range: string; count: number; percentage: number };
  };
  total_invoices: number;
  processed_today: number;
  failed_or_errored: number;
};

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: () => apiGet<AnalyticsResponse>("/analytics"),
    refetchInterval: 30_000,
  });
}
