"use client"

import type { ResumeSection } from "@/types/resume"
import { Button } from "@/components/ui/button"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { GripVertical, Eye, EyeOff } from "lucide-react"
import { useContext } from "react"
import { ResumeContext } from "@/context/resume-context"

interface SectionListProps {
  sections: ResumeSection[]
  activeSection: string | null
  onSectionSelect: (sectionId: string | null) => void
}

export function SectionList({ sections, activeSection, onSectionSelect }: SectionListProps) {
  const { reorderSections, updateSection } = useContext(ResumeContext)

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination } = result
    reorderSections(source.index, destination.index)
  }

  const toggleSectionVisibility = (sectionId: string, isVisible: boolean) => {
    updateSection(sectionId, { isVisible: !isVisible })
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="sections">
        {(provided: any) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
            {sections.map((section, index) => (
              <Draggable key={section.id} draggableId={section.id} index={index}>
                {(provided: any) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`flex items-center justify-between p-2 rounded-md border ${
                      activeSection === section.id
                        ? "bg-primary/10 border-primary/30"
                        : "bg-background hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center flex-1">
                      <div {...provided.dragHandleProps} className="mr-2 cursor-grab">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <Button
                        variant="ghost"
                        className="justify-start px-2 flex-1 h-auto py-1 font-normal"
                        onClick={() => onSectionSelect(section.id)}
                      >
                        {section.title}
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleSectionVisibility(section.id, section.isVisible)}
                    >
                      {section.isVisible ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
