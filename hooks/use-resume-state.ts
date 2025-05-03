"use client"

import { useState, useEffect, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import type { ResumeData, ResumeSection, ResumeStyle, ResumeVersion, HistoryState } from "@/types/resume"
import { defaultResumeData } from "@/data/default-resume"
import { generatePdf } from "@/lib/pdf-generator"
import { generateDocx } from "@/lib/docx-generator"
import { generateTxt } from "@/lib/txt-generator"
import { useAIAssistant } from "./use-ai-assistant"

export function useResumeState(userId: string) {
  // Initialize with default data or load from localStorage
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: { ...defaultResumeData },
    future: [],
  })
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [versions, setVersions] = useState<ResumeVersion[]>([])
  const [currentVersionId, setCurrentVersionId] = useState<string>(defaultResumeData.id)

  const { suggestContent, analyzeResume } = useAIAssistant()

  // Load saved data on initial render
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("resumeHistory")
      const savedVersions = localStorage.getItem("resumeVersions")
      const currentVersion = localStorage.getItem("currentVersionId")

      if (savedHistory) {
        setHistory(JSON.parse(savedHistory))
      } else {
        // If no history, create initial version
        const initialVersion: ResumeVersion = {
          id: defaultResumeData.id,
          name: "Main Version",
          createdAt: new Date(),
          resumeData: defaultResumeData,
        }
        setVersions([initialVersion])
      }

      if (savedVersions) {
        setVersions(JSON.parse(savedVersions))
      }

      if (currentVersion) {
        setCurrentVersionId(currentVersion)
      }
    } catch (error) {
      console.error("Error loading resume data:", error)
    }
  }, [])

  // Save to localStorage whenever history changes
  useEffect(() => {
    if (isDirty) {
      localStorage.setItem("resumeHistory", JSON.stringify(history))
      localStorage.setItem("resumeVersions", JSON.stringify(versions))
      localStorage.setItem("currentVersionId", currentVersionId)
    }
  }, [history, versions, currentVersionId, isDirty])

  // Helper to update history
  const updateHistory = useCallback((newPresent: ResumeData) => {
    setHistory((prev) => ({
      past: [...prev.past, prev.present],
      present: newPresent,
      future: [],
    }))
    setIsDirty(true)
  }, [])

  // Update a section
  const updateSection = useCallback(
    (sectionId: string, content: Partial<ResumeSection>) => {
      const newPresent = { ...history.present }
      const sectionIndex = newPresent.sections.findIndex((s) => s.id === sectionId)

      if (sectionIndex !== -1) {
        newPresent.sections[sectionIndex] = {
          ...newPresent.sections[sectionIndex],
          ...content,
        }
        updateHistory(newPresent)
      }
    },
    [history, updateHistory],
  )

  // Add a new section
  const addSection = useCallback(
    (section: ResumeSection) => {
      const newPresent = { ...history.present }
      newPresent.sections.push({
        ...section,
        id: section.id || uuidv4(),
        order: newPresent.sections.length,
      })
      updateHistory(newPresent)
    },
    [history, updateHistory],
  )

  // Remove a section
  const removeSection = useCallback(
    (sectionId: string) => {
      const newPresent = { ...history.present }
      newPresent.sections = newPresent.sections.filter((s) => s.id !== sectionId)
      // Update order of remaining sections
      newPresent.sections = newPresent.sections.map((s, index) => ({
        ...s,
        order: index,
      }))
      updateHistory(newPresent)
    },
    [history, updateHistory],
  )

  // Reorder sections
  const reorderSections = useCallback(
    (startIndex: number, endIndex: number) => {
      const newPresent = { ...history.present }
      const [removed] = newPresent.sections.splice(startIndex, 1)
      newPresent.sections.splice(endIndex, 0, removed)

      // Update order property
      newPresent.sections = newPresent.sections.map((section, index) => ({
        ...section,
        order: index,
      }))

      updateHistory(newPresent)
    },
    [history, updateHistory],
  )

  // Update resume style
  const updateResumeStyle = useCallback(
    (style: Partial<ResumeStyle>) => {
      const newPresent = { ...history.present }
      newPresent.style = {
        ...newPresent.style,
        ...style,
      }
      updateHistory(newPresent)
    },
    [history, updateHistory],
  )

  // Save resume
  const saveResume = useCallback(() => {
    // Update the current version with the latest data
    setVersions((prev) => {
      const updatedVersions = prev.map((version) =>
        version.id === currentVersionId ? { ...version, resumeData: history.present } : version,
      )
      localStorage.setItem("resumeVersions", JSON.stringify(updatedVersions))
      return updatedVersions
    })

    setIsDirty(false)
  }, [history.present, currentVersionId])

  // Load a specific resume
  const loadResume = useCallback(
    (id: string) => {
      const version = versions.find((v) => v.id === id)
      if (version) {
        setHistory({
          past: [],
          present: version.resumeData,
          future: [],
        })
        setCurrentVersionId(id)
        setIsDirty(false)
      }
    },
    [versions],
  )

  // Export to PDF
  const exportToPdf = useCallback(() => {
    return generatePdf(history.present)
  }, [history.present])

  // Export to Word
  const exportToWord = useCallback(() => {
    return generateDocx(history.present)
  }, [history.present])

  // Export to Text
  const exportToText = useCallback(() => {
    return generateTxt(history.present)
  }, [history.present])

  // Create a new version
  const createVersion = useCallback(
    (name: string) => {
      const newVersion: ResumeVersion = {
        id: uuidv4(),
        name,
        createdAt: new Date(),
        resumeData: { ...history.present },
      }

      setVersions((prev) => [...prev, newVersion])
      setCurrentVersionId(newVersion.id)
      setIsDirty(false)
    },
    [history.present],
  )

  // Switch to a different version
  const switchVersion = useCallback(
    (versionId: string) => {
      const version = versions.find((v) => v.id === versionId)
      if (version) {
        setHistory({
          past: [],
          present: version.resumeData,
          future: [],
        })
        setCurrentVersionId(versionId)
        setIsDirty(false)
      }
    },
    [versions],
  )

  // Undo
  const undo = useCallback(() => {
    if (history.past.length === 0) return

    const previous = history.past[history.past.length - 1]
    const newPast = history.past.slice(0, history.past.length - 1)

    setHistory({
      past: newPast,
      present: previous,
      future: [history.present, ...history.future],
    })
    setIsDirty(true)
  }, [history])

  // Redo
  const redo = useCallback(() => {
    if (history.future.length === 0) return

    const next = history.future[0]
    const newFuture = history.future.slice(1)

    setHistory({
      past: [...history.past, history.present],
      present: next,
      future: newFuture,
    })
    setIsDirty(true)
  }, [history])

  // AI suggest content
  const aiSuggest = useCallback(
    async (sectionId: string, prompt: string) => {
      const section = history.present.sections.find((s) => s.id === sectionId)
      if (!section) return ""

      const suggestion = await suggestContent(section.type, prompt, history.present.jobTarget)
      return suggestion
    },
    [history.present, suggestContent],
  )

  // Analyze resume
  const analyzeResumeData = useCallback(async () => {
    return await analyzeResume(history.present)
  }, [history.present, analyzeResume])

  return {
    resumeData: history.present,
    activeSection,
    setActiveSection,
    updateSection,
    addSection,
    removeSection,
    reorderSections,
    updateResumeStyle,
    saveResume,
    loadResume,
    exportToPdf,
    exportToWord,
    exportToText,
    isDirty,
    versions,
    currentVersionId,
    createVersion,
    switchVersion,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    aiSuggest,
    analyzeResume: analyzeResumeData,
  }
}
