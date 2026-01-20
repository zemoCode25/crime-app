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
    PostgrestVersion: "13.0.4"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      case_person: {
        Row: {
          case_role: Database["public"]["Enums"]["case_involvement"] | null
          created_at: string
          crime_id: number | null
          id: number
          person_profile_id: number | null
        }
        Insert: {
          case_role?: Database["public"]["Enums"]["case_involvement"] | null
          created_at?: string
          crime_id?: number | null
          id?: number
          person_profile_id?: number | null
        }
        Update: {
          case_role?: Database["public"]["Enums"]["case_involvement"] | null
          created_at?: string
          crime_id?: number | null
          id?: number
          person_profile_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "case_person_crime_id_fkey"
            columns: ["crime_id"]
            isOneToOne: false
            referencedRelation: "crime_case"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_person_person_profile_id_fkey"
            columns: ["person_profile_id"]
            isOneToOne: false
            referencedRelation: "person_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      complainant: {
        Row: {
          case_person_id: number | null
          created_at: string
          id: number
          narrative: string | null
        }
        Insert: {
          case_person_id?: number | null
          created_at?: string
          id?: number
          narrative?: string | null
        }
        Update: {
          case_person_id?: number | null
          created_at?: string
          id?: number
          narrative?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complainant_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "case_person"
            referencedColumns: ["id"]
          },
        ]
      }
      crime_case: {
        Row: {
          case_number: string | null
          case_status: Database["public"]["Enums"]["status_enum"] | null
          created_at: string
          crime_type: number | null
          description: string | null
          follow_up: string | null
          id: number
          image_keys: string[]
          incident_datetime: string | null
          investigator: string | null
          investigator_notes: string | null
          location_id: number | null
          remarks: string | null
          report_datetime: string | null
          responder: string | null
          user_id: number | null
          visibility: Database["public"]["Enums"]["visibility"] | null
        }
        Insert: {
          case_number?: string | null
          case_status?: Database["public"]["Enums"]["status_enum"] | null
          created_at?: string
          crime_type?: number | null
          description?: string | null
          follow_up?: string | null
          id?: number
          image_keys?: string[]
          incident_datetime?: string | null
          investigator?: string | null
          investigator_notes?: string | null
          location_id?: number | null
          remarks?: string | null
          report_datetime?: string | null
          responder?: string | null
          user_id?: number | null
          visibility?: Database["public"]["Enums"]["visibility"] | null
        }
        Update: {
          case_number?: string | null
          case_status?: Database["public"]["Enums"]["status_enum"] | null
          created_at?: string
          crime_type?: number | null
          description?: string | null
          follow_up?: string | null
          id?: number
          image_keys?: string[]
          incident_datetime?: string | null
          investigator?: string | null
          investigator_notes?: string | null
          location_id?: number | null
          remarks?: string | null
          report_datetime?: string | null
          responder?: string | null
          user_id?: number | null
          visibility?: Database["public"]["Enums"]["visibility"] | null
        }
        Relationships: [
          {
            foreignKeyName: "crime_case_crime_type_fkey"
            columns: ["crime_type"]
            isOneToOne: false
            referencedRelation: "crime-type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crime_case_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "location"
            referencedColumns: ["id"]
          },
        ]
      }
      "crime-type": {
        Row: {
          color: string | null
          created_at: string
          id: number
          label: string | null
          name: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: number
          label?: string | null
          name?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: number
          label?: string | null
          name?: string | null
        }
        Relationships: []
      }
      emergency: {
        Row: {
          body: string | null
          created_at: string
          id: number
          image_key: string | null
          schedule: string | null
          subject: string | null
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: number
          image_key?: string | null
          schedule?: string | null
          subject?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: number
          image_key?: string | null
          schedule?: string | null
          subject?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      hotline: {
        Row: {
          created_at: string
          id: number
          label: string | null
          number: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          label?: string | null
          number?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          label?: string | null
          number?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotlines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation: {
        Row: {
          barangay: number | null
          consumed_datetime: string | null
          created_at: string
          created_by_id: string | null
          email: string | null
          expiry_datetime: string | null
          first_name: string | null
          id: number
          last_name: string | null
          role: Database["public"]["Enums"]["roles"] | null
          token: string | null
        }
        Insert: {
          barangay?: number | null
          consumed_datetime?: string | null
          created_at?: string
          created_by_id?: string | null
          email?: string | null
          expiry_datetime?: string | null
          first_name?: string | null
          id?: number
          last_name?: string | null
          role?: Database["public"]["Enums"]["roles"] | null
          token?: string | null
        }
        Update: {
          barangay?: number | null
          consumed_datetime?: string | null
          created_at?: string
          created_by_id?: string | null
          email?: string | null
          expiry_datetime?: string | null
          first_name?: string | null
          id?: number
          last_name?: string | null
          role?: Database["public"]["Enums"]["roles"] | null
          token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitation_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      location: {
        Row: {
          barangay: number | null
          created_at: string
          crime_location: string | null
          id: number
          landmark: string | null
          lat: number | null
          long: number | null
          pin: number | null
        }
        Insert: {
          barangay?: number | null
          created_at?: string
          crime_location?: string | null
          id?: number
          landmark?: string | null
          lat?: number | null
          long?: number | null
          pin?: number | null
        }
        Update: {
          barangay?: number | null
          created_at?: string
          crime_location?: string | null
          id?: number
          landmark?: string | null
          lat?: number | null
          long?: number | null
          pin?: number | null
        }
        Relationships: []
      }
      person_profile: {
        Row: {
          address: string | null
          birth_date: string | null
          civil_status: Database["public"]["Enums"]["civil_status"] | null
          contact_number: string | null
          created_at: string
          first_name: string | null
          id: number
          last_name: string | null
          person_notified: string | null
          related_contact: string | null
          sex: Database["public"]["Enums"]["sex"] | null
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          civil_status?: Database["public"]["Enums"]["civil_status"] | null
          contact_number?: string | null
          created_at?: string
          first_name?: string | null
          id?: number
          last_name?: string | null
          person_notified?: string | null
          related_contact?: string | null
          sex?: Database["public"]["Enums"]["sex"] | null
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          civil_status?: Database["public"]["Enums"]["civil_status"] | null
          contact_number?: string | null
          created_at?: string
          first_name?: string | null
          id?: number
          last_name?: string | null
          person_notified?: string | null
          related_contact?: string | null
          sex?: Database["public"]["Enums"]["sex"] | null
        }
        Relationships: []
      }
      suspect: {
        Row: {
          case_person_id: number | null
          created_at: string
          id: number
          motive: string | null
          weapon_used: string | null
        }
        Insert: {
          case_person_id?: number | null
          created_at?: string
          id?: number
          motive?: string | null
          weapon_used?: string | null
        }
        Update: {
          case_person_id?: number | null
          created_at?: string
          id?: number
          motive?: string | null
          weapon_used?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suspect_case_person_id_fkey"
            columns: ["case_person_id"]
            isOneToOne: false
            referencedRelation: "case_person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suspect_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "case_person"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          barangay: number | null
          contact_number: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: Database["public"]["Enums"]["roles"] | null
        }
        Insert: {
          barangay?: number | null
          contact_number?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["roles"] | null
        }
        Update: {
          barangay?: number | null
          contact_number?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["roles"] | null
        }
        Relationships: []
      }
      witness: {
        Row: {
          case_person_id: number | null
          created_at: string
          id: number
          testimony: string | null
        }
        Insert: {
          case_person_id?: number | null
          created_at?: string
          id?: number
          testimony?: string | null
        }
        Update: {
          case_person_id?: number | null
          created_at?: string
          id?: number
          testimony?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "witness_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "case_person"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      insert_crime_case_transaction: {
        Args: { case_data: Json; location_data: Json; persons_data: Json[] }
        Returns: Json
      }
      insert_full_form: {
        Args: {
          _address: Json
          _employment: Json
          _profile: Json
          _user_id: string
        }
        Returns: undefined
      }
      update_crime_case_transaction: {
        Args: {
          case_data: Json
          case_id: number
          location_data: Json
          persons_data: Json[]
        }
        Returns: Json
      }
    }
    Enums: {
      barangay:
        | "poblacion"
        | "tunasan"
        | "putatan"
        | "bayanan"
        | "alabang"
        | "ayala alabang"
        | "buli"
        | "cupang"
        | "sucat"
      case_involvement: "suspect" | "complainant" | "witness"
      civil_status:
        | "single"
        | "married"
        | "widowed"
        | "divorced"
        | "legally separated"
        | "annulled"
      roles: "main_admin" | "system_admin" | "barangay_admin" | "mobile_user"
      sex: "male" | "female"
      status_enum:
        | "open"
        | "under investigation"
        | "case settled"
        | "lupon"
        | "direct filing"
        | "for record"
        | "turn-over"
      visibility: "public" | "private"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      barangay: [
        "poblacion",
        "tunasan",
        "putatan",
        "bayanan",
        "alabang",
        "ayala alabang",
        "buli",
        "cupang",
        "sucat",
      ],
      case_involvement: ["suspect", "complainant", "witness"],
      civil_status: [
        "single",
        "married",
        "widowed",
        "divorced",
        "legally separated",
        "annulled",
      ],
      roles: ["main_admin", "system_admin", "barangay_admin", "mobile_user"],
      sex: ["male", "female"],
      status_enum: [
        "open",
        "under investigation",
        "case settled",
        "lupon",
        "direct filing",
        "for record",
        "turn-over",
      ],
      visibility: ["public", "private"],
    },
  },
} as const
