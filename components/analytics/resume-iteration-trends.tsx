"use client"

import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import type { ResumeScoreDataPoint } from "@/lib/types"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ResumeIterationTrendsProps {
  data: ResumeScoreDataPoint[][]
  isLoading: boolean
  showLegend?: boolean
}

export function ResumeIterationTrends({ data, isLoading, showLegend = false }: ResumeIterationTrendsProps) {
  const [selectedLineage, setSelectedLineage] = useState<number>(0)

  // If no data or loading, show placeholder
  if (isLoading) {
    return <Skeleton className="w-full h-[300px]" />
  }

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-[300px] text-gray-400">No iteration data available</div>
  }

  // Handle lineage selection
  const handleLineageChange = (index: number) => {
    setSelectedLineage(index)
  }

  // Format the data for the chart
  const chartData = data[selectedLineage]

  return (
    <div className="space-y-4">
      {data.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {data.map((lineage, index) => (
            <button
              key={index}
              onClick={() => handleLineageChange(index)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedLineage === index ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Resume {index + 1}
            </button>
          ))}
        </div>
      )}

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="version" label={{ value: "Version", position: "insideBottomRight", offset: -10 }} />
          <YAxis domain={[0, 100]} />
          <Tooltip formatter={(value) => [`${value}%`, ""]} labelFormatter={(value) => `Version ${value}`} />
          {showLegend && <Legend />}
          <Line
            type="monotone"
            dataKey="atsScore"
            name="ATS Score"
            stroke="#3B82F6"
            strokeWidth={2}
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="jdScore"
            name="JD Score"
            stroke="#10B981"
            strokeWidth={2}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
