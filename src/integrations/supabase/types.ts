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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      annual_preventive_schedule: {
        Row: {
          completed_date: string | null
          created_at: string | null
          due_date: string | null
          equipment_id: string
          id: string
          maintenance_order_id: string | null
          month: number
          status: string | null
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          completed_date?: string | null
          created_at?: string | null
          due_date?: string | null
          equipment_id: string
          id?: string
          maintenance_order_id?: string | null
          month: number
          status?: string | null
          updated_at?: string | null
          user_id: string
          year: number
        }
        Update: {
          completed_date?: string | null
          created_at?: string | null
          due_date?: string | null
          equipment_id?: string
          id?: string
          maintenance_order_id?: string | null
          month?: number
          status?: string | null
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "annual_preventive_schedule_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "annual_preventive_schedule_maintenance_order_id_fkey"
            columns: ["maintenance_order_id"]
            isOneToOne: false
            referencedRelation: "maintenance_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      client_access: {
        Row: {
          access_code: string
          client_id: string
          created_at: string
          id: string
          is_active: boolean
          permissions: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          access_code: string
          client_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          permissions?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          access_code?: string
          client_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          permissions?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      client_sessions: {
        Row: {
          access_code: string
          client_access_id: string
          client_id: string
          id: string
          is_active: boolean
          last_activity: string
          started_at: string
        }
        Insert: {
          access_code: string
          client_access_id: string
          client_id: string
          id?: string
          is_active?: boolean
          last_activity?: string
          started_at?: string
        }
        Update: {
          access_code?: string
          client_access_id?: string
          client_id?: string
          id?: string
          is_active?: boolean
          last_activity?: string
          started_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          cnpj: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          state: string | null
          status: string | null
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      equipments: {
        Row: {
          brand: string | null
          capacity: string | null
          client: string | null
          client_id: string | null
          created_at: string
          id: string
          installation_location: string | null
          maintenance_status: string | null
          model: string | null
          name: string
          preventive_periodicity: string | null
          qr_code: string | null
          serial_number: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          capacity?: string | null
          client?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          installation_location?: string | null
          maintenance_status?: string | null
          model?: string | null
          name: string
          preventive_periodicity?: string | null
          qr_code?: string | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string | null
          capacity?: string | null
          client?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          installation_location?: string | null
          maintenance_status?: string | null
          model?: string | null
          name?: string
          preventive_periodicity?: string | null
          qr_code?: string | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      field_sessions: {
        Row: {
          access_code: string
          id: string
          is_active: boolean
          last_activity: string
          started_at: string
          technician_id: string
        }
        Insert: {
          access_code: string
          id?: string
          is_active?: boolean
          last_activity?: string
          started_at?: string
          technician_id: string
        }
        Update: {
          access_code?: string
          id?: string
          is_active?: boolean
          last_activity?: string
          started_at?: string
          technician_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "field_sessions_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "field_technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      field_technicians: {
        Row: {
          access_code: string
          created_at: string
          email: string
          id: string
          is_active: boolean
          name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_code: string
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_code?: string
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      maintenance_attachments: {
        Row: {
          comment: string | null
          created_at: string | null
          file_name: string
          file_path: string
          file_type: string
          id: string
          maintenance_order_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          file_name: string
          file_path: string
          file_type: string
          id?: string
          maintenance_order_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
          maintenance_order_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_attachments_maintenance_order_id_fkey"
            columns: ["maintenance_order_id"]
            isOneToOne: false
            referencedRelation: "maintenance_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_executions: {
        Row: {
          attachments: Json | null
          checklist_items: Json | null
          created_at: string
          digital_signature: string
          end_datetime: string
          equipment_id: string | null
          id: string
          maintenance_order_id: string | null
          maintenance_type: string
          observations: string
          periodicity: string | null
          start_datetime: string
          technician_signature: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attachments?: Json | null
          checklist_items?: Json | null
          created_at?: string
          digital_signature: string
          end_datetime: string
          equipment_id?: string | null
          id?: string
          maintenance_order_id?: string | null
          maintenance_type: string
          observations: string
          periodicity?: string | null
          start_datetime: string
          technician_signature: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attachments?: Json | null
          checklist_items?: Json | null
          created_at?: string
          digital_signature?: string
          end_datetime?: string
          equipment_id?: string | null
          id?: string
          maintenance_order_id?: string | null
          maintenance_type?: string
          observations?: string
          periodicity?: string | null
          start_datetime?: string
          technician_signature?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      maintenance_orders: {
        Row: {
          client_id: string | null
          created_at: string
          description: string
          equipment_id: string | null
          id: string
          maintenance_type: string | null
          order_number: string | null
          priority: string | null
          scheduled_date: string | null
          status: string | null
          technician_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description: string
          equipment_id?: string | null
          id?: string
          maintenance_type?: string | null
          order_number?: string | null
          priority?: string | null
          scheduled_date?: string | null
          status?: string | null
          technician_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string
          equipment_id?: string | null
          id?: string
          maintenance_type?: string | null
          order_number?: string | null
          priority?: string | null
          scheduled_date?: string | null
          status?: string | null
          technician_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_orders_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_orders_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_periodicities: {
        Row: {
          checklist_template: Json | null
          code: string
          created_at: string
          id: string
          interval_days: number
          is_default: boolean
          maintenance_type: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          checklist_template?: Json | null
          code: string
          created_at?: string
          id?: string
          interval_days: number
          is_default?: boolean
          maintenance_type?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          checklist_template?: Json | null
          code?: string
          created_at?: string
          id?: string
          interval_days?: number
          is_default?: boolean
          maintenance_type?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      maintenance_schedules: {
        Row: {
          created_at: string
          custom_interval_days: number | null
          equipment_id: string
          id: string
          is_active: boolean
          last_maintenance_date: string | null
          maintenance_type: string
          next_maintenance_date: string
          notes: string | null
          periodicity: string
          technician_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_interval_days?: number | null
          equipment_id: string
          id?: string
          is_active?: boolean
          last_maintenance_date?: string | null
          maintenance_type?: string
          next_maintenance_date: string
          notes?: string | null
          periodicity: string
          technician_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_interval_days?: number | null
          equipment_id?: string
          id?: string
          is_active?: boolean
          last_maintenance_date?: string | null
          maintenance_type?: string
          next_maintenance_date?: string
          notes?: string | null
          periodicity?: string
          technician_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_schedules_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_schedules_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          brand: string | null
          category: string | null
          created_at: string
          id: string
          internal_code: string | null
          model: string | null
          name: string
          photo_url: string | null
          physical_location: string | null
          stock_quantity: number | null
          supplier: string | null
          supplier_id: string | null
          technical_description: string | null
          unit_of_measure: string | null
          unit_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand?: string | null
          category?: string | null
          created_at?: string
          id?: string
          internal_code?: string | null
          model?: string | null
          name: string
          photo_url?: string | null
          physical_location?: string | null
          stock_quantity?: number | null
          supplier?: string | null
          supplier_id?: string | null
          technical_description?: string | null
          unit_of_measure?: string | null
          unit_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand?: string | null
          category?: string | null
          created_at?: string
          id?: string
          internal_code?: string | null
          model?: string | null
          name?: string
          photo_url?: string | null
          physical_location?: string | null
          stock_quantity?: number | null
          supplier?: string | null
          supplier_id?: string | null
          technical_description?: string | null
          unit_of_measure?: string | null
          unit_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "materials_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_items: {
        Row: {
          attachments: Json | null
          client_id: string
          created_at: string
          description: string | null
          id: string
          moved_at: string | null
          service_proposal_id: string | null
          stage_data: Json | null
          stage_id: string
          title: string
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          attachments?: Json | null
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          moved_at?: string | null
          service_proposal_id?: string | null
          stage_data?: Json | null
          stage_id: string
          title: string
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          attachments?: Json | null
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          moved_at?: string | null
          service_proposal_id?: string | null
          stage_data?: Json | null
          stage_id?: string
          title?: string
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pipeline_items_client_id"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pipeline_items_service_proposal_id"
            columns: ["service_proposal_id"]
            isOneToOne: false
            referencedRelation: "service_proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pipeline_items_stage_id"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          required_fields: Json | null
          stage_order: number
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          required_fields?: Json | null
          stage_order: number
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          required_fields?: Json | null
          stage_order?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      plans: {
        Row: {
          created_at: string
          features: Json
          id: string
          is_active: boolean
          max_equipments: number
          max_technicians: number
          name: string
          period: string
          price: number
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          max_equipments: number
          max_technicians: number
          name: string
          period?: string
          price: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          is_active?: boolean
          max_equipments?: number
          max_technicians?: number
          name?: string
          period?: string
          price?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      proposal_materials: {
        Row: {
          created_at: string
          id: string
          material_id: string | null
          proposal_id: string | null
          quantity: number | null
          total_price: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          material_id?: string | null
          proposal_id?: string | null
          quantity?: number | null
          total_price?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string | null
          proposal_id?: string | null
          quantity?: number | null
          total_price?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_materials_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "service_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_services: {
        Row: {
          created_at: string
          id: string
          proposal_id: string | null
          quantity: number | null
          service_id: string | null
          total_price: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          proposal_id?: string | null
          quantity?: number | null
          service_id?: string | null
          total_price?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          proposal_id?: string | null
          quantity?: number | null
          service_id?: string | null
          total_price?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_services_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "service_proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          attachment_url: string | null
          client_id: string | null
          client_signature: string | null
          created_at: string
          description: string | null
          equipment_id: string | null
          id: string
          photos: Json | null
          report_date: string
          technician_id: string | null
          technician_signature: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attachment_url?: string | null
          client_id?: string | null
          client_signature?: string | null
          created_at?: string
          description?: string | null
          equipment_id?: string | null
          id?: string
          photos?: Json | null
          report_date?: string
          technician_id?: string | null
          technician_signature?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attachment_url?: string | null
          client_id?: string | null
          client_signature?: string | null
          created_at?: string
          description?: string | null
          equipment_id?: string | null
          id?: string
          photos?: Json | null
          report_date?: string
          technician_id?: string | null
          technician_signature?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      service_calls: {
        Row: {
          call_number: string
          client_id: string
          client_notes: string | null
          created_at: string
          description: string | null
          equipment_id: string
          id: string
          internal_notes: string | null
          maintenance_order_id: string | null
          opened_by_client: boolean
          photos: Json | null
          priority: string
          problem_types: string[]
          resolved_at: string | null
          status: string
          technician_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          call_number: string
          client_id: string
          client_notes?: string | null
          created_at?: string
          description?: string | null
          equipment_id: string
          id?: string
          internal_notes?: string | null
          maintenance_order_id?: string | null
          opened_by_client?: boolean
          photos?: Json | null
          priority?: string
          problem_types?: string[]
          resolved_at?: string | null
          status?: string
          technician_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          call_number?: string
          client_id?: string
          client_notes?: string | null
          created_at?: string
          description?: string | null
          equipment_id?: string
          id?: string
          internal_notes?: string | null
          maintenance_order_id?: string | null
          opened_by_client?: boolean
          photos?: Json | null
          priority?: string
          problem_types?: string[]
          resolved_at?: string | null
          status?: string
          technician_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_calls_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_calls_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipments"
            referencedColumns: ["id"]
          },
        ]
      }
      service_materials: {
        Row: {
          created_at: string
          id: string
          material_id: string | null
          quantity: number | null
          service_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          material_id?: string | null
          quantity?: number | null
          service_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string | null
          quantity?: number | null
          service_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_materials_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_proposals: {
        Row: {
          client_id: string | null
          client_signature: string | null
          company_address: string | null
          company_email: string | null
          company_logo: string | null
          company_name: string | null
          company_phone: string | null
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          end_date: string | null
          equipment_id: string | null
          estimated_duration: number | null
          executor_name: string | null
          executor_title: string | null
          id: string
          labor_cost: number
          materials: Json | null
          materials_cost: number
          notes: string | null
          payment_method: string | null
          photos: Json | null
          proposal_number: string
          scope_of_work: string
          services: Json | null
          start_date: string | null
          status: string
          technician_signature: string | null
          terms_and_conditions: string | null
          title: string
          total_cost: number
          updated_at: string | null
          user_id: string
          validity_days: number
        }
        Insert: {
          client_id?: string | null
          client_signature?: string | null
          company_address?: string | null
          company_email?: string | null
          company_logo?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          end_date?: string | null
          equipment_id?: string | null
          estimated_duration?: number | null
          executor_name?: string | null
          executor_title?: string | null
          id?: string
          labor_cost?: number
          materials?: Json | null
          materials_cost?: number
          notes?: string | null
          payment_method?: string | null
          photos?: Json | null
          proposal_number: string
          scope_of_work: string
          services?: Json | null
          start_date?: string | null
          status?: string
          technician_signature?: string | null
          terms_and_conditions?: string | null
          title: string
          total_cost?: number
          updated_at?: string | null
          user_id: string
          validity_days?: number
        }
        Update: {
          client_id?: string | null
          client_signature?: string | null
          company_address?: string | null
          company_email?: string | null
          company_logo?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          end_date?: string | null
          equipment_id?: string | null
          estimated_duration?: number | null
          executor_name?: string | null
          executor_title?: string | null
          id?: string
          labor_cost?: number
          materials?: Json | null
          materials_cost?: number
          notes?: string | null
          payment_method?: string | null
          photos?: Json | null
          proposal_number?: string
          scope_of_work?: string
          services?: Json | null
          start_date?: string | null
          status?: string
          technician_signature?: string | null
          terms_and_conditions?: string | null
          title?: string
          total_cost?: number
          updated_at?: string | null
          user_id?: string
          validity_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_proposals_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipments"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          base_price: number | null
          complexity_level: string | null
          created_at: string
          description: string | null
          estimated_time: number | null
          id: string
          name: string
          recommended_team: string | null
          service_type: string | null
          supplier_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          base_price?: number | null
          complexity_level?: string | null
          created_at?: string
          description?: string | null
          estimated_time?: number | null
          id?: string
          name: string
          recommended_team?: string | null
          service_type?: string | null
          supplier_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          base_price?: number | null
          complexity_level?: string | null
          created_at?: string
          description?: string | null
          estimated_time?: number | null
          id?: string
          name?: string
          recommended_team?: string | null
          service_type?: string | null
          supplier_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          days_remaining: number | null
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          trial_end: string | null
          trial_expired: boolean | null
          trial_start: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          days_remaining?: number | null
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          trial_end?: string | null
          trial_expired?: boolean | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          days_remaining?: number | null
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          trial_end?: string | null
          trial_expired?: boolean | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          city: string | null
          cnpj: string | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string
          id: string
          name: string
          neighborhood: string | null
          notes: string | null
          state: string | null
          status: string | null
          supply_types: string[] | null
          updated_at: string
          user_id: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name: string
          neighborhood?: string | null
          notes?: string | null
          state?: string | null
          status?: string | null
          supply_types?: string[] | null
          updated_at?: string
          user_id: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name?: string
          neighborhood?: string | null
          notes?: string | null
          state?: string | null
          status?: string | null
          supply_types?: string[] | null
          updated_at?: string
          user_id?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      technicians: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          specialization: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          specialization?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          specialization?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          brand_accent_color: string | null
          brand_primary_color: string | null
          brand_secondary_color: string | null
          client_id: string | null
          cnpj: string | null
          company_address: string | null
          company_cep: string | null
          company_email: string | null
          company_logo_url: string | null
          company_name: string | null
          created_at: string | null
          department: string | null
          full_name: string | null
          id: string
          phone: string | null
          position: string | null
          profile_photo_url: string | null
          role: string | null
          settings: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brand_accent_color?: string | null
          brand_primary_color?: string | null
          brand_secondary_color?: string | null
          client_id?: string | null
          cnpj?: string | null
          company_address?: string | null
          company_cep?: string | null
          company_email?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string | null
          department?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          position?: string | null
          profile_photo_url?: string | null
          role?: string | null
          settings?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brand_accent_color?: string | null
          brand_primary_color?: string | null
          brand_secondary_color?: string | null
          client_id?: string | null
          cnpj?: string | null
          company_address?: string | null
          company_cep?: string | null
          company_email?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string | null
          department?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          position?: string | null
          profile_photo_url?: string | null
          role?: string | null
          settings?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_maintenance_attachment: {
        Args: {
          comment: string
          file_name: string
          file_path: string
          file_type: string
          maintenance_order_id: string
          technician_id: string
        }
        Returns: undefined
      }
      authenticate_client: {
        Args: { input_access_code: string }
        Returns: {
          client_access_id: string
          client_id: string
          client_name: string
          is_active: boolean
          permissions: Json
        }[]
      }
      authenticate_field_technician: {
        Args: { input_access_code: string }
        Returns: {
          email: string
          is_active: boolean
          name: string
          technician_id: string
        }[]
      }
      calculate_trial_days: {
        Args: { trial_end_date: string }
        Returns: number
      }
      create_field_maintenance: {
        Args: {
          checklist_items: Json
          digital_signature: string
          end_datetime: string
          equipment_id: string
          maintenance_type: string
          observations: string
          periodicity: string
          start_datetime: string
          technician_id: string
          technician_signature: string
        }
        Returns: {
          maintenance_order_id: string
        }[]
      }
      create_service_call: {
        Args: {
          p_client_id: string
          p_client_notes?: string
          p_description?: string
          p_equipment_id: string
          p_photos?: Json
          p_problem_types: string[]
        }
        Returns: {
          call_id: string
          call_number: string
          status: string
        }[]
      }
      generate_annual_preventive_schedule: {
        Args: { target_year?: number }
        Returns: undefined
      }
      generate_call_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_maintenance_orders_from_schedule: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_all_clients_for_field: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string
          city: string
          cnpj: string
          contact_person: string
          created_at: string
          email: string
          id: string
          name: string
          notes: string
          phone: string
          state: string
          status: string
          updated_at: string
          user_id: string
          zip_code: string
        }[]
      }
      get_all_equipments_for_field: {
        Args: Record<PropertyKey, never>
        Returns: {
          brand: string
          capacity: string
          client: string
          client_id: string
          created_at: string
          id: string
          installation_location: string
          model: string
          name: string
          preventive_periodicity: string
          qr_code: string
          serial_number: string
          status: string
          updated_at: string
          user_id: string
        }[]
      }
      get_client_comparison_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          client_id: string
          client_name: string
          completed_on_time_percentage: number
          compliance_score: number
          monthly_orders: number
          overdue_maintenances: number
          reports_generated: number
          total_equipments: number
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_field_technician_owner: {
        Args: { technician_id: string }
        Returns: string
      }
      get_maintained_equipment_ids_today_for_field: {
        Args: { technician_id: string }
        Returns: {
          equipment_id: string
        }[]
      }
      get_maintenance_history_for_field: {
        Args: Record<PropertyKey, never>
        Returns: {
          attachments: Json
          checklist_items: Json
          client_name: string
          created_at: string
          description: string
          digital_signature: string
          equipment_id: string
          equipment_name: string
          execution_id: string
          id: string
          maintenance_type: string
          observations: string
          scheduled_date: string
          status: string
          technician_signature: string
          updated_at: string
        }[]
      }
      reset_annual_preventive_schedule: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      start_client_session: {
        Args: { input_access_code: string }
        Returns: string
      }
      start_field_session: {
        Args: { input_access_code: string }
        Returns: string
      }
      update_equipment_maintenance_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      validate_client_session: {
        Args: { session_access_code: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
