"use client";

import { useState } from "react";

import { DocumentDetailDialog } from "@/components/document-detail-dialog";
import { ErrorReport } from "@/components/error-report";
import { InvoiceList } from "@/components/invoice-list";
import { Sidebar, type SidebarItem } from "@/components/sidebar";
import { DashboardOverviewView } from "@/components/views/dashboard-overview-view";
import { PromptsView } from "@/components/views/prompts-view";
import { useAnalytics } from "@/features/analytics/hooks";
import {
  useDocumentDetail,
  useDocuments,
  usePatchDocument,
  useUploadDocuments,
} from "@/features/documents/hooks";
import { useErrorAnalytics, useErrors } from "@/features/errors/hooks";

const VIEW_TITLES: Record<SidebarItem, string> = {
  dashboard: "Dashboard",
  invoices: "Invoices",
  "error-report": "Error Report",
  prompts: "Prompts",
};

export function Dashboard() {
  const [activeView, setActiveView] = useState<SidebarItem>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [errorFilter, setErrorFilter] = useState("");
  const [documentsPage, setDocumentsPage] = useState(1);
  const [errorsPage, setErrorsPage] = useState(1);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | undefined>(undefined);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);

  const analyticsQuery = useAnalytics();
  const documentsQuery = useDocuments({ page: documentsPage, limit: 10 });
  const chartDocumentsQuery = useDocuments({ page: 1, limit: 200 });
  const errorsQuery = useErrors({ page: errorsPage, limit: 10 });
  const errorAnalyticsQuery = useErrorAnalytics();
  const uploadMutation = useUploadDocuments();
  const patchDocumentMutation = usePatchDocument();
  const documentDetailQuery = useDocumentDetail(selectedDocumentId);

  const analytics = analyticsQuery.data;
  const documents = documentsQuery.data;
  const chartDocuments = chartDocumentsQuery.data?.data ?? [];
  const errors = errorsQuery.data ?? [];
  const errorAnalytics = errorAnalyticsQuery.data;

  const invoicesOverTime = (() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();
    const buckets = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(now);
      date.setDate(now.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);
      return { key, label: days[date.getDay()], count: 0 };
    });

    const bucketMap = new Map(buckets.map((b) => [b.key, b]));
    for (const doc of chartDocuments) {
      const key = new Date(doc.created_at).toISOString().slice(0, 10);
      const bucket = bucketMap.get(key);
      if (bucket) bucket.count += 1;
    }

    return buckets.map((b) => ({ day: b.label, invoices: b.count }));
  })();

  const invoiceMetrics = [
    { label: "Total Invoices", value: String(analytics?.total_invoices ?? 0), subtext: "All non-pending docs" },
    { label: "Processed Today", value: String(analytics?.processed_today ?? 0), subtext: "Processed since midnight" },
    {
      label: "Avg Confidence",
      value: `${Math.round((analytics?.avg_confidence_score ?? 0) * 100)}%`,
      subtext: "Across processed invoices",
    },
    {
      label: "Failed / Errors",
      value: String(analytics?.failed_or_errored ?? 0),
      subtext: "failed + processed_with_errors",
      tone: "danger" as const,
    },
  ];

  const invoiceRows = (documents?.data ?? []).map((doc) => ({
    id: String(doc.id),
    filename: doc.filename,
    vendor: doc.vendor_name ?? "Unknown",
    invoiceNumber: doc.invoice_number ?? "—",
    date: new Date(doc.created_at).toLocaleDateString(),
    amount: "—",
    confidence:
      doc.confidence_score === null ? "—" : `${Math.round(doc.confidence_score * 100)}%`,
    status: doc.status,
  }));

  const invoicePagination = {
    page: documents?.page ?? documentsPage,
    pageSize: documents?.limit ?? 10,
    totalItems: documents?.total ?? 0,
    totalPages: Math.max(1, Math.ceil((documents?.total ?? 0) / (documents?.limit ?? 10))),
  };

  const topErrorEntry = errorAnalytics?.error_breakdown
    ? Object.entries(errorAnalytics.error_breakdown).sort((a, b) => b[1] - a[1])[0]
    : undefined;
  const avgFailedConfidence =
    errors.length > 0
      ? errors.reduce((sum, row) => sum + (row.confidence_score ?? 0), 0) / errors.length
      : 0;

  const errorMetrics = [
    {
      label: "Total Invoices with Errors",
      value: String(errorAnalytics?.total_error_invoices ?? errors.length ?? 0),
      subtext: "Error documents in system",
      tone: "danger" as const,
    },
    {
      label: "Most Common Error",
      value: topErrorEntry ? topErrorEntry[0].replace(/_/g, " ") : "—",
      subtext: topErrorEntry ? `${topErrorEntry[1]} occurrences` : "No data yet",
      tone: "warning" as const,
    },
    {
      label: "Avg Confidence (Failed)",
      value: `${Math.round(avgFailedConfidence * 100)}%`,
      subtext: "Across errored docs",
    },
  ];

  const filteredErrors = errors.filter((row) => {
    if (!errorFilter.trim()) return true;
    const q = errorFilter.toLowerCase();
    return (
      row.filename.toLowerCase().includes(q) ||
      (row.vendor_name ?? "").toLowerCase().includes(q) ||
      (row.invoice_number ?? "").toLowerCase().includes(q)
    );
  });

  const errorRows = filteredErrors.map((row) => ({
    id: String(row.id),
    invoice: row.filename,
    vendor: row.vendor_name ?? "Unknown",
    errorType: row.error_types[0]?.replace(/_/g, " ") ?? row.status,
    errorDetail:
      row.failed_fields.length > 0
        ? `Missing fields: ${row.failed_fields.join(", ")}`
        : `Status: ${row.status}`,
    confidence: `${Math.round((row.confidence_score ?? 0) * 100)}%`,
    actionLabel: "Fix manually",
  }));

  const renderContent = () => {
    if (activeView === "invoices") {
      return (
        <InvoiceList
          title="Invoices"
          metrics={invoiceMetrics}
          invoices={invoiceRows}
          pagination={invoicePagination}
          isUploading={uploadMutation.isPending}
          uploadProgressPercent={uploadMutation.isPending ? 65 : undefined}
          onUploadFiles={async (files) => {
            await uploadMutation.mutateAsync(files);
          }}
          onPageChange={setDocumentsPage}
          onOpenInvoice={(invoiceId) => {
            setSelectedDocumentId(Number(invoiceId));
            setDocumentDialogOpen(true);
          }}
        />
      );
    }

    if (activeView === "prompts") return <PromptsView />;

    if (activeView === "error-report") {
      return (
        <ErrorReport
          title="Error Report"
          filterValue={errorFilter}
          filterStatusLabel="All errors"
          metrics={errorMetrics}
          errors={errorRows}
          summaryText={`Showing ${errorRows.length} of ${errors.length} active errors`}
          page={errorsPage}
          totalPages={Math.max(1, Math.ceil(errors.length / 10))}
          onFilterChange={setErrorFilter}
          onFilterStatusClick={() => {}}
          onFix={async (rowId) => {
            setSelectedDocumentId(Number(rowId));
            setDocumentDialogOpen(true);
          }}
          onPageChange={setErrorsPage}
        />
      );
    }

    return <DashboardOverviewView analytics={analytics} invoicesOverTime={invoicesOverTime} />;
  };

  return (
    <main className="min-h-screen bg-[#090A0D] text-white">
      <div
        className={`grid min-h-screen w-full overflow-hidden bg-[#0E0F12] ${
          sidebarCollapsed ? "grid-cols-[80px_1fr]" : "grid-cols-[220px_1fr]"
        }`}
      >
        <Sidebar
          activeItem={activeView}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((prev) => !prev)}
          onItemSelect={setActiveView}
        />

        <section className="p-5">
          <header className="mb-5 flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-6">
              <p className="text-lg font-semibold text-[#A9A4FF]">{VIEW_TITLES[activeView]}</p>
            </div>
          </header>
          {renderContent()}
        </section>
      </div>
      <DocumentDetailDialog
        open={documentDialogOpen}
        onOpenChange={setDocumentDialogOpen}
        detail={documentDetailQuery.data}
        isLoading={documentDetailQuery.isLoading}
        isSaving={patchDocumentMutation.isPending}
        onSave={async (payload) => {
          if (!selectedDocumentId) return;
          await patchDocumentMutation.mutateAsync({ id: selectedDocumentId, payload });
          await documentDetailQuery.refetch();
        }}
      />
    </main>
  );
}
