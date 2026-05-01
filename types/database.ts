// Run `pnpm db:types` after connecting your Supabase project to regenerate this file.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string; created_at: string };
        Insert: { id: string; display_name: string; created_at?: string };
        Update: { id?: string; display_name?: string; created_at?: string };
        Relationships: [];
      };
      reading_progress: {
        Row: {
          user_id: string;
          ot_book: string | null;
          ot_chapter: number | null;
          ot_chapter_index: number | null;
          nt_book: string | null;
          nt_chapter: number | null;
          nt_chapter_index: number | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          ot_book?: string | null;
          ot_chapter?: number | null;
          ot_chapter_index?: number | null;
          nt_book?: string | null;
          nt_chapter?: number | null;
          nt_chapter_index?: number | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          ot_book?: string | null;
          ot_chapter?: number | null;
          ot_chapter_index?: number | null;
          nt_book?: string | null;
          nt_chapter?: number | null;
          nt_chapter_index?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      progress_history: {
        Row: {
          id: string;
          user_id: string;
          testament: "old" | "new";
          book: string;
          chapter: number;
          chapter_index: number;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          testament: "old" | "new";
          book: string;
          chapter: number;
          chapter_index: number;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          testament?: "old" | "new";
          book?: string;
          chapter?: number;
          chapter_index?: number;
          recorded_at?: string;
        };
        Relationships: [];
      };
      friendships: {
        Row: {
          user_a: string;
          user_b: string;
          status: "pending" | "accepted";
          requested_by: string;
          created_at: string;
        };
        Insert: {
          user_a: string;
          user_b: string;
          status: "pending" | "accepted";
          requested_by: string;
          created_at?: string;
        };
        Update: {
          user_a?: string;
          user_b?: string;
          status?: "pending" | "accepted";
          requested_by?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
