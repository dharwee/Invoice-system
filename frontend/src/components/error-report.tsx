"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
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

export type ErrorMetric = {
  label: string;
  value: string;
  subtext?: string;
  tone?: "default" | "danger" | "warning";
};

export type ErrorRow = {
  id: string;
  invoice: string;
  vendor: string;
  errorType: string;
  errorDetail: string;
  confidence: string;
  actionLabel: string;
};

type ErrorReportProps = {
  title?: string;
  healthText?: string;
  filterValue: string;
  filterStatusLabel: string;
  metrics: ErrorMetric[];
  errors: ErrorRow[];
  summaryText: string;
  page: number;
  totalPages: number;
  onFilterChange: (value: string) => void;
  onFilterStatusClick: () => void;
  onFix: (rowId: string) => void | Promise<void>;
  onPageChange: (page: number) => void;
};

function toneClass(tone: ErrorMetric["tone"]) {
  if (tone === "danger") return "text-rose-300";
  if (tone === "warning") return "text-amber-300";
  return "text-white";
}

export function ErrorReport({
  title = "Error Report",
  healthText,
  filterValue,
  filterStatusLabel,
  metrics,
  errors,
  summaryText,
  page,
  totalPages,
  onFilterChange,
  onFilterStatusClick,
  onFix,
  onPageChange,
}: ErrorReportProps) {
  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-medium text-[#A9A4FF]">{title}</h1>
          {healthText ? <p className="text-sm text-white/60">{healthText}</p> : null}
        </div>
      </header>

      <div className="grid gap-3 md:grid-cols-[1fr_180px]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-white/45" />
          <Input
            value={filterValue}
            onChange={(event) => onFilterChange(event.target.value)}
            placeholder="Filter by vendor or invoice..."
            className="border-white/15 bg-[#0F1116] pl-9 text-white placeholder:text-white/35"
          />
        </div>
        <DarkOutlineButton className="justify-between" onClick={onFilterStatusClick}>
          {filterStatusLabel}
          <span className="text-white/50">▾</span>
        </DarkOutlineButton>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-2xl border border-white/5 bg-[#141518] p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-white/55">{metric.label}</p>
            <p className={`mt-2 text-5xl font-semibold ${toneClass(metric.tone)}`}>{metric.value}</p>
            {metric.subtext ? <p className="mt-1 text-xs text-white/50">{metric.subtext}</p> : null}
          </article>
        ))}
      </div>

      <article className="overflow-hidden rounded-2xl border border-white/5 bg-[#111216]">
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
          <h2 className="text-2xl font-semibold">Recent Anomalies</h2>
        </div>
        <Table>
          <TableHeader className="bg-[#141518] text-white/55">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className={tableHeadTextClass}>Invoice</TableHead>
              <TableHead className={tableHeadTextClass}>Vendor</TableHead>
              <TableHead className={tableHeadTextClass}>Error Type</TableHead>
              <TableHead className={tableHeadTextClass}>Error Detail</TableHead>
              <TableHead className={tableHeadTextClass}>Confidence</TableHead>
              <TableHead className={tableHeadTextClass}>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {errors.map((row) => (
              <TableRow key={row.id} className="border-white/5 hover:bg-white/[0.02]">
                <TableCell className="px-4 py-3 text-white/90">{row.invoice}</TableCell>
                <TableCell className="px-4 py-3 text-white/80">{row.vendor}</TableCell>
                <TableCell className="px-4 py-3 text-amber-300">{row.errorType}</TableCell>
                <TableCell className="px-4 py-3 text-white/70">{row.errorDetail}</TableCell>
                <TableCell className="px-4 py-3 text-rose-300">{row.confidence}</TableCell>
                <TableCell className="px-4 py-3">
                  <DarkOutlineButton onClick={() => onFix(row.id)}>
                    {row.actionLabel}
                  </DarkOutlineButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t border-white/5 px-4 py-3 text-sm text-white/60">
          <p>{summaryText}</p>
          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      </article>
    </section>
  );
}
