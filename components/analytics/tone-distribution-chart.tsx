"use client"

import { Skeleton } from "@/components/ui/skeleton"
import type { ChartDataPoint } from "@/lib/types"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface ToneDistributionChartProps {
  data: ChartDataPoint[]
  isLoading: boolean
}

export function ToneDistributionChart({ data, isLoading }: ToneDistributionChartProps) {
  // Colors for different tones
  const COLORS = ["#3B82F6", "#EC4899", "#10B981", "#F59E0B"]

  // If loading, show skeleton
  if (isLoading) {
    return <Skeleton className="w-full h-[300px]" />
  }

  // If no data, show message
  if (data.length === 0) {
    return <div className="flex items-center justify-center h-[300px] text-gray-400">No tone data available</div>
  }

  // Format tone name for display
  const formatToneName = (name: string) => {
    switch (name) {
      case "professional":
        return "Professional"
      case "enthusiastic":
        return "Enthusiastic"
      case "confident":
        return "Confident"
      case "conversational":
        return "Conversational"
      default:
        return name.charAt(0).toUpperCase() + name.slice(1)
    }
  }

  // Format the data for the chart
  const chartData = data.map((item) => ({
    ...item,
    name: formatToneName(item.name),
  }))

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
        <Tooltip formatter={(value) => [`${value} cover letters`, ""]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
