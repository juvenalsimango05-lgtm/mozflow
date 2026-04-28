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
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      checkin_settings: {
        Row: {
          day: string
          is_open: boolean
          reward: number
          updated_at: string
        }
        Insert: {
          day: string
          is_open?: boolean
          reward?: number
          updated_at?: string
        }
        Update: {
          day?: string
          is_open?: boolean
          reward?: number
          updated_at?: string
        }
        Relationships: []
      }
      checkins: {
        Row: {
          created_at: string
          day: string
          id: string
          reward: number
          user_id: string
        }
        Insert: {
          created_at?: string
          day?: string
          id?: string
          reward: number
          user_id: string
        }
        Update: {
          created_at?: string
          day?: string
          id?: string
          reward?: number
          user_id?: string
        }
        Relationships: []
      }
      deposits: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string
          id: string
          method: string
          receiving_account: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sender_phone: string
          status: string
          transaction_id: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          created_at?: string
          id?: string
          method: string
          receiving_account?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sender_phone: string
          status?: string
          transaction_id: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          id?: string
          method?: string
          receiving_account?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sender_phone?: string
          status?: string
          transaction_id?: string
          user_id?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          amount: number
          created_at: string
          daily_return: number
          duration_days: number
          earned: number
          end_date: string
          id: string
          last_payout_at: string | null
          plan_code: string
          plan_id: string
          start_date: string
          status: string
          total_return: number
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          daily_return: number
          duration_days: number
          earned?: number
          end_date: string
          id?: string
          last_payout_at?: string | null
          plan_code: string
          plan_id: string
          start_date?: string
          status?: string
          total_return: number
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          daily_return?: number
          duration_days?: number
          earned?: number
          end_date?: string
          id?: string
          last_payout_at?: string | null
          plan_code?: string
          plan_id?: string
          start_date?: string
          status?: string
          total_return?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_accounts: {
        Row: {
          account_name: string | null
          account_number: string
          created_at: string
          id: string
          is_active: boolean
          method: string
        }
        Insert: {
          account_name?: string | null
          account_number: string
          created_at?: string
          id?: string
          is_active?: boolean
          method: string
        }
        Update: {
          account_name?: string | null
          account_number?: string
          created_at?: string
          id?: string
          is_active?: boolean
          method?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          code: string
          created_at: string
          daily_return: number
          duration_days: number
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          net_profit: number
          price: number
          sort_order: number
          total_return: number
        }
        Insert: {
          code: string
          created_at?: string
          daily_return: number
          duration_days: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          net_profit: number
          price: number
          sort_order?: number
          total_return: number
        }
        Update: {
          code?: string
          created_at?: string
          daily_return?: number
          duration_days?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          net_profit?: number
          price?: number
          sort_order?: number
          total_return?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          balance: number
          created_at: string
          id: string
          last_plan: string | null
          name: string
          phone: string
          referral_code: string
          referral_earnings: number
          referred_by: string | null
          total_deposit: number
          total_earnings: number
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id: string
          last_plan?: string | null
          name: string
          phone: string
          referral_code: string
          referral_earnings?: number
          referred_by?: string | null
          total_deposit?: number
          total_earnings?: number
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          last_plan?: string | null
          name?: string
          phone?: string
          referral_code?: string
          referral_earnings?: number
          referred_by?: string | null
          total_deposit?: number
          total_earnings?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_earnings: {
        Row: {
          amount: number
          created_at: string
          id: string
          investment_id: string | null
          referred_user_id: string
          referrer_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          investment_id?: string | null
          referred_user_id: string
          referrer_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          investment_id?: string | null
          referred_user_id?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_earnings_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
        ]
      }
      roulette_prizes: {
        Row: {
          amount: number
          created_at: string
          id: string
          label: string
          probability: number
          slot_index: number
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          label: string
          probability?: number
          slot_index: number
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          label?: string
          probability?: number
          slot_index?: number
        }
        Relationships: []
      }
      roulette_spins: {
        Row: {
          amount: number
          created_at: string
          id: string
          prize_id: string | null
          spun_on: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          prize_id?: string | null
          spun_on?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          prize_id?: string | null
          spun_on?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "roulette_spins_prize_id_fkey"
            columns: ["prize_id"]
            isOneToOne: false
            referencedRelation: "roulette_prizes"
            referencedColumns: ["id"]
          },
        ]
      }
      task_claims: {
        Row: {
          created_at: string
          id: string
          reward: number
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reward: number
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reward?: number
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_claims_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          reward: number
          sort_order: number
          title: string
          video_url: string
          watch_seconds: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          reward?: number
          sort_order?: number
          title: string
          video_url: string
          watch_seconds?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          reward?: number
          sort_order?: number
          title?: string
          video_url?: string
          watch_seconds?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string
          destination_phone: string
          id: string
          method: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          created_at?: string
          destination_phone: string
          id?: string
          method: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          destination_phone?: string
          id?: string
          method?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
