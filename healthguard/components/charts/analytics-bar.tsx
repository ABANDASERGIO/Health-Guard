"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ClientChart } from "@/components/charts/client-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CHART_H = 220;

export function AnalyticsBarChart({
  title,
  data,
  dataKey,
}: {
  title: string;
  data: Record<string, string | number>[];
  dataKey: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <ClientChart height={CHART_H}>
          <ResponsiveContainer width="100%" height={CHART_H}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--muted)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted)" />
              <Tooltip
                cursor={{ fill: "color-mix(in oklab, var(--primary) 12%, transparent)" }}
                contentStyle={{
                  borderRadius: 12,
                  borderColor: "var(--border)",
                  background: "var(--card)",
                }}
              />
              <Bar dataKey={dataKey} fill="var(--primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ClientChart>
      </CardContent>
    </Card>
  );
}
