"use client";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, FunnelChart, Funnel, LabelList, Cell,
} from "recharts";
import { Card } from "@/components/ui/Card";

const tooltipStyle = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  fontSize: 12,
  boxShadow: "var(--shadow-md)",
};

export function ActivityOverTimeChart({ data }: { data: { date: string; count: number }[] }) {
  return (
    <Card className="p-5">
      <h3 className="text-[13.5px] font-semibold mb-4">Activity — last {data.length} days</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ left: -20, top: 5 }}>
          <defs>
            <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-faint)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-faint)" }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey="count" stroke="var(--accent)" strokeWidth={2} fill="url(#activityFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function SourceComparisonChart({ data }: { data: { source: string; applications: number; replies: number; won: number }[] }) {
  return (
    <Card className="p-5">
      <h3 className="text-[13.5px] font-semibold mb-4">Replies by Source</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ left: -20, top: 5 }} barCategoryGap={28}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
          <XAxis dataKey="source" tick={{ fontSize: 11, fill: "var(--text-faint)" }} axisLine={false} tickLine={false} tickFormatter={(v) => v[0].toUpperCase() + v.slice(1)} />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-faint)" }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="applications" fill="var(--border)" radius={[4, 4, 0, 0]} name="Applications" />
          <Bar dataKey="replies" fill="var(--accent)" radius={[4, 4, 0, 0]} name="Replies" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function ConversionFunnelChart({ data }: { data: { stage: string; count: number }[] }) {
  const colors = ["#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe"];
  return (
    <Card className="p-5">
      <h3 className="text-[13.5px] font-semibold mb-4">Conversion Funnel</h3>
      <ResponsiveContainer width="100%" height={220}>
        <FunnelChart>
          <Tooltip contentStyle={tooltipStyle} />
          <Funnel dataKey="count" data={data} isAnimationActive>
            <LabelList position="right" fill="var(--text)" stroke="none" dataKey="stage" fontSize={12} />
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </Card>
  );
}
