"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiGet, apiPatch, apiPost, apiPostForm } from "@/lib/api/client";

export type DocumentStatus =
  | "pending"
  | "processing"
  | "processed"
  | "processed_with_errors"
  | "failed";

export type DocumentSummary = {
  id: number;
  filename: string;
  status: DocumentStatus;
  vendor_name: string | null;
  invoice_number: string | null;
  confidence_score: number | null;
  error_count: number;
  created_at: string;
};

export type DocumentsResponse = {
  data: DocumentSummary[];
  total: number;
  page: number;
  limit: number;
};

export type DocumentsParams = {
  page?: number;
  limit?: number;
  status?: DocumentStatus;
  hasErrors?: boolean;
};

export type PatchDocumentPayload = Partial<{
  vendor_name: string;
  invoice_number: string;
  invoice_date: string;
  currency: string;
  total_amount: number;
  tax_amount: number;
}>;

export type DocumentDetailResponse = {
  id: number;
  filename: string;
  status: DocumentStatus;
  filePath: string;
  rawText: string | null;
  processingTimeMs: number | null;
  createdAt: string;
  processedAt: string | null;
  extractedData: {
    id: number;
    documentId: number;
    vendorName: string | null;
    invoiceNumber: string | null;
    invoiceDate: string | null;
    currency: string | null;
    totalAmount: number | null;
    taxAmount: number | null;
    confidenceScore: number;
    validationErrors: Array<Record<string, unknown>>;
    lineItems: Array<{
      id: number;
      description: string | null;
      quantity: number | null;
      unitPrice: number | null;
      lineTotal: number | null;
    }>;
    promptVersion?: { id: number; version: string } | null;
  } | null;
};

function buildDocumentsQuery(params: DocumentsParams) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.status) qs.set("status", params.status);
  if (params.hasErrors) qs.set("hasErrors", "true");
  const search = qs.toString();
  return `/documents${search ? `?${search}` : ""}`;
}

export function useDocuments(params: DocumentsParams) {
  return useQuery({
    queryKey: ["documents", params],
    queryFn: () => apiGet<DocumentsResponse>(buildDocumentsQuery(params)),
    refetchInterval: (query) => {
      const data = query.state.data;
      const hasProcessing = !!data?.data.some(
        (doc) => doc.status === "pending" || doc.status === "processing",
      );
      return hasProcessing ? 2500 : false;
    },
  });
}

export function useDocumentDetail(id?: number) {
  return useQuery({
    queryKey: ["documents", "detail", id],
    queryFn: () => apiGet<DocumentDetailResponse>(`/documents/${id}`),
    enabled: !!id,
  });
}

export function useUploadDocuments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("files[]", file));
      return apiPostForm<Array<{ id: number; filename: string; status: string }>>("/documents", formData);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["documents"] });
      await qc.invalidateQueries({ queryKey: ["analytics"] });
      await qc.invalidateQueries({ queryKey: ["errors"] });
    },
  });
}

export function useReprocessDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, prompt_version_id }: { id: number; prompt_version_id?: number }) =>
      apiPost(`/documents/reprocess/${id}`, prompt_version_id ? { prompt_version_id } : {}),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["documents"] });
      await qc.invalidateQueries({ queryKey: ["analytics"] });
      await qc.invalidateQueries({ queryKey: ["errors"] });
    },
  });
}

export function usePatchDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PatchDocumentPayload }) =>
      apiPatch(`/documents/${id}`, payload),
    onSuccess: async (_, variables) => {
      await qc.invalidateQueries({ queryKey: ["documents"] });
      await qc.invalidateQueries({ queryKey: ["errors"] });
      await qc.invalidateQueries({ queryKey: ["documents", "detail", variables.id] });
      await qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
