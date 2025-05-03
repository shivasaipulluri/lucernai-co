import { createContext } from "react"
import type { ResumeData, ResumeSection, ResumeStyle, ResumeVersion } from "@/types/resume"

export interface ResumeContextType {
  resumeData: ResumeData
  activeSection: string | null
  setActiveSection: (section: string | null) => void
  updateSection: (sectionId: string, content: Partial<ResumeSection>) => void
  addSection: (section: ResumeSection) => void
  removeSection: (sectionId: string) => void
  reorderSections: (startIndex: number, endIndex: number) => void
  updateResumeStyle: (style: Partial<ResumeStyle>) => void
  saveResume: () => void
  loadResume: (id: string) => void
  exportToPdf: () => void
  exportToWord: () => void
  exportToText: () => void
  isDirty: boolean
  versions: ResumeVersion[]
  currentVersionId: string
  createVersion: (name: string) => void
  switchVersion: (versionId: string) => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  aiSuggest: (sectionId: string, prompt: string) => Promise<string>
  analyzeResume: () => Promise<{ score: number; feedback: string[] }>
}

export const ResumeContext = createContext<ResumeContextType>({
  resumeData: {
    id: "",
    title: "Untitled Resume",
    sections: [],
    style: {
      fontFamily: "Inter",
      fontSize: "medium",
      color: "blue",
      spacing: "normal",
      theme: "light",
    },
  },
  activeSection: null,
  setActiveSection: () => {},
  updateSection: () => {},
  addSection: () => {},
  removeSection: () => {},
  reorderSections: () => {},
  updateResumeStyle: () => {},
  saveResume: () => {},
  loadResume: () => {},
  exportToPdf: () => {},
  exportToWord: () => {},
  exportToText: () => {},
  isDirty: false,
  versions: [],
  currentVersionId: "",
  createVersion: () => {},
  switchVersion: () => {},
  undo: () => {},
  redo: () => {},
  canUndo: false,
  canRedo: false,
  aiSuggest: async () => "",
  analyzeResume: async () => ({ score: 0, feedback: [] }),
})
