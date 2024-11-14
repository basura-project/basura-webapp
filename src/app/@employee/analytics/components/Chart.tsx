"use client";

import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar"; // Shadcn's Calendar component
import { ChartContainer, ChartConfig } from "@/components/ui/chart"; // ChartContainer component from Shadcn

// Mock data fetching function
const fetchAnalyticsData = async () => {
  return {
    submissions: Array.from({ length: 90 }, (_, i) => ({
      date: `2024-06-${String((i % 30) + 1).padStart(2, "0")}`,
      count: Math.floor(Math.random() * 10) + 1,
    })),
    garbageSegregation: [
      { name: "E-Waste", value: 275 },
      { name: "Plastic", value: 200 },
      { name: "Cardboard", value: 187 },
      { name: "Fabric", value: 173 },
      { name: "Glass", value: 90 },
    ],
  };
};

// Color configuration for the charts
const COLORS = ["#e76e50", "#2a9d90", "#f4a462", "#e8c468", "#274754"];
const barChartConfig = {
  count: {
    label: "Submissions",
    color: "#2a9d90",
  },
} satisfies ChartConfig;

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<{
    submissions: any[];
    garbageSegregation: any[];
  }>({
    submissions: [],
    garbageSegregation: [],
  });
  const [selectedRange, setSelectedRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: new Date("2024-04-04"),
    end: new Date("2024-06-30"),
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchAnalyticsData();
      setAnalyticsData(data);
    };
    fetchData();
  }, []);

  const handleDateRangeChange = (range: {
    start: Date | null;
    end: Date | null;
  }) => {
    setSelectedRange(range);
  };

  return (
    <div className="space-y-2">
      <div className="text-2xl font-bold">Analytics</div>
      <div className="text-md text-gray-800 pt-0">
        Metrics for daily submissions, waste collected
      </div>
      <Separator className="my-4" />

      {/* Submissions Bar Chart */}
      <CardHeader className="flex flex-row justify-between px-0">
        <CardTitle className="flex items-start">Submissions</CardTitle>
        <div className="flex justify-between items-center">
          <div className="relative mr-2">
            <Button
              variant="outline"
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            >
              {selectedRange.start?.toLocaleDateString() || "Select Start Date"}{" "}
              - {selectedRange.end?.toLocaleDateString() || "Select End Date"}
            </Button>
            {isCalendarOpen && (
              <div className="absolute z-10 mt-2">
                <Calendar
                  className="bg-white shadow-md"
                  selected={
                    selectedRange.start && selectedRange.end
                      ? [selectedRange.start, selectedRange.end]
                      : undefined
                  }
                />
              </div>
            )}
          </div>
          <Button variant="default">Download</Button>
        </div>
      </CardHeader>
      <CardContent className="h-[200px] px-0">
        <ChartContainer
          config={barChartConfig}
          className="h-full w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={analyticsData.submissions}
              margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            >
              <XAxis dataKey="date" tickFormatter={(tick) => tick.slice(5)} minTickGap={10} />
              <YAxis domain={['dataMin','dataMax']} />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="var(--color-count)"
                radius={[0, 0, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      {/* Garbage Segregation Pie Chart */}
      <Card className="w-full shadow-none border-none p-0">
        <CardHeader className="flex flex-row justify-between px-0">
          <CardTitle>Garbage Segregation</CardTitle>
          <div className="flex justify-between items-center">
            <div className="relative mr-2">
                <Button
                variant="outline"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                >
                {selectedRange.start?.toLocaleDateString() || "Select Start Date"}{" "}
                - {selectedRange.end?.toLocaleDateString() || "Select End Date"}
                </Button>
                {isCalendarOpen && (
                <div className="absolute z-10 mt-2">
                    <Calendar
                    className="bg-white shadow-md"
                    selected={
                        selectedRange.start && selectedRange.end
                        ? [selectedRange.start, selectedRange.end]
                        : undefined
                    }
                    />
                </div>
                )}
            </div>
            <Button variant="default">Download</Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          <ChartContainer config={barChartConfig} className="w-[50%] h-[350px]">
            <PieChart>
              <Pie
                data={analyticsData.garbageSegregation}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                label
              >
                {analyticsData.garbageSegregation.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ChartContainer>
          <div className="flex items-center justify-center mt-4">
            {analyticsData.garbageSegregation.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-center mx-2">
                <div
                  className="w-3 h-3 rounded-full mr-1"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm">{entry.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
