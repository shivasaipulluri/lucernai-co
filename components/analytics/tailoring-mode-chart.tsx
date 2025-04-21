"use client"

import { Skeleton } from "@/components/ui/skeleton"
import type { ChartDataPoint } from "@/lib/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface TailoringModeChartProps {
  data: ChartDataPoint[]
  isLoading: boolean
  showLabels?: boolean
}

export function TailoringModeChart({ data, isLoading, showLabels = false }: TailoringModeChartProps) {
  // Colors for different tailoring modes
  const colors = {
    basic: "#94A3B8",
    personalized: "#3B82F6",
    aggressive: "#EC4899",
    default: "#CBD5E1",
  }

  // If loading, show skeleton
  if (isLoading) {
    return <Skeleton className="w-full h-[300px]" />
  }

  // If no data, show message
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-400">No tailoring mode data available</div>
    )
  }

  // Format mode name for display
  const formatModeName = (name: string) => {
    switch (name) {
      case "basic":
        return "Basic"
      case "personalized":
        return "Personalized"
      case "aggressive":
        return "Aggressive"
      default:
        return name.charAt(0).toUpperCase() + name.slice(1)
    }
  }

  // Format the data for the chart
  const chartData = data.map((item) => ({
    ...item,
    name: formatModeName(item.name),
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value) => [`${value} resumes`, ""]} labelFormatter={(value) => `${value} Mode`} />
        <Bar dataKey="value" name="Resumes">
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors[entry.name.toLowerCase() as keyof typeof colors] || colors.default}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
