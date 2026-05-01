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
        Row: {
          id: string;
          display_name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      reading_entries: {
        Row: {
          id: string;
          user_id: string;
          testament: "old" | "new";
          book: string;
          chapter: number;
          read_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          testament: "old" | "new";
          book: string;
          chapter: number;
          read_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          testament?: "old" | "new";
          book?: string;
          chapter?: number;
          read_at?: string;
          created_at?: string;
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
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
