export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          is_premium: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          is_premium?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          is_premium?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      resumes: {
        Row: {
          id: string
          user_id: string
          resume_text: string
          job_description: string
          modified_resume: string | null
          tailoring_mode: string
          version: number
          ats_score: number | null
          jd_score: number | null
          golden_passed: boolean
          is_refinement: boolean
          is_saved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resume_text: string
          job_description: string
          modified_resume?: string | null
          tailoring_mode: string
          version?: number
          ats_score?: number | null
          jd_score?: number | null
          golden_passed?: boolean
          is_refinement?: boolean
          is_saved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resume_text?: string
          job_description?: string
          modified_resume?: string | null
          tailoring_mode?: string
          version?: number
          ats_score?: number | null
          jd_score?: number | null
          golden_passed?: boolean
          is_refinement?: boolean
          is_saved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
