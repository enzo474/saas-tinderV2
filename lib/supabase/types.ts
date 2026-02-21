export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      analyses: {
        Row: {
          id: string
          user_id: string
          status: 'draft' | 'complete' | 'paid'
          
          // Onboarding partie 1
          current_matches: string | null
          tinder_seniority: string | null
          selfie_url: string | null
          
          // Métriques calculées
          visual_potential: number | null
          current_exploitation: number | null
          inexploited_percent: number | null
          
          // Onboarding partie 2
          target_matches: string | null
          photos_urls: string[] | null
          current_bio: string | null
          relationship_goal: string | null
          target_women: string[] | null
          height: number | null
          job: string | null
          sport: string | null
          lifestyle: string[] | null
          vibe: string[] | null
          anecdotes: string[] | null
          passions: string[] | null
          
          // Scores calculés
          photo_score: number | null
          bio_score: number | null
          coherence_score: number | null
          total_score: number | null
          positioning_percent: number | null
          
          // Résultat Claude
          full_plan: Json | null
          
          // Paiement
          stripe_session_id: string | null
          product_type: string | null
          paid_at: string | null
          
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'draft' | 'complete' | 'paid'
          current_matches?: string | null
          tinder_seniority?: string | null
          selfie_url?: string | null
          visual_potential?: number | null
          current_exploitation?: number | null
          inexploited_percent?: number | null
          target_matches?: string | null
          photos_urls?: string[] | null
          current_bio?: string | null
          relationship_goal?: string | null
          target_women?: string[] | null
          height?: number | null
          job?: string | null
          sport?: string | null
          lifestyle?: string[] | null
          vibe?: string[] | null
          anecdotes?: string[] | null
          passions?: string[] | null
          photo_score?: number | null
          bio_score?: number | null
          coherence_score?: number | null
          total_score?: number | null
          positioning_percent?: number | null
          full_plan?: Json | null
          stripe_session_id?: string | null
          product_type?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'draft' | 'complete' | 'paid'
          current_matches?: string | null
          tinder_seniority?: string | null
          selfie_url?: string | null
          visual_potential?: number | null
          current_exploitation?: number | null
          inexploited_percent?: number | null
          target_matches?: string | null
          photos_urls?: string[] | null
          current_bio?: string | null
          relationship_goal?: string | null
          target_women?: string[] | null
          height?: number | null
          job?: string | null
          sport?: string | null
          lifestyle?: string[] | null
          vibe?: string[] | null
          anecdotes?: string[] | null
          passions?: string[] | null
          photo_score?: number | null
          bio_score?: number | null
          coherence_score?: number | null
          total_score?: number | null
          positioning_percent?: number | null
          full_plan?: Json | null
          stripe_session_id?: string | null
          product_type?: string | null
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
