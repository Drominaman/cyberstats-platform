import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export type Database = {
  public: {
    Tables: {
      cyberstats_feed: {
        Row: {
          id: number
          title: string
          link: string
          publisher: string
          source_name: string
          published_on: string
          created_at: string
          tag1?: string
          tag2?: string
          tag3?: string
          tag4?: string
          tag5?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name?: string
          company?: string
          role?: string
          team_id?: string
          created_at: string
        }
      }
      collections: {
        Row: {
          id: string
          user_id: string
          team_id?: string
          name: string
          description?: string
          stat_ids: number[]
          is_public: boolean
          created_at: string
        }
      }
    }
  }
}
