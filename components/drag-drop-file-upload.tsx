"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, File, X, FileText, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist"

// Set the worker source
if (typeof window !== "undefined") {
  GlobalWorkerOptions.workerSrc = "/pdf-worker/pdf.worker.mjs"
}

interface DragDropFileUploadProps {
  onFileProcessed: (text: string) => void
  onFileProcessing?: (isProcessing: boolean) => void
  className?: string
  maxSizeMB?: number
  acceptedFileTypes?: string[]
}

export function DragDropFileUpload({
  onFileProcessed,
  onFileProcessing,
  className = "",
  maxSizeMB = 5,
  acceptedFileTypes = [".txt", ".pdf", ".docx", ".doc"],
}: DragDropFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set dragging to false if we're leaving the drop zone (not a child element)
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setError(null)

    const files = e.dataTransfer.files
    if (files.length) {
      processFile(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const files = e.target.files
    if (files && files.length) {
      processFile(files[0])
    }
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent form submission
    e.stopPropagation() // Stop event propagation
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Process the file based on its type
  const processFile = async (file: File) => {
    // Check file type
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || ""
    const validExtensions = ["txt", "pdf", "docx", "doc"]

    if (!validExtensions.includes(fileExtension)) {
      setError(`Invalid file type. Please upload ${acceptedFileTypes.join(", ")} files.`)
      return
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setError(`File size should be less than ${maxSizeMB}MB`)
      return
    }

    // Set file info
    setFileName(file.name)
    setFileSize(formatFileSize(file.size))

    // Start processing
    setIsProcessing(true)
    setProcessingProgress(10)
    if (onFileProcessing) onFileProcessing(true)

    try {
      let text = ""

      if (fileExtension === "pdf") {
        text = await extractTextFromPdf(file, (progress) => {
          setProcessingProgress(10 + progress * 80) // Scale progress from 10% to 90%
        })
      } else if (fileExtension === "docx" || fileExtension === "doc") {
        text = await extractTextFromDocx(file)
      } else {
        // For text files, use FileReader
        text = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.onerror = () => reject(new Error("Error reading file"))
          reader.readAsText(file)
        })
      }

      // Final processing
      setProcessingProgress(100)
      setTimeout(() => {
        setIsProcessing(false)
        setProcessingProgress(0)
        if (onFileProcessing) onFileProcessing(false)
        onFileProcessed(text)
      }, 500) // Small delay to show 100% progress
    } catch (err) {
      console.error("Error processing file:", err)
      setError(`Error reading file: ${err instanceof Error ? err.message : "Unknown error"}`)
      setIsProcessing(false)
      setProcessingProgress(0)
      if (onFileProcessing) onFileProcessing(false)
    }
  }

  // Extract text from PDF using pdf.js
  const extractTextFromPdf = async (file: File, progressCallback: (progress: number) => void): Promise<string> => {
    try {
      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()

      // Load the PDF document
      const loadingTask = getDocument({ data: arrayBuffer })

      // Set up progress monitoring
      interface PDFProgressData {
        loaded: number
        total: number
      }

      loadingTask.onProgress = (progressData: PDFProgressData) => {
        if (progressData.total > 0) {
          const progress = progressData.loaded / progressData.total
          progressCallback(progress * 0.5) // First half of progress is loading the PDF
        }
      }

      const pdf = await loadingTask.promise
      const numPages = pdf.numPages
      let extractedText = ""

      // Extract text from each page
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items.map((item: any) => item.str).join(" ")

        extractedText += pageText + "\n\n"

        // Update progress for text extraction (second half of progress)
        progressCallback(0.5 + (i / numPages) * 0.5)
      }

      return extractedText.trim()
    } catch (error) {
      console.error("PDF extraction error:", error)
      throw new Error("Failed to extract text from PDF")
    }
  }

  // Extract text from DOCX
  const extractTextFromDocx = async (file: File): Promise<string> => {
    try {
      // Create a FormData object to send the file to the server
      const formData = new FormData()
      formData.append("file", file)

      // Send the file to the server for processing
      const response = await fetch("/api/extract-docx", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return result.text
    } catch (error) {
      console.error("DOCX extraction error:", error)
      throw new Error("Failed to extract text from DOCX. Please try a PDF or TXT file instead.")
    }
  }

  const clearFile = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent form submission
    e.stopPropagation() // Stop event propagation
    setFileName(null)
    setFileSize(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onFileProcessed("")
  }

  return (
    <div className={className}>
      <div
        ref={dropZoneRef}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <FileText className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <p className="text-sm font-medium">Processing {fileName}...</p>
            <Progress value={processingProgress} className="h-2 w-full max-w-xs mx-auto" />
          </div>
        ) : fileName ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-2">
              <File className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{fileName}</span>
              <Button type="button" variant="ghost" size="sm" onClick={clearFile} className="h-6 w-6 p-0 rounded-full">
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </div>
            {fileSize && <span className="text-xs text-gray-500">{fileSize}</span>}
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Drag and drop your resume file here</p>
            <p className="text-xs text-gray-500 mb-3">
              Supports {acceptedFileTypes.join(", ")} files up to {maxSizeMB}MB
            </p>
            <Button type="button" variant="outline" size="sm" onClick={handleButtonClick}>
              Browse Files
            </Button>
          </>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-2 mt-2 text-sm text-red-500">
          <AlertTriangle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFileTypes.join(",")}
        className="hidden"
        onChange={handleFileInputChange}
      />
    </div>
  )
}
