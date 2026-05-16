export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      account_members: {
        Row: {
          account_id: string
          created_at: string
          invited_at: string | null
          joined_at: string | null
          role: Database["public"]["Enums"]["account_role"]
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          invited_at?: string | null
          joined_at?: string | null
          role: Database["public"]["Enums"]["account_role"]
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          invited_at?: string | null
          joined_at?: string | null
          role?: Database["public"]["Enums"]["account_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_members_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          address_line1: string
          address_line2: string | null
          billing_address: Json
          billing_email: string | null
          billing_legal_name: string | null
          billing_tax_id: string | null
          city: string
          contact_email: string
          contact_phone: string
          country_code: string
          created_at: string
          display_name: string
          id: string
          owner_user_id: string
          postal_code: string | null
          region: string | null
          type: Database["public"]["Enums"]["account_type"]
          updated_at: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          billing_address: Json
          billing_email?: string | null
          billing_legal_name?: string | null
          billing_tax_id?: string | null
          city: string
          contact_email: string
          contact_phone: string
          country_code: string
          created_at?: string
          display_name: string
          id?: string
          owner_user_id: string
          postal_code?: string | null
          region?: string | null
          type: Database["public"]["Enums"]["account_type"]
          updated_at?: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          billing_address?: Json
          billing_email?: string | null
          billing_legal_name?: string | null
          billing_tax_id?: string | null
          city?: string
          contact_email?: string
          contact_phone?: string
          country_code?: string
          created_at?: string
          display_name?: string
          id?: string
          owner_user_id?: string
          postal_code?: string | null
          region?: string | null
          type?: Database["public"]["Enums"]["account_type"]
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          account_id: string
          action: string
          actor_user_id: string | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          metadata: Json
        }
        Insert: {
          account_id: string
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          metadata?: Json
        }
        Update: {
          account_id?: string
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_exercise_logs: {
        Row: {
          account_id: string
          exercise_id: string
          id: string
          performed_at: string
          player_id: string
          session_id: string
          sets: Json
        }
        Insert: {
          account_id: string
          exercise_id: string
          id?: string
          performed_at?: string
          player_id: string
          session_id: string
          sets: Json
        }
        Update: {
          account_id?: string
          exercise_id?: string
          id?: string
          performed_at?: string
          player_id?: string
          session_id?: string
          sets?: Json
        }
        Relationships: [
          {
            foreignKeyName: "gym_exercise_logs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_exercise_logs_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gym_exercise_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      heatmap_tiles: {
        Row: {
          account_id: string
          computed_at: string
          id: string
          intensity: number
          player_id: string | null
          session_id: string
          tile_x: number
          tile_y: number
        }
        Insert: {
          account_id: string
          computed_at?: string
          id?: string
          intensity: number
          player_id?: string | null
          session_id: string
          tile_x: number
          tile_y: number
        }
        Update: {
          account_id?: string
          computed_at?: string
          id?: string
          intensity?: number
          player_id?: string | null
          session_id?: string
          tile_x?: number
          tile_y?: number
        }
        Relationships: [
          {
            foreignKeyName: "heatmap_tiles_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "heatmap_tiles_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "heatmap_tiles_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      injuries: {
        Row: {
          account_id: string
          body_zone_detail: number
          description: string | null
          diagnosed_at: string
          id: string
          player_id: string
          resolved_at: string | null
          severity: string | null
        }
        Insert: {
          account_id: string
          body_zone_detail: number
          description?: string | null
          diagnosed_at: string
          id?: string
          player_id: string
          resolved_at?: string | null
          severity?: string | null
        }
        Update: {
          account_id?: string
          body_zone_detail?: number
          description?: string | null
          diagnosed_at?: string
          id?: string
          player_id?: string
          resolved_at?: string | null
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "injuries_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "injuries_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          account_id: string
          created_at: string
          email: string | null
          expires_at: string
          id: string
          role: Database["public"]["Enums"]["account_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          account_id: string
          created_at?: string
          email?: string | null
          expires_at: string
          id?: string
          role: Database["public"]["Enums"]["account_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          account_id?: string
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          role?: Database["public"]["Enums"]["account_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      match_events: {
        Row: {
          account_id: string
          id: string
          kind: Database["public"]["Enums"]["match_event_kind"]
          match_minute: number | null
          occurred_at: string
          payload: Json
          player_id: string | null
          session_id: string
        }
        Insert: {
          account_id: string
          id?: string
          kind: Database["public"]["Enums"]["match_event_kind"]
          match_minute?: number | null
          occurred_at?: string
          payload?: Json
          player_id?: string | null
          session_id: string
        }
        Update: {
          account_id?: string
          id?: string
          kind?: Database["public"]["Enums"]["match_event_kind"]
          match_minute?: number | null
          occurred_at?: string
          payload?: Json
          player_id?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_events_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          display_name: string
          id: string
          player_limit: number | null
          team_limit: number | null
          tier: Database["public"]["Enums"]["plan_tier"]
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          player_limit?: number | null
          team_limit?: number | null
          tier: Database["public"]["Enums"]["plan_tier"]
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          player_limit?: number | null
          team_limit?: number | null
          tier?: Database["public"]["Enums"]["plan_tier"]
        }
        Relationships: []
      }
      player_comments: {
        Row: {
          account_id: string
          author_user_id: string | null
          body: string
          created_at: string
          id: string
          player_id: string
        }
        Insert: {
          account_id: string
          author_user_id?: string | null
          body: string
          created_at?: string
          id?: string
          player_id: string
        }
        Update: {
          account_id?: string
          author_user_id?: string | null
          body?: string
          created_at?: string
          id?: string
          player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_comments_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_comments_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_measurements: {
        Row: {
          account_id: string
          body_fat_percentage: number | null
          height_centimeters: number | null
          id: string
          notes: string | null
          player_id: string
          taken_at: string
          weight_kilograms: number | null
        }
        Insert: {
          account_id: string
          body_fat_percentage?: number | null
          height_centimeters?: number | null
          id?: string
          notes?: string | null
          player_id: string
          taken_at?: string
          weight_kilograms?: number | null
        }
        Update: {
          account_id?: string
          body_fat_percentage?: number | null
          height_centimeters?: number | null
          id?: string
          notes?: string | null
          player_id?: string
          taken_at?: string
          weight_kilograms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_measurements_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_measurements_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          account_id: string
          birth_date: string | null
          created_at: string
          display_name: string
          id: string
          metadata: Json
          position: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account_id: string
          birth_date?: string | null
          created_at?: string
          display_name: string
          id?: string
          metadata?: Json
          position?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account_id?: string
          birth_date?: string | null
          created_at?: string
          display_name?: string
          id?: string
          metadata?: Json
          position?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          preferred_locale: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          preferred_locale?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          preferred_locale?: string
          updated_at?: string
        }
        Relationships: []
      }
      recommendation_candidates: {
        Row: {
          account_id: string
          id: string
          player_id: string
          rank: number
          reasons: Json
          run_id: string
          score: number
        }
        Insert: {
          account_id: string
          id?: string
          player_id: string
          rank: number
          reasons?: Json
          run_id: string
          score: number
        }
        Update: {
          account_id?: string
          id?: string
          player_id?: string
          rank?: number
          reasons?: Json
          run_id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_candidates_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_candidates_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendation_candidates_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "recommendation_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendation_runs: {
        Row: {
          account_id: string
          completed_at: string | null
          created_at: string
          id: string
          model: string | null
          prompt: Json | null
          requested_by: string | null
          result: Json | null
          status: Database["public"]["Enums"]["recommendation_status"]
        }
        Insert: {
          account_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          model?: string | null
          prompt?: Json | null
          requested_by?: string | null
          result?: Json | null
          status?: Database["public"]["Enums"]["recommendation_status"]
        }
        Update: {
          account_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          model?: string | null
          prompt?: Json | null
          requested_by?: string | null
          result?: Json | null
          status?: Database["public"]["Enums"]["recommendation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "recommendation_runs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      route_annotations: {
        Row: {
          account_id: string
          id: string
          label: string
          latitude: number
          longitude: number
          notes: string | null
          session_id: string
        }
        Insert: {
          account_id: string
          id?: string
          label: string
          latitude: number
          longitude: number
          notes?: string | null
          session_id: string
        }
        Update: {
          account_id?: string
          id?: string
          label?: string
          latitude?: number
          longitude?: number
          notes?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "route_annotations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "route_annotations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_player_metrics: {
        Row: {
          account_id: string
          average_speed_mps: number | null
          computed_at: string
          id: string
          max_speed_mps: number | null
          player_id: string
          session_id: string
          total_distance_meters: number | null
          total_duration_seconds: number | null
          zones: Json | null
        }
        Insert: {
          account_id: string
          average_speed_mps?: number | null
          computed_at?: string
          id?: string
          max_speed_mps?: number | null
          player_id: string
          session_id: string
          total_distance_meters?: number | null
          total_duration_seconds?: number | null
          zones?: Json | null
        }
        Update: {
          account_id?: string
          average_speed_mps?: number | null
          computed_at?: string
          id?: string
          max_speed_mps?: number | null
          player_id?: string
          session_id?: string
          total_distance_meters?: number | null
          total_duration_seconds?: number | null
          zones?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "session_player_metrics_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_player_metrics_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_player_metrics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_players: {
        Row: {
          account_id: string
          player_id: string
          session_id: string
        }
        Insert: {
          account_id: string
          player_id: string
          session_id: string
        }
        Update: {
          account_id?: string
          player_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_players_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_players_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_usage: {
        Row: {
          account_id: string
          player_count: number
          team_count: number
          updated_at: string
        }
        Insert: {
          account_id: string
          player_count?: number
          team_count?: number
          updated_at?: string
        }
        Update: {
          account_id?: string
          player_count?: number
          team_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_usage_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          account_id: string
          billing_interval:
            | Database["public"]["Enums"]["billing_interval"]
            | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          external_id: string | null
          external_provider: string | null
          id: string
          plan_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
        }
        Insert: {
          account_id: string
          billing_interval?:
            | Database["public"]["Enums"]["billing_interval"]
            | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          external_id?: string | null
          external_provider?: string | null
          id?: string
          plan_id: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Update: {
          account_id?: string
          billing_interval?:
            | Database["public"]["Enums"]["billing_interval"]
            | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          external_id?: string | null
          external_provider?: string | null
          id?: string
          plan_id?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      team_players: {
        Row: {
          account_id: string
          jersey_number: string | null
          joined_at: string
          player_id: string
          team_id: string
        }
        Insert: {
          account_id: string
          jersey_number?: string | null
          joined_at?: string
          player_id: string
          team_id: string
        }
        Update: {
          account_id?: string
          jersey_number?: string | null
          joined_at?: string
          player_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_players_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          account_id: string
          created_at: string
          id: string
          name: string
          sport_type: Database["public"]["Enums"]["sport_type"]
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          id?: string
          name: string
          sport_type?: Database["public"]["Enums"]["sport_type"]
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          id?: string
          name?: string
          sport_type?: Database["public"]["Enums"]["sport_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      telemetry_samples: {
        Row: {
          account_id: string
          captured_at: string
          heart_rate: number | null
          id: string
          latitude: number | null
          longitude: number | null
          payload: Json | null
          player_id: string | null
          speed_mps: number | null
          upload_id: string
        }
        Insert: {
          account_id: string
          captured_at: string
          heart_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          payload?: Json | null
          player_id?: string | null
          speed_mps?: number | null
          upload_id: string
        }
        Update: {
          account_id?: string
          captured_at?: string
          heart_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          payload?: Json | null
          player_id?: string | null
          speed_mps?: number | null
          upload_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "telemetry_samples_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telemetry_samples_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telemetry_samples_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "telemetry_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      telemetry_samples_2026_04: {
        Row: {
          account_id: string
          captured_at: string
          heart_rate: number | null
          id: string
          latitude: number | null
          longitude: number | null
          payload: Json | null
          player_id: string | null
          speed_mps: number | null
          upload_id: string
        }
        Insert: {
          account_id: string
          captured_at: string
          heart_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          payload?: Json | null
          player_id?: string | null
          speed_mps?: number | null
          upload_id: string
        }
        Update: {
          account_id?: string
          captured_at?: string
          heart_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          payload?: Json | null
          player_id?: string | null
          speed_mps?: number | null
          upload_id?: string
        }
        Relationships: []
      }
      telemetry_samples_2026_05: {
        Row: {
          account_id: string
          captured_at: string
          heart_rate: number | null
          id: string
          latitude: number | null
          longitude: number | null
          payload: Json | null
          player_id: string | null
          speed_mps: number | null
          upload_id: string
        }
        Insert: {
          account_id: string
          captured_at: string
          heart_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          payload?: Json | null
          player_id?: string | null
          speed_mps?: number | null
          upload_id: string
        }
        Update: {
          account_id?: string
          captured_at?: string
          heart_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          payload?: Json | null
          player_id?: string | null
          speed_mps?: number | null
          upload_id?: string
        }
        Relationships: []
      }
      telemetry_samples_2026_06: {
        Row: {
          account_id: string
          captured_at: string
          heart_rate: number | null
          id: string
          latitude: number | null
          longitude: number | null
          payload: Json | null
          player_id: string | null
          speed_mps: number | null
          upload_id: string
        }
        Insert: {
          account_id: string
          captured_at: string
          heart_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          payload?: Json | null
          player_id?: string | null
          speed_mps?: number | null
          upload_id: string
        }
        Update: {
          account_id?: string
          captured_at?: string
          heart_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          payload?: Json | null
          player_id?: string | null
          speed_mps?: number | null
          upload_id?: string
        }
        Relationships: []
      }
      telemetry_samples_2026_07: {
        Row: {
          account_id: string
          captured_at: string
          heart_rate: number | null
          id: string
          latitude: number | null
          longitude: number | null
          payload: Json | null
          player_id: string | null
          speed_mps: number | null
          upload_id: string
        }
        Insert: {
          account_id: string
          captured_at: string
          heart_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          payload?: Json | null
          player_id?: string | null
          speed_mps?: number | null
          upload_id: string
        }
        Update: {
          account_id?: string
          captured_at?: string
          heart_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          payload?: Json | null
          player_id?: string | null
          speed_mps?: number | null
          upload_id?: string
        }
        Relationships: []
      }
      telemetry_samples_2026_08: {
        Row: {
          account_id: string
          captured_at: string
          heart_rate: number | null
          id: string
          latitude: number | null
          longitude: number | null
          payload: Json | null
          player_id: string | null
          speed_mps: number | null
          upload_id: string
        }
        Insert: {
          account_id: string
          captured_at: string
          heart_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          payload?: Json | null
          player_id?: string | null
          speed_mps?: number | null
          upload_id: string
        }
        Update: {
          account_id?: string
          captured_at?: string
          heart_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          payload?: Json | null
          player_id?: string | null
          speed_mps?: number | null
          upload_id?: string
        }
        Relationships: []
      }
      telemetry_samples_2026_09: {
        Row: {
          account_id: string
          captured_at: string
          heart_rate: number | null
          id: string
          latitude: number | null
          longitude: number | null
          payload: Json | null
          player_id: string | null
          speed_mps: number | null
          upload_id: string
        }
        Insert: {
          account_id: string
          captured_at: string
          heart_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          payload?: Json | null
          player_id?: string | null
          speed_mps?: number | null
          upload_id: string
        }
        Update: {
          account_id?: string
          captured_at?: string
          heart_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          payload?: Json | null
          player_id?: string | null
          speed_mps?: number | null
          upload_id?: string
        }
        Relationships: []
      }
      telemetry_samples_2026_10: {
        Row: {
          account_id: string
          captured_at: string
          heart_rate: number | null
          id: string
          latitude: number | null
          longitude: number | null
          payload: Json | null
          player_id: string | null
          speed_mps: number | null
          upload_id: string
        }
        Insert: {
          account_id: string
          captured_at: string
          heart_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          payload?: Json | null
          player_id?: string | null
          speed_mps?: number | null
          upload_id: string
        }
        Update: {
          account_id?: string
          captured_at?: string
          heart_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          payload?: Json | null
          player_id?: string | null
          speed_mps?: number | null
          upload_id?: string
        }
        Relationships: []
      }
      telemetry_samples_2026_11: {
        Row: {
          account_id: string
          captured_at: string
          heart_rate: number | null
          id: string
          latitude: number | null
          longitude: number | null
          payload: Json | null
          player_id: string | null
          speed_mps: number | null
          upload_id: string
        }
        Insert: {
          account_id: string
          captured_at: string
          heart_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          payload?: Json | null
          player_id?: string | null
          speed_mps?: number | null
          upload_id: string
        }
        Update: {
          account_id?: string
          captured_at?: string
          heart_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          payload?: Json | null
          player_id?: string | null
          speed_mps?: number | null
          upload_id?: string
        }
        Relationships: []
      }
      telemetry_samples_2026_12: {
        Row: {
          account_id: string
          captured_at: string
          heart_rate: number | null
          id: string
          latitude: number | null
          longitude: number | null
          payload: Json | null
          player_id: string | null
          speed_mps: number | null
          upload_id: string
        }
        Insert: {
          account_id: string
          captured_at: string
          heart_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          payload?: Json | null
          player_id?: string | null
          speed_mps?: number | null
          upload_id: string
        }
        Update: {
          account_id?: string
          captured_at?: string
          heart_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          payload?: Json | null
          player_id?: string | null
          speed_mps?: number | null
          upload_id?: string
        }
        Relationships: []
      }
      telemetry_samples_2027_01: {
        Row: {
          account_id: string
          captured_at: string
          heart_rate: number | null
          id: string
          latitude: number | null
          longitude: number | null
          payload: Json | null
          player_id: string | null
          speed_mps: number | null
          upload_id: string
        }
        Insert: {
          account_id: string
          captured_at: string
          heart_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          payload?: Json | null
          player_id?: string | null
          speed_mps?: number | null
          upload_id: string
        }
        Update: {
          account_id?: string
          captured_at?: string
          heart_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          payload?: Json | null
          player_id?: string | null
          speed_mps?: number | null
          upload_id?: string
        }
        Relationships: []
      }
      telemetry_samples_2027_02: {
        Row: {
          account_id: string
          captured_at: string
          heart_rate: number | null
          id: string
          latitude: number | null
          longitude: number | null
          payload: Json | null
          player_id: string | null
          speed_mps: number | null
          upload_id: string
        }
        Insert: {
          account_id: string
          captured_at: string
          heart_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          payload?: Json | null
          player_id?: string | null
          speed_mps?: number | null
          upload_id: string
        }
        Update: {
          account_id?: string
          captured_at?: string
          heart_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          payload?: Json | null
          player_id?: string | null
          speed_mps?: number | null
          upload_id?: string
        }
        Relationships: []
      }
      telemetry_samples_2027_03: {
        Row: {
          account_id: string
          captured_at: string
          heart_rate: number | null
          id: string
          latitude: number | null
          longitude: number | null
          payload: Json | null
          player_id: string | null
          speed_mps: number | null
          upload_id: string
        }
        Insert: {
          account_id: string
          captured_at: string
          heart_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          payload?: Json | null
          player_id?: string | null
          speed_mps?: number | null
          upload_id: string
        }
        Update: {
          account_id?: string
          captured_at?: string
          heart_rate?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          payload?: Json | null
          player_id?: string | null
          speed_mps?: number | null
          upload_id?: string
        }
        Relationships: []
      }
      telemetry_uploads: {
        Row: {
          account_id: string
          id: string
          player_id: string | null
          processed_at: string | null
          session_id: string | null
          source: Database["public"]["Enums"]["telemetry_source"]
          storage_path: string
          uploaded_at: string
        }
        Insert: {
          account_id: string
          id?: string
          player_id?: string | null
          processed_at?: string | null
          session_id?: string | null
          source: Database["public"]["Enums"]["telemetry_source"]
          storage_path: string
          uploaded_at?: string
        }
        Update: {
          account_id?: string
          id?: string
          player_id?: string | null
          processed_at?: string | null
          session_id?: string | null
          source?: Database["public"]["Enums"]["telemetry_source"]
          storage_path?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "telemetry_uploads_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telemetry_uploads_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "telemetry_uploads_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          account_id: string
          created_at: string
          duration_seconds: number | null
          id: string
          kind: Database["public"]["Enums"]["training_session_kind"]
          notes: string | null
          scheduled_for: string
          team_id: string | null
        }
        Insert: {
          account_id: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          kind: Database["public"]["Enums"]["training_session_kind"]
          notes?: string | null
          scheduled_for: string
          team_id?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string
          duration_seconds?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["training_session_kind"]
          notes?: string | null
          scheduled_for?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_sessions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_id: { Args: never; Returns: string }
      has_account_role: {
        Args: {
          allowed: Database["public"]["Enums"]["account_role"][]
          target_account: string
        }
        Returns: boolean
      }
      is_account_member: { Args: { target_account: string }; Returns: boolean }
    }
    Enums: {
      account_role:
        | "owner"
        | "administrator"
        | "technician"
        | "assistant"
        | "viewer"
      account_type: "individual" | "corporate"
      billing_interval: "monthly" | "yearly"
      match_event_kind:
        | "goal"
        | "assist"
        | "shot"
        | "foul"
        | "yellow_card"
        | "red_card"
        | "substitution"
        | "injury"
        | "note"
      plan_tier: "basic" | "pro" | "pro_plus"
      recommendation_status: "queued" | "running" | "succeeded" | "failed"
      sport_type: "football" | "hockey" | "rugby"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "incomplete"
      telemetry_source: "garmin" | "polar" | "apple_health" | "manual" | "other"
      training_session_kind:
        | "team_training"
        | "gym"
        | "running"
        | "match"
        | "recovery"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_role: [
        "owner",
        "administrator",
        "technician",
        "assistant",
        "viewer",
      ],
      account_type: ["individual", "corporate"],
      billing_interval: ["monthly", "yearly"],
      match_event_kind: [
        "goal",
        "assist",
        "shot",
        "foul",
        "yellow_card",
        "red_card",
        "substitution",
        "injury",
        "note",
      ],
      plan_tier: ["basic", "pro", "pro_plus"],
      recommendation_status: ["queued", "running", "succeeded", "failed"],
      sport_type: ["football", "hockey", "rugby"],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "canceled",
        "incomplete",
      ],
      telemetry_source: ["garmin", "polar", "apple_health", "manual", "other"],
      training_session_kind: [
        "team_training",
        "gym",
        "running",
        "match",
        "recovery",
        "other",
      ],
    },
  },
} as const
