export interface ResumeData {
  id: string
  title: string
  sections: ResumeSection[]
  style: ResumeStyle
  jobTarget?: string
}

export interface ResumeSection {
  id: string
  type: ResumeSectionType
  title: string
  content: string | ResumeItem[]
  isVisible: boolean
  order: number
}

export type ResumeSectionType =
  | "contact"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "awards"
  | "languages"
  | "interests"
  | "references"
  | "custom"

export interface ResumeItem {
  id: string
  title: string
  organization?: string
  location?: string
  startDate?: string
  endDate?: string
  current?: boolean
  description: string
  bullets?: string[]
}

export interface ResumeStyle {
  // Basic styling
  fontFamily: string
  fontSize: "small" | "medium" | "large"
  color: string
  spacing: "compact" | "normal" | "spacious"
  theme: "light" | "dark" | "professional" | "creative" | "minimal"

  // Advanced styling
  lineHeight?: "tight" | "normal" | "relaxed"
  headingStyle?: "normal" | "uppercase" | "capitalize"
  headingSize?: "small" | "medium" | "large"
  dividerStyle?: "line" | "dots" | "none"
  bulletStyle?: "disc" | "circle" | "square"

  // Layout options
  dateFormat?: "MM/YYYY" | "YYYY-MM" | "MMM YYYY"
  dateAlignment?: "left" | "right" | "inline"
  headerAlignment?: "left" | "center" | "right"
  nameStyle?: "normal" | "uppercase" | "bold"
  nameSize?: "small" | "medium" | "large"

  // Contact and photo settings
  contactLayout?: "inline" | "stacked" | "minimal"
  showContactIcons?: boolean
  includePhoto?: boolean
  photoShape?: "circle" | "square" | "rounded"
  photoSize?: "small" | "medium" | "large"
  photoPosition?: "left" | "right" | "center"

  // Footer and additional settings
  includeFooter?: boolean
  showContactInFooter?: boolean
  showSocialLinks?: boolean
  footerStyle?: "minimal" | "full"

  // Section-specific styling
  skillsDisplayStyle?: "badges" | "bars"
  skillsLabelStyle?: "inline" | "block"
  showSkillLevel?: boolean
  languagesDisplayStyle?: "badges" | "bars"
  showProficiencyLevel?: boolean
  interestsLayout?: "inline" | "list"
  certificatesLayout?: "inline" | "block"
  showCertificateDate?: boolean
  educationLayout?: "grouped" | "flat"
  showGPA?: boolean
  showCourses?: boolean
  showDividers?: boolean
  showResponsibilities?: boolean
  showDeclaration?: boolean
  declarationFormat?: "simple" | "detailed"
}

export interface ResumeVersion {
  id: string
  name: string
  createdAt: Date
  resumeData: ResumeData
}

export interface HistoryState {
  past: ResumeData[]
  present: ResumeData
  future: ResumeData[]
}

export interface ResumeAnalysis {
  score: number
  feedback: string[]
  jobMatch?: number
  improvementSuggestions?: string[]
  keywordsMissing?: string[]
}
