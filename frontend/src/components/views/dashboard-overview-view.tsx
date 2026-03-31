"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { type AnalyticsResponse } from "@/features/analytics/hooks";

type DashboardOverviewViewProps = {
  analytics?: AnalyticsResponse;
  invoicesOverTime: Array<{ day: string; invoices: number }>;
};

function StatCard({
  title,
  value,
  delta,
}: {
  title: string;
  value: string;
  delta: string;
}) {
  return (
    <article className="rounded-2xl border border-white/5 bg-[#141518] p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-white/55">{title}</p>
      <p className="mt-2 text-4xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-emerald-400">{delta}</p>
      <div className="mt-3 h-1 w-full rounded-full bg-white/5">
        <div className="h-full w-2/3 rounded-full bg-[#9F9BFF]" />
      </div>
    </article>
  );
}

export function DashboardOverviewView({
  analytics,
  invoicesOverTime,
}: DashboardOverviewViewProps) {
  return (
    <>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Processed" value={String(analytics?.total_processed ?? 0)} delta="Live" />
        <StatCard
          title="Success Rate"
          value={`${(analytics?.success_rate ?? 0).toFixed(1)}%`}
          delta="Live"
        />
        <StatCard
          title="Avg Proc Time"
          value={`${((analytics?.avg_processing_time_ms ?? 0) / 1000).toFixed(1)}s`}
          delta="Live"
        />
        <StatCard
          title="Avg Confidence"
          value={(analytics?.avg_confidence_score ?? 0).toFixed(2)}
          delta="Live"
        />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[2fr_1fr]">
        <article className="rounded-2xl border border-white/5 bg-[#141518] p-4">
          <p className="text-xl font-medium">Invoices processed over time</p>
          <p className="text-sm text-white/45">Performance analysis for the last 7 days</p>
          <div className="mt-6 h-[250px] rounded-xl border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={invoicesOverTime} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} stroke="rgba(255,255,255,0.35)" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#111216",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                  }}
                  labelStyle={{ color: "rgba(255,255,255,0.8)" }}
                />
                <Line
                  type="monotone"
                  dataKey="invoices"
                  stroke="#9F9BFF"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "#9F9BFF" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-white/5 bg-[#111216] p-4">
          <p className="text-lg font-medium">Confidence score distribution</p>
          <div className="mt-6 space-y-5 text-xs">
            <div>
              <p className="mb-1 text-emerald-300">
                {analytics?.confidence_distribution.high.range ?? "90-100%"} (Excellent){" "}
                {Math.round(analytics?.confidence_distribution.high.percentage ?? 0)}%
              </p>
              <div className="h-2 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{ width: `${analytics?.confidence_distribution.high.percentage ?? 0}%` }}
                />
              </div>
            </div>
            <div>
              <p className="mb-1 text-amber-300">
                {analytics?.confidence_distribution.medium.range ?? "70-89%"} (Needs review){" "}
                {Math.round(analytics?.confidence_distribution.medium.percentage ?? 0)}%
              </p>
              <div className="h-2 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{ width: `${analytics?.confidence_distribution.medium.percentage ?? 0}%` }}
                />
              </div>
            </div>
            <div>
              <p className="mb-1 text-rose-300">
                {analytics?.confidence_distribution.low.range ?? "0-69%"} (Failed){" "}
                {Math.round(analytics?.confidence_distribution.low.percentage ?? 0)}%
              </p>
              <div className="h-2 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-rose-400"
                  style={{ width: `${analytics?.confidence_distribution.low.percentage ?? 0}%` }}
                />
              </div>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
