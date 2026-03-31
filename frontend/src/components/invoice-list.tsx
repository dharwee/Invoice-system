"use client";

import { UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DarkOutlineButton,
  PaginationControls,
  tableHeadTextClass,
} from "@/components/shared/ui-patterns";

export type InvoiceMetric = {
  label: string;
  value: string;
  subtext?: string;
  tone?: "default" | "success" | "warning" | "danger";
};

export type InvoiceRow = {
  id: string;
  filename: string;
  vendor: string;
  invoiceNumber: string;
  date: string;
  amount: string;
  confidence?: string;
  status: string;
};

export type InvoicePagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

type InvoiceListProps = {
  title?: string;
  systemStatusText?: string;
  uploadHelpText?: string;
  uploadProgressLabel?: string;
  uploadProgressPercent?: number;
  metrics: InvoiceMetric[];
  invoices: InvoiceRow[];
  pagination: InvoicePagination;
  isUploading?: boolean;
  onUploadFiles: (files: File[]) => void | Promise<void>;
  onPageChange: (page: number) => void;
  onOpenInvoice?: (invoiceId: string) => void;
};

function metricToneClass(tone: InvoiceMetric["tone"]) {
  if (tone === "success") return "text-emerald-300";
  if (tone === "warning") return "text-amber-300";
  if (tone === "danger") return "text-rose-300";
  return "text-[#A9A4FF]";
}

function statusClass(status: string) {
  const value = status.toLowerCase();
  if (value.includes("complete") || value.includes("processed")) {
    return "bg-emerald-500/15 text-emerald-300";
  }
  if (value.includes("processing") || value.includes("review")) {
    return "bg-amber-500/15 text-amber-300";
  }
  if (value.includes("fail") || value.includes("error")) {
    return "bg-rose-500/15 text-rose-300";
  }
  return "bg-white/10 text-white/70";
}

export function InvoiceList({
  title = "Invoices",
  systemStatusText,
  uploadHelpText = "Supports single or bulk upload · PDF only",
  uploadProgressLabel = "Uploading files...",
  uploadProgressPercent,
  metrics,
  invoices,
  pagination,
  isUploading = false,
  onUploadFiles,
  onPageChange,
  onOpenInvoice,
}: InvoiceListProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) onUploadFiles(acceptedFiles);
    },
    multiple: true,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  const safeProgress =
    uploadProgressPercent === undefined
      ? undefined
      : Math.max(0, Math.min(100, uploadProgressPercent));
  const hasResults = pagination.totalItems > 0;
  const startItem = hasResults ? (pagination.page - 1) * pagination.pageSize + 1 : 0;
  const endItem = hasResults
    ? Math.min(pagination.page * pagination.pageSize, pagination.totalItems)
    : 0;

  return (
    <section className="space-y-4 text-white">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-medium">{title}</h1>
        {systemStatusText ? <p className="text-sm text-white/60">{systemStatusText}</p> : null}
      </header>

      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-2xl border border-dashed p-10 text-center transition-colors ${
          isDragActive ? "border-[#8F8AFF] bg-[#8F8AFF]/10" : "border-white/20 bg-[#111216]"
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto size-7 text-white/75" />
        <p className="mt-3 text-xl font-medium">
          Drop invoice PDFs here or <span className="text-[#A9A4FF] underline">click to browse</span>
        </p>
        <p className="mt-2 text-sm text-white/50">{uploadHelpText}</p>
      </div>

      {isUploading || safeProgress !== undefined ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-white/50">
            <p>{uploadProgressLabel}</p>
            <p>{safeProgress ?? 0}%</p>
          </div>
          <div className="h-1 rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[#9F9BFF]" style={{ width: `${safeProgress ?? 0}%` }} />
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-2xl border border-white/5 bg-[#141518] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-white/55">{metric.label}</p>
            <p className={`mt-2 text-5xl font-semibold ${metricToneClass(metric.tone)}`}>{metric.value}</p>
            {metric.subtext ? <p className="mt-1 text-xs text-white/50">{metric.subtext}</p> : null}
          </article>
        ))}
      </div>

      <article className="overflow-hidden rounded-2xl border border-white/5 bg-[#111216]">
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
          <h2 className="text-3xl font-semibold">Recent Extractions</h2>
        </div>

        <Table className="text-sm">
          <TableHeader className="bg-[#141518] text-white/55">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className={tableHeadTextClass}>Filename</TableHead>
              <TableHead className={tableHeadTextClass}>Vendor</TableHead>
              <TableHead className={tableHeadTextClass}>Invoice #</TableHead>
              <TableHead className={tableHeadTextClass}>Date</TableHead>
              <TableHead className={tableHeadTextClass}>Amount</TableHead>
              <TableHead className={tableHeadTextClass}>Confidence</TableHead>
              <TableHead className={tableHeadTextClass}>Status</TableHead>
              <TableHead className={tableHeadTextClass}>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id} className="border-white/5 hover:bg-white/[0.02]">
                <TableCell className="px-4 py-3 text-white/90">{invoice.filename}</TableCell>
                <TableCell className="px-4 py-3 text-white/80">{invoice.vendor}</TableCell>
                <TableCell className="px-4 py-3 text-white/80">{invoice.invoiceNumber}</TableCell>
                <TableCell className="px-4 py-3 text-white/80">{invoice.date}</TableCell>
                <TableCell className="px-4 py-3 text-white">{invoice.amount}</TableCell>
                <TableCell className="px-4 py-3 text-white/80">{invoice.confidence ?? "—"}</TableCell>
                <TableCell className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs ${statusClass(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <DarkOutlineButton onClick={() => onOpenInvoice?.(invoice.id)}>
                    View
                  </DarkOutlineButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-white/5 px-4 py-3 text-sm text-white/60">
          <p>
            Showing {startItem} to {endItem} of {pagination.totalItems} results
          </p>
          <PaginationControls
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      </article>
    </section>
  );
}
