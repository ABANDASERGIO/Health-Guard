"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ClientChart } from "@/components/charts/client-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CHART_H = 260;

export function VitalsTrendChart({
  data,
}: {
  data: { date: string; systolic: number; diastolic: number; hr?: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Blood pressure trend</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <ClientChart height={CHART_H}>
          <ResponsiveContainer width="100%" height={CHART_H}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="sys" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dia" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted)" domain={[60, "auto"]} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  borderColor: "var(--border)",
                  background: "var(--card)",
                }}
              />
              <Area
                type="monotone"
                dataKey="systolic"
                stroke="#0f766e"
                fillOpacity={1}
                fill="url(#sys)"
                name="Systolic"
              />
              <Area
                type="monotone"
                dataKey="diastolic"
                stroke="#2563eb"
                fillOpacity={1}
                fill="url(#dia)"
                name="Diastolic"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ClientChart>
      </CardContent>
    </Card>
  );
}
