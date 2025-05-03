"use client"

import { useState } from "react"
import type { ResumeItem } from "@/types/resume"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Trash2, Plus } from "lucide-react"
import { format } from "date-fns"

interface ItemEditorProps {
  item: ResumeItem
  index: number
  onUpdate: (updatedItem: Partial<ResumeItem>) => void
  onRemove: () => void
}

export function ItemEditor({ item, index, onUpdate, onRemove }: ItemEditorProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [startDateOpen, setStartDateOpen] = useState(false)
  const [endDateOpen, setEndDateOpen] = useState(false)

  const handleBulletChange = (index: number, value: string) => {
    const newBullets = [...(item.bullets || [])]
    newBullets[index] = value
    onUpdate({ bullets: newBullets })
  }

  const handleAddBullet = () => {
    const newBullets = [...(item.bullets || []), ""]
    onUpdate({ bullets: newBullets })
  }

  const handleRemoveBullet = (index: number) => {
    const newBullets = [...(item.bullets || [])]
    newBullets.splice(index, 1)
    onUpdate({ bullets: newBullets })
  }

  const handleStartDateChange = (date: Date | undefined) => {
    if (!date) return

    const formattedDate = format(date, "yyyy-MM")
    onUpdate({ startDate: formattedDate })
    setStartDateOpen(false)
  }

  const handleEndDateChange = (date: Date | undefined) => {
    if (!date) return

    const formattedDate = format(date, "yyyy-MM")
    onUpdate({ endDate: formattedDate })
    setEndDateOpen(false)
  }

  const handleCurrentToggle = (checked: boolean) => {
    onUpdate({
      current: checked,
      endDate: checked ? "" : item.endDate,
    })
  }

  const formatDisplayDate = (dateString?: string) => {
    if (!dateString) return "Select date"

    try {
      const [year, month] = dateString.split("-")
      return `${year}-${month}`
    } catch (e) {
      return dateString
    }
  }

  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 hover:shadow-sm transition-all duration-200 group">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-medium text-sm text-primary dark:text-gray-300 flex items-center">
          <span className="w-1 h-1 rounded-full bg-accent mr-2"></span>
          Item {index + 1}
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-8 w-8 p-0 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove</span>
        </Button>
      </div>

      <div className="space-y-4">
        {/* Title and Organization in one row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`item-title-${item.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </Label>
            <Input
              id={`item-title-${item.id}`}
              value={item.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="border-gray-300 focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="e.g. Software Engineer"
            />
            {!item.title && (
              <p className="text-xs text-red-500 mt-1 flex items-center">
                <span className="w-1 h-1 rounded-full bg-red-500 mr-1"></span>
                Required field
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor={`item-org-${item.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Organization
            </Label>
            <Input
              id={`item-org-${item.id}`}
              value={item.organization || ""}
              onChange={(e) => onUpdate({ organization: e.target.value })}
              className="border-gray-300 focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="e.g. Acme Inc."
            />
          </div>
        </div>

        {/* Dates and Location in one row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`item-start-${item.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Start Date
            </Label>
            <Input
              id={`item-start-${item.id}`}
              type="month"
              value={item.startDate || ""}
              onChange={(e) => onUpdate({ startDate: e.target.value })}
              className="border-gray-300 focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={`item-end-${item.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                End Date
              </Label>
              <div className="flex items-center space-x-1">
                <input
                  type="checkbox"
                  id={`item-current-${item.id}`}
                  checked={item.current || false}
                  onChange={(e) => onUpdate({ current: e.target.checked })}
                  className="rounded border-gray-300 text-accent focus:ring-accent"
                />
                <Label htmlFor={`item-current-${item.id}`} className="text-xs text-gray-600 dark:text-gray-400">
                  Current
                </Label>
              </div>
            </div>
            <Input
              id={`item-end-${item.id}`}
              type="month"
              value={item.endDate || ""}
              onChange={(e) => onUpdate({ endDate: e.target.value })}
              disabled={item.current}
              className={`border-gray-300 focus:border-accent focus:ring-1 focus:ring-accent transition-colors ${
                item.current ? "bg-gray-100 text-gray-500" : ""
              }`}
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor={`item-location-${item.id}`}
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Location
            </Label>
            <Input
              id={`item-location-${item.id}`}
              value={item.location || ""}
              onChange={(e) => onUpdate({ location: e.target.value })}
              className="border-gray-300 focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              placeholder="e.g. New York, NY"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={`item-desc-${item.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </Label>
          <Textarea
            id={`item-desc-${item.id}`}
            value={item.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="min-h-[100px] border-gray-300 focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            placeholder="Brief description of your role and responsibilities"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bullet Points</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const bullets = [...(item.bullets || []), ""]
                onUpdate({ bullets })
              }}
              className="h-8 text-xs text-accent hover:bg-accent/10 hover:text-accent/80"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Bullet
            </Button>
          </div>

          {(item.bullets || []).length === 0 ? (
            <div className="text-center p-4 border rounded-md border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <p className="text-sm text-muted-foreground">No bullet points yet</p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const bullets = [""]
                  onUpdate({ bullets })
                }}
                className="mt-2 h-8 text-xs text-accent hover:bg-accent/10"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Bullet
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {(item.bullets || []).map((bullet, idx) => (
                <div key={idx} className="flex items-center space-x-2 group/bullet">
                  <div className="w-4 h-4 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                  </div>
                  <Input
                    value={bullet}
                    onChange={(e) => {
                      const bullets = [...(item.bullets || [])]
                      bullets[idx] = e.target.value
                      onUpdate({ bullets })
                    }}
                    className="flex-1 border-gray-300 focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                    placeholder="Add an achievement or responsibility"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const bullets = [...(item.bullets || [])]
                      bullets.splice(idx, 1)
                      onUpdate({ bullets })
                    }}
                    className="h-8 w-8 p-0 opacity-0 group-hover/bullet:opacity-100 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
