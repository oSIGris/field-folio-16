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
      ai_action_proposals: {
        Row: {
          conversation_id: string | null
          cooperative_id: string
          created_at: string
          decided_at: string | null
          decided_by: string | null
          description: string | null
          id: string
          kind: string
          message_id: string | null
          payload: Json
          status: Database["public"]["Enums"]["ai_proposal_status"]
          title: string
          updated_at: string
        }
        Insert: {
          conversation_id?: string | null
          cooperative_id: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          description?: string | null
          id?: string
          kind: string
          message_id?: string | null
          payload?: Json
          status?: Database["public"]["Enums"]["ai_proposal_status"]
          title: string
          updated_at?: string
        }
        Update: {
          conversation_id?: string | null
          cooperative_id?: string
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          description?: string | null
          id?: string
          kind?: string
          message_id?: string | null
          payload?: Json
          status?: Database["public"]["Enums"]["ai_proposal_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          archived_at: string | null
          cooperative_id: string
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          cooperative_id: string
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          cooperative_id?: string
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          cooperative_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content?: string
          conversation_id: string
          cooperative_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          cooperative_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      aid_applications: {
        Row: {
          aid_type_id: string | null
          archived_at: string | null
          archived_by: string | null
          assigned_to: string | null
          campaign_id: string | null
          cooperative_id: string
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          notes: string | null
          resolved_at: string | null
          socio_id: string
          status: Database["public"]["Enums"]["aid_application_status"]
          submitted_at: string | null
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          aid_type_id?: string | null
          archived_at?: string | null
          archived_by?: string | null
          assigned_to?: string | null
          campaign_id?: string | null
          cooperative_id: string
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          resolved_at?: string | null
          socio_id: string
          status?: Database["public"]["Enums"]["aid_application_status"]
          submitted_at?: string | null
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          aid_type_id?: string | null
          archived_at?: string | null
          archived_by?: string | null
          assigned_to?: string | null
          campaign_id?: string | null
          cooperative_id?: string
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          resolved_at?: string | null
          socio_id?: string
          status?: Database["public"]["Enums"]["aid_application_status"]
          submitted_at?: string | null
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      aid_campaigns: {
        Row: {
          active: boolean
          archived_at: string | null
          archived_by: string | null
          cooperative_id: string
          created_at: string
          created_by: string | null
          ends_on: string | null
          id: string
          name: string
          starts_on: string | null
          updated_at: string
          year: number | null
        }
        Insert: {
          active?: boolean
          archived_at?: string | null
          archived_by?: string | null
          cooperative_id: string
          created_at?: string
          created_by?: string | null
          ends_on?: string | null
          id?: string
          name: string
          starts_on?: string | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          active?: boolean
          archived_at?: string | null
          archived_by?: string | null
          cooperative_id?: string
          created_at?: string
          created_by?: string | null
          ends_on?: string | null
          id?: string
          name?: string
          starts_on?: string | null
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      aid_types: {
        Row: {
          active: boolean
          archived_at: string | null
          archived_by: string | null
          code: string | null
          cooperative_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          archived_at?: string | null
          archived_by?: string | null
          code?: string | null
          cooperative_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          archived_at?: string | null
          archived_by?: string | null
          code?: string | null
          cooperative_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      automation_rules: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          channel: string
          config: Json
          cooperative_id: string
          create_email_draft: boolean
          created_at: string
          created_by: string | null
          days_before: number
          id: string
          last_run_at: string | null
          name: string
          rule_type: Database["public"]["Enums"]["automation_rule_type"]
          status: Database["public"]["Enums"]["automation_rule_status"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          channel?: string
          config?: Json
          cooperative_id: string
          create_email_draft?: boolean
          created_at?: string
          created_by?: string | null
          days_before?: number
          id?: string
          last_run_at?: string | null
          name: string
          rule_type: Database["public"]["Enums"]["automation_rule_type"]
          status?: Database["public"]["Enums"]["automation_rule_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          channel?: string
          config?: Json
          cooperative_id?: string
          create_email_draft?: boolean
          created_at?: string
          created_by?: string | null
          days_before?: number
          id?: string
          last_run_at?: string | null
          name?: string
          rule_type?: Database["public"]["Enums"]["automation_rule_type"]
          status?: Database["public"]["Enums"]["automation_rule_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      automation_runs: {
        Row: {
          cooperative_id: string
          created_at: string
          id: string
          ran_at: string
          result: Json
          rule_id: string
          status: string
        }
        Insert: {
          cooperative_id: string
          created_at?: string
          id?: string
          ran_at?: string
          result?: Json
          rule_id: string
          status?: string
        }
        Update: {
          cooperative_id?: string
          created_at?: string
          id?: string
          ran_at?: string
          result?: Json
          rule_id?: string
          status?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          aid_application_id: string | null
          all_day: boolean
          archived_at: string | null
          archived_by: string | null
          cooperative_id: string
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          event_type: Database["public"]["Enums"]["calendar_event_type"]
          id: string
          socio_id: string | null
          starts_at: string
          title: string
          updated_at: string
        }
        Insert: {
          aid_application_id?: string | null
          all_day?: boolean
          archived_at?: string | null
          archived_by?: string | null
          cooperative_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          event_type?: Database["public"]["Enums"]["calendar_event_type"]
          id?: string
          socio_id?: string | null
          starts_at: string
          title: string
          updated_at?: string
        }
        Update: {
          aid_application_id?: string | null
          all_day?: boolean
          archived_at?: string | null
          archived_by?: string | null
          cooperative_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          event_type?: Database["public"]["Enums"]["calendar_event_type"]
          id?: string
          socio_id?: string | null
          starts_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      custom_field_values: {
        Row: {
          aid_application_id: string | null
          cooperative_id: string
          created_at: string
          custom_field_id: string
          id: string
          socio_id: string | null
          updated_at: string
          updated_by: string | null
          value_boolean: boolean | null
          value_date: string | null
          value_json: Json | null
          value_number: number | null
          value_text: string | null
        }
        Insert: {
          aid_application_id?: string | null
          cooperative_id: string
          created_at?: string
          custom_field_id: string
          id?: string
          socio_id?: string | null
          updated_at?: string
          updated_by?: string | null
          value_boolean?: boolean | null
          value_date?: string | null
          value_json?: Json | null
          value_number?: number | null
          value_text?: string | null
        }
        Update: {
          aid_application_id?: string | null
          cooperative_id?: string
          created_at?: string
          custom_field_id?: string
          id?: string
          socio_id?: string | null
          updated_at?: string
          updated_by?: string | null
          value_boolean?: boolean | null
          value_date?: string | null
          value_json?: Json | null
          value_number?: number | null
          value_text?: string | null
        }
        Relationships: []
      }
      custom_fields: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          cooperative_id: string
          created_at: string
          created_by: string | null
          description: string | null
          field_type: Database["public"]["Enums"]["custom_field_type"]
          id: string
          key: string
          name: string
          options: Json
          required: boolean
          scope: Database["public"]["Enums"]["custom_field_scope"]
          sort_order: number
          updated_at: string
          visible: boolean
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          cooperative_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          field_type?: Database["public"]["Enums"]["custom_field_type"]
          id?: string
          key: string
          name: string
          options?: Json
          required?: boolean
          scope: Database["public"]["Enums"]["custom_field_scope"]
          sort_order?: number
          updated_at?: string
          visible?: boolean
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          cooperative_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          field_type?: Database["public"]["Enums"]["custom_field_type"]
          id?: string
          key?: string
          name?: string
          options?: Json
          required?: boolean
          scope?: Database["public"]["Enums"]["custom_field_scope"]
          sort_order?: number
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      email_drafts: {
        Row: {
          archived_at: string | null
          body: string
          cooperative_id: string
          created_at: string
          created_by: string | null
          id: string
          recipient: string | null
          socio_id: string | null
          status: Database["public"]["Enums"]["email_draft_status"]
          subject: string
          task_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          archived_at?: string | null
          body?: string
          cooperative_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          recipient?: string | null
          socio_id?: string | null
          status?: Database["public"]["Enums"]["email_draft_status"]
          subject?: string
          task_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          archived_at?: string | null
          body?: string
          cooperative_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          recipient?: string | null
          socio_id?: string | null
          status?: Database["public"]["Enums"]["email_draft_status"]
          subject?: string
          task_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          archived_at: string | null
          archived_by: string | null
          body: string
          cooperative_id: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          subject: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          archived_by?: string | null
          body?: string
          cooperative_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          subject?: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          archived_by?: string | null
          body?: string
          cooperative_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          cooperative_id: string
          created_at: string
          id: string
          link: string | null
          read: boolean
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          cooperative_id: string
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          cooperative_id?: string
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          read_at?: string | null
          title?: string
          user_id?: string
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
      saved_views: {
        Row: {
          config: Json
          cooperative_id: string
          created_at: string
          id: string
          name: string
          shared_with_cooperative: boolean
          table_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          config?: Json
          cooperative_id: string
          created_at?: string
          id?: string
          name: string
          shared_with_cooperative?: boolean
          table_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          cooperative_id?: string
          created_at?: string
          id?: string
          name?: string
          shared_with_cooperative?: boolean
          table_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      tasks: {
        Row: {
          aid_application_id: string | null
          archived_at: string | null
          archived_by: string | null
          assigned_to: string | null
          completed_at: string | null
          cooperative_id: string
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"]
          reminder_at: string | null
          socio_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          aid_application_id?: string | null
          archived_at?: string | null
          archived_by?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          cooperative_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          reminder_at?: string | null
          socio_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          aid_application_id?: string | null
          archived_at?: string | null
          archived_by?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          cooperative_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"]
          reminder_at?: string | null
          socio_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
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
      ai_proposal_status: "pending" | "accepted" | "rejected" | "executed"
      aid_application_status:
        | "pendiente"
        | "en_revision"
        | "falta_documentacion"
        | "presentado"
        | "subsanacion"
        | "aprobado"
        | "rechazado"
        | "finalizado"
      automation_rule_status: "activa" | "pausada" | "archivada"
      automation_rule_type:
        | "avisar_antes"
        | "falta_documentacion"
        | "expediente_parado"
        | "subvencion_sin_expediente"
        | "fecha_aviso_socio"
      calendar_event_type:
        | "vencimiento"
        | "recordatorio"
        | "cita"
        | "llamada"
        | "interno"
      custom_field_scope: "socio" | "aid_application"
      custom_field_type:
        | "text"
        | "number"
        | "date"
        | "boolean"
        | "select"
        | "multiselect"
        | "currency"
        | "percentage"
        | "long_text"
      email_draft_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "cancelled"
        | "sent"
      org_role: "admin" | "gestor" | "consulta"
      socio_tipo: "persona_fisica" | "persona_juridica"
      socio_user_status: "active" | "invited" | "disabled"
      task_priority: "baja" | "normal" | "alta" | "urgente"
      task_status:
        | "pendiente"
        | "en_curso"
        | "bloqueada"
        | "hecha"
        | "cancelada"
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
      ai_proposal_status: ["pending", "accepted", "rejected", "executed"],
      aid_application_status: [
        "pendiente",
        "en_revision",
        "falta_documentacion",
        "presentado",
        "subsanacion",
        "aprobado",
        "rechazado",
        "finalizado",
      ],
      automation_rule_status: ["activa", "pausada", "archivada"],
      automation_rule_type: [
        "avisar_antes",
        "falta_documentacion",
        "expediente_parado",
        "subvencion_sin_expediente",
        "fecha_aviso_socio",
      ],
      calendar_event_type: [
        "vencimiento",
        "recordatorio",
        "cita",
        "llamada",
        "interno",
      ],
      custom_field_scope: ["socio", "aid_application"],
      custom_field_type: [
        "text",
        "number",
        "date",
        "boolean",
        "select",
        "multiselect",
        "currency",
        "percentage",
        "long_text",
      ],
      email_draft_status: [
        "draft",
        "pending_approval",
        "approved",
        "cancelled",
        "sent",
      ],
      org_role: ["admin", "gestor", "consulta"],
      socio_tipo: ["persona_fisica", "persona_juridica"],
      socio_user_status: ["active", "invited", "disabled"],
      task_priority: ["baja", "normal", "alta", "urgente"],
      task_status: ["pendiente", "en_curso", "bloqueada", "hecha", "cancelada"],
    },
  },
} as const
