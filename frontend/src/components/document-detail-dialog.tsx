"use client";

import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type DocumentDetailResponse } from "@/features/documents/hooks";

type DocumentDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail?: DocumentDetailResponse;
  isLoading?: boolean;
  isSaving?: boolean;
  onSave: (payload: {
    vendor_name?: string;
    invoice_number?: string;
    invoice_date?: string;
    currency?: string;
    total_amount?: number;
    tax_amount?: number;
  }) => void | Promise<void>;
};

export function DocumentDetailDialog({
  open,
  onOpenChange,
  detail,
  isLoading = false,
  isSaving = false,
  onSave,
}: DocumentDetailDialogProps) {
  const [form, setForm] = useState({
    vendor_name: "",
    invoice_number: "",
    invoice_date: "",
    currency: "",
    total_amount: "",
    tax_amount: "",
  });

  useEffect(() => {
    const data = detail?.extractedData;
    setForm({
      vendor_name: data?.vendorName ?? "",
      invoice_number: data?.invoiceNumber ?? "",
      invoice_date: data?.invoiceDate ?? "",
      currency: data?.currency ?? "",
      total_amount: data?.totalAmount?.toString() ?? "",
      tax_amount: data?.taxAmount?.toString() ?? "",
    });
  }, [detail]);

  const validationErrors = detail?.extractedData?.validationErrors ?? [];
  const lineItems = detail?.extractedData?.lineItems ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl border border-white/10 bg-[#17181C] text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {detail?.filename ?? "Document detail"}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            View extracted fields, confidence, and apply manual corrections.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-white/60">Loading document details...</p>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                value={form.vendor_name}
                onChange={(e) => setForm((s) => ({ ...s, vendor_name: e.target.value }))}
                placeholder="Vendor name"
                className="border-white/15 bg-[#0F1116] text-white"
              />
              <Input
                value={form.invoice_number}
                onChange={(e) => setForm((s) => ({ ...s, invoice_number: e.target.value }))}
                placeholder="Invoice number"
                className="border-white/15 bg-[#0F1116] text-white"
              />
              <Input
                value={form.invoice_date}
                onChange={(e) => setForm((s) => ({ ...s, invoice_date: e.target.value }))}
                placeholder="YYYY-MM-DD"
                className="border-white/15 bg-[#0F1116] text-white"
              />
              <Input
                value={form.currency}
                onChange={(e) => setForm((s) => ({ ...s, currency: e.target.value }))}
                placeholder="Currency (e.g. USD)"
                className="border-white/15 bg-[#0F1116] text-white"
              />
              <Input
                value={form.total_amount}
                onChange={(e) => setForm((s) => ({ ...s, total_amount: e.target.value }))}
                placeholder="Total amount"
                className="border-white/15 bg-[#0F1116] text-white"
              />
              <Input
                value={form.tax_amount}
                onChange={(e) => setForm((s) => ({ ...s, tax_amount: e.target.value }))}
                placeholder="Tax amount"
                className="border-white/15 bg-[#0F1116] text-white"
              />
            </div>

            <div className="rounded-xl border border-white/10 bg-[#111216] p-3">
              <p className="text-sm font-medium">
                Confidence:{" "}
                {detail?.extractedData
                  ? `${Math.round(detail.extractedData.confidenceScore * 100)}%`
                  : "—"}
              </p>
              <p className="mt-1 text-xs text-white/60">
                Validation errors: {validationErrors.length}
              </p>
              {validationErrors.length > 0 ? (
                <pre className="mt-2 overflow-x-auto text-xs text-rose-300">
                  {JSON.stringify(validationErrors, null, 2)}
                </pre>
              ) : null}
            </div>

            <div className="rounded-xl border border-white/10 bg-[#111216] p-3">
              <p className="text-sm font-medium">Line items ({lineItems.length})</p>
              <div className="mt-2 space-y-2">
                {lineItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-4 gap-2 text-xs text-white/80">
                    <p>{item.description ?? "—"}</p>
                    <p>Qty: {item.quantity ?? "—"}</p>
                    <p>Unit: {item.unitPrice ?? "—"}</p>
                    <p>Total: {item.lineTotal ?? "—"}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter showCloseButton={false} className="border-t border-white/10 bg-transparent">
          <Button variant="ghost" className="text-white/80" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            className="bg-[#8F8AFF] text-[#171823] hover:bg-[#8F8AFF]/90"
            disabled={isSaving || !detail}
            onClick={async () => {
              await onSave({
                vendor_name: form.vendor_name || undefined,
                invoice_number: form.invoice_number || undefined,
                invoice_date: form.invoice_date || undefined,
                currency: form.currency || undefined,
                total_amount: form.total_amount ? Number(form.total_amount) : undefined,
                tax_amount: form.tax_amount ? Number(form.tax_amount) : undefined,
              });
            }}
          >
            {isSaving ? "Saving..." : "Save correction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
