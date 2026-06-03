export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cooperatives: {
        Row: {
          activo: boolean
          cif: string | null
          codigo_postal: string | null
          created_at: string
          created_by: string | null
          direccion: string | null
          email: string | null
          id: string
          municipio: string | null
          nombre: string
          provincia: string | null
          telefono: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          cif?: string | null
          codigo_postal?: string | null
          created_at?: string
          created_by?: string | null
          direccion?: string | null
          email?: string | null
          id?: string
          municipio?: string | null
          nombre: string
          provincia?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          cif?: string | null
          codigo_postal?: string | null
          created_at?: string
          created_by?: string | null
          direccion?: string | null
          email?: string | null
          id?: string
          municipio?: string | null
          nombre?: string
          provincia?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          cooperative_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["org_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cooperative_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["org_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cooperative_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["org_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_cooperative_id_fkey"
            columns: ["cooperative_id"]
            isOneToOne: false
            referencedRelation: "cooperatives"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nombre: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          nombre?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nombre?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      socios: {
        Row: {
          activo: boolean
          alta: boolean
          apellidos: string | null
          ayudas_borras: boolean
          baja: boolean
          codigo_postal: string | null
          codigo_socio: string | null
          cooperativa_codigo: string | null
          cooperative_id: string
          created_at: string
          created_by: string | null
          cuaderno: boolean
          deleted_at: string | null
          direccion: string | null
          email: string | null
          fecha_alta: string | null
          fecha_aviso: string | null
          fecha_baja: string | null
          finaliza: boolean
          iban: string | null
          id: string
          municipio: string | null
          nif: string | null
          nif_cif: string | null
          nombre: string | null
          notas: string | null
          observaciones: string | null
          observaciones_2025: string | null
          p6_p7: string | null
          poblacion: string | null
          provincia: string | null
          razon_social: string | null
          registra: boolean
          subvencion: boolean
          telefono: string | null
          telefono_1: string | null
          telefono_2: string | null
          tipo: Database["public"]["Enums"]["socio_tipo"]
          traspaso: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          activo?: boolean
          alta?: boolean
          apellidos?: string | null
          ayudas_borras?: boolean
          baja?: boolean
          codigo_postal?: string | null
          codigo_socio?: string | null
          cooperativa_codigo?: string | null
          cooperative_id: string
          created_at?: string
          created_by?: string | null
          cuaderno?: boolean
          deleted_at?: string | null
          direccion?: string | null
          email?: string | null
          fecha_alta?: string | null
          fecha_aviso?: string | null
          fecha_baja?: string | null
          finaliza?: boolean
          iban?: string | null
          id?: string
          municipio?: string | null
          nif?: string | null
          nif_cif?: string | null
          nombre?: string | null
          notas?: string | null
          observaciones?: string | null
          observaciones_2025?: string | null
          p6_p7?: string | null
          poblacion?: string | null
          provincia?: string | null
          razon_social?: string | null
          registra?: boolean
          subvencion?: boolean
          telefono?: string | null
          telefono_1?: string | null
          telefono_2?: string | null
          tipo?: Database["public"]["Enums"]["socio_tipo"]
          traspaso?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          activo?: boolean
          alta?: boolean
          apellidos?: string | null
          ayudas_borras?: boolean
          baja?: boolean
          codigo_postal?: string | null
          codigo_socio?: string | null
          cooperativa_codigo?: string | null
          cooperative_id?: string
          created_at?: string
          created_by?: string | null
          cuaderno?: boolean
          deleted_at?: string | null
          direccion?: string | null
          email?: string | null
          fecha_alta?: string | null
          fecha_aviso?: string | null
          fecha_baja?: string | null
          finaliza?: boolean
          iban?: string | null
          id?: string
          municipio?: string | null
          nif?: string | null
          nif_cif?: string | null
          nombre?: string | null
          notas?: string | null
          observaciones?: string | null
          observaciones_2025?: string | null
          p6_p7?: string | null
          poblacion?: string | null
          provincia?: string | null
          razon_social?: string | null
          registra?: boolean
          subvencion?: boolean
          telefono?: string | null
          telefono_1?: string | null
          telefono_2?: string | null
          tipo?: Database["public"]["Enums"]["socio_tipo"]
          traspaso?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "socios_cooperative_id_fkey"
            columns: ["cooperative_id"]
            isOneToOne: false
            referencedRelation: "cooperatives"
            referencedColumns: ["id"]
          },
        ]
      }
      socio_user_access: {
        Row: {
          cooperative_id: string
          created_at: string
          id: string
          invited_by: string | null
          socio_id: string
          status: Database["public"]["Enums"]["socio_user_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          cooperative_id: string
          created_at?: string
          id?: string
          invited_by?: string | null
          socio_id: string
          status?: Database["public"]["Enums"]["socio_user_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          cooperative_id?: string
          created_at?: string
          id?: string
          invited_by?: string | null
          socio_id?: string
          status?: Database["public"]["Enums"]["socio_user_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "socio_user_access_cooperative_id_fkey"
            columns: ["cooperative_id"]
            isOneToOne: false
            referencedRelation: "cooperatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "socio_user_access_socio_coop_fkey"
            columns: ["socio_id", "cooperative_id"]
            isOneToOne: false
            referencedRelation: "socios"
            referencedColumns: ["id", "cooperative_id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          preference_key: string
          updated_at: string
          user_id: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          preference_key: string
          updated_at?: string
          user_id: string
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          preference_key?: string
          updated_at?: string
          user_id?: string
          value?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_cooperative: {
        Args: { _cif?: string; _nombre: string }
        Returns: string
      }
      has_org_role: {
        Args: {
          _cooperative_id: string
          _roles: Database["public"]["Enums"]["org_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_member: {
        Args: { _cooperative_id: string; _user_id: string }
        Returns: boolean
      }
      is_socio_user: {
        Args: { _socio_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      org_role: "admin" | "gestor" | "consulta"
      socio_tipo: "persona_fisica" | "persona_juridica"
      socio_user_status: "active" | "invited" | "disabled"
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
    ? DatabaseWithoutInternals["public"]["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      org_role: ["admin", "gestor", "consulta"],
      socio_tipo: ["persona_fisica", "persona_juridica"],
      socio_user_status: ["active", "invited", "disabled"],
    },
  },
} as const
