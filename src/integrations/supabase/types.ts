export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      body_scans: {
        Row: {
          arm_size: number | null
          body_fat_percentage: number | null
          chest_size: number | null
          height: number | null
          hip_size: number | null
          id: string
          leg_size: number | null
          muscle_mass: number | null
          scan_date: string
          user_id: string
          waist_size: number | null
          weight: number | null
        }
        Insert: {
          arm_size?: number | null
          body_fat_percentage?: number | null
          chest_size?: number | null
          height?: number | null
          hip_size?: number | null
          id?: string
          leg_size?: number | null
          muscle_mass?: number | null
          scan_date?: string
          user_id: string
          waist_size?: number | null
          weight?: number | null
        }
        Update: {
          arm_size?: number | null
          body_fat_percentage?: number | null
          chest_size?: number | null
          height?: number | null
          hip_size?: number | null
          id?: string
          leg_size?: number | null
          muscle_mass?: number | null
          scan_date?: string
          user_id?: string
          waist_size?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      calorie_entries: {
        Row: {
          calories: number
          carbs: number
          created_at: string
          fat: number
          id: string
          name: string
          protein: number
          user_id: string
        }
        Insert: {
          calories: number
          carbs?: number
          created_at?: string
          fat?: number
          id?: string
          name: string
          protein?: number
          user_id: string
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string
          fat?: number
          id?: string
          name?: string
          protein?: number
          user_id?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          duration: number | null
          equipment: string
          id: string
          name: string
          reps: number
          rest_between_sets: number
          sets: number
          video_url: string | null
          weight: number | null
          workout_id: string | null
        }
        Insert: {
          duration?: number | null
          equipment: string
          id?: string
          name: string
          reps: number
          rest_between_sets: number
          sets: number
          video_url?: string | null
          weight?: number | null
          workout_id?: string | null
        }
        Update: {
          duration?: number | null
          equipment?: string
          id?: string
          name?: string
          reps?: number
          rest_between_sets?: number
          sets?: number
          video_url?: string | null
          weight?: number | null
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          username?: string
        }
        Relationships: []
      }
      user_nutrition: {
        Row: {
          calorie_goal: number
          carb_goal: number
          created_at: string
          fat_goal: number
          id: string
          protein_goal: number
          updated_at: string
          user_id: string
        }
        Insert: {
          calorie_goal?: number
          carb_goal?: number
          created_at?: string
          fat_goal?: number
          id?: string
          protein_goal?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          calorie_goal?: number
          carb_goal?: number
          created_at?: string
          fat_goal?: number
          id?: string
          protein_goal?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_history: {
        Row: {
          calories_burned: number | null
          date: string | null
          duration: number
          heart_rate: number | null
          id: string
          oxygen_saturation: number | null
          performance: number
          user_id: string
          workout_id: string | null
        }
        Insert: {
          calories_burned?: number | null
          date?: string | null
          duration: number
          heart_rate?: number | null
          id?: string
          oxygen_saturation?: number | null
          performance: number
          user_id: string
          workout_id?: string | null
        }
        Update: {
          calories_burned?: number | null
          date?: string | null
          duration?: number
          heart_rate?: number | null
          id?: string
          oxygen_saturation?: number | null
          performance?: number
          user_id?: string
          workout_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_history_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          name: string
          type: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          name: string
          type: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          name?: string
          type?: string
          user_id?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
