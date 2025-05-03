// Import the TailoringMode type from our new file
import type { TailoringMode } from "@/utils/ai/compile-tailoring-prompt"
import type { InterviewType, InterviewQuestion, InterviewAnswer } from "@/lib/actions/interview-actions"

export interface Resume {
  id: string
  userId: string
  resumeText: string
  modifiedResume?: string | null
  jobDescription: string
  atsScore?: number | null
  jdScore?: number | null
  version: number
  tailoringMode?: string
  isSaved?: boolean
  label?: string | null
  goldenPassed?: boolean
  isRefinement?: boolean
  wasManuallyEdited?: boolean
  scoresStale?: boolean
  originalResumeId?: string | null
  createdAt: string
  updatedAt: string
  tailoringAttempts?: TailoringAttempt[]
  coverLetters?: CoverLetter[]
  finalModifiedSections?: string | null
  atsWarnings?: string | null // JSON string of ATS warnings
  sectionRationales?: ResumeSectionRationale[]
  feedback?: ResumeFeedback[]
  isLiteTailored?: boolean // Flag to indicate if this resume was processed with Lite Tailoring
}

export interface CoverLetter {
  id: string
  userId: string
  resumeId: string
  jobDescription: string
  content: string
  tone: string
  atsScore?: number
  jdScore?: number
  version: number
  createdAt: string
  updatedAt: string
}

export interface LinkedInOptimization {
  id: string
  userId: string
  jobDescription: string
  originalAbout: string
  optimizedAbout: string
  tone: string
  createdAt: string
  updatedAt: string
}

export interface TailoringAttempt {
  id: string
  userId: string
  resumeId: string
  attemptNumber: number
  atsScore: number
  jdScore: number
  goldenPassed: boolean
  feedback: string
  suggestions: string
  atsFeedback?: string
  jdFeedback?: string
  createdAt: string
  modifiedSectionsSent?: string | null
  modifiedSectionsReceived?: string | null
  promptTokens?: number | null
  // Add the missing properties
  goldenRuleFeedback?: string | null
  iteration?: number | null
  modifiedSections?: string | null
  score?: number | null
}

export interface ManualEdit {
  id: string
  userId: string
  resumeId: string
  editedText: string
  createdAt: string
}

export interface ManualScoring {
  id: string
  userId: string
  resumeId: string
  atsScore: number
  jdScore: number
  atsFeedback?: string
  jdFeedback?: string
  createdAt: string
}

export interface TailoringProgress {
  status: string
  progress: number
  currentAttempt?: number
  maxAttempts?: number
}

export interface TailoringAnalytics {
  id: string
  userId: string
  resumeId: string
  tailoringMode: string
  iterations: number
  atsScore: number
  jdScore: number
  goldenPassed: boolean
  isRefinement: boolean
  createdAt: string
  modifiedSections?: string | null
}

export interface InterviewSession {
  id: string
  userId: string
  jobDescription: string
  selectedTypes: InterviewType[]
  questions: InterviewQuestion[]
  answers?: InterviewAnswer[]
  needsReview?: number[]
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  isPremium: boolean
  tailoringMode: string
  dailyBasicTailoringsUsed: number
  dailyPersonalizedTailoringsUsed: number
  dailyCoverLettersUsed: number
  dailyLinkedinOptimizationsUsed: number
  dailyInterviewSessionsUsed: number
  dailyResetDate?: Date
  analyticsTimeRange?: TimeRange
  analyticsViewMode?: "compact" | "detailed"
  createdAt: string
  updatedAt: string
  coverLetters?: CoverLetter[]
  linkedInOptimizations?: LinkedInOptimization[]
  interviewSessions?: InterviewSession[]
}

// New types for section tracking
export interface ResumeSectionRationale {
  id: string
  resumeId: string
  userId: string
  sectionName: string
  rationale: string
  createdAt: string
}

export interface ResumeFeedback {
  id: string
  resumeId: string
  userId: string
  feedbackType: string
  feedbackPoints: string[]
  sourceVersion?: number
  createdAt: string
}

export interface SectionModificationHistory {
  sectionName: string
  originalContent: string
  modifiedContent: string
  iteration: number
  changeReason: string
  confidence: "minimal" | "moderate" | "significant"
}

// Replace the existing TailoringMode type with:
export type { TailoringMode }
export type FeatureType =
  | "tailoring"
  | "cover_letter"
  | "linkedin"
  | "interview"
  | "analytics"
  | "dashboard"
  | "profile"
export type SubscriptionTier = "free" | "premium"

// Analytics types
export type TimeRange = "7days" | "30days" | "all"

// Interview types
export type { InterviewType, InterviewQuestion, InterviewAnswer }

// Analytics types
export interface ResumeStats {
  totalResumes: number
  refinedResumes: number
  goldenRulePassRate: number
  avgAtsScore: number
  avgJdScore: number
  mostUsedTailoringMode: string | null
  mostActiveTimeOfDay: string | null
  mostActiveDay: string | null
}

export interface CoverLetterStats {
  totalCoverLetters: number
  toneBreakdown: ChartDataPoint[]
  avgWordCount: number
  rewritesPerResume: number
}

export interface LinkedInStats {
  totalOptimizations: number
  mostUsedTone: string | null
  avgCharacterImprovement: number
  lastOptimization: {
    id: string
    tone: string
    createdAt: string
  } | null
}

export interface ChartDataPoint {
  name: string
  value: number
}

export interface ResumeScoreDataPoint {
  version: number
  atsScore: number
  jdScore: number
}

export interface GoldenRuleStats {
  passed: number
  failed: number
}

export interface TopPerformingResume {
  id: string
  version: number
  atsScore: number | null
  jdScore: number | null
  tailoringMode: string | null
  createdAt: string
}

export interface AnalyticsData {
  resumeStats: ResumeStats
  coverLetterStats: CoverLetterStats
  linkedInStats: LinkedInStats
  resumeIterationTrends: ResumeScoreDataPoint[][]
  tailoringModeUsage: ChartDataPoint[]
  goldenRuleStats: GoldenRuleStats
  topPerformingResumes: TopPerformingResume[]
  hasData: boolean
}

export interface ResumeMetadata {
  id: string
  userId: string
  resumeId: string
  contentSnippet: string
  tailoringMode: string
  iterations: number
  passedRules: boolean
  atsScore: number
  jdScore: number
  createdAt: string
  isLiteTailoring?: boolean // Flag to indicate if this metadata is from Lite Tailoring
}
