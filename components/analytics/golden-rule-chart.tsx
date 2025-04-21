"use client"

import { Skeleton } from "@/components/ui/skeleton"
import type { GoldenRuleStats } from "@/lib/types"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface GoldenRuleChartProps {
  data: GoldenRuleStats
  isLoading: boolean
}

export function GoldenRuleChart({ data, isLoading }: GoldenRuleChartProps) {
  // If loading, show skeleton
  if (isLoading) {
    return <Skeleton className="w-full h-[300px]" />
  }

  // If no data, show message
  if (data.passed === 0 && data.failed === 0) {
    return <div className="flex items-center justify-center h-[300px] text-gray-400">No golden rule data available</div>
  }

  // Format the data for the chart
  const chartData = [
    { name: "Passed", value: data.passed },
    { name: "Failed", value: data.failed },
  ]

  // Colors for the chart
  const COLORS = ["#10B981", "#F43F5E"]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} resumes`, ""]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
