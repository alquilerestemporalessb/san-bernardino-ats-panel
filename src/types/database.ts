/**
 * Tipos de la base de datos, a mano.
 * Sigue la forma que genera `supabase gen types typescript` para que
 * @supabase/supabase-js pueda inferir correctamente los tipos de cada query
 * (incluidos los selects anidados via Relationships, ej. properties -> property_photos).
 * Si el esquema crece mucho mas, conviene migrar a tipos generados de verdad.
 */
export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string;
          code: string;
          name: string;
          capacity: number;
          zone: string;
          description: string | null;
          whatsapp_message: string | null;
          verified: boolean;
          active: boolean;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          capacity: number;
          zone: string;
          description?: string | null;
          whatsapp_message?: string | null;
          verified?: boolean;
          active?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          capacity?: number;
          zone?: string;
          description?: string | null;
          whatsapp_message?: string | null;
          verified?: boolean;
          active?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      property_photos: {
        Row: {
          id: string;
          property_id: string;
          url: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          url: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          url?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_photos_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      property_blocked_dates: {
        Row: {
          id: string;
          property_id: string;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          date?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_blocked_dates_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Property = Database["public"]["Tables"]["properties"]["Row"];
export type PropertyPhoto = Database["public"]["Tables"]["property_photos"]["Row"];
export type PropertyBlockedDate = Database["public"]["Tables"]["property_blocked_dates"]["Row"];
export type PropertyWithPhotos = Property & { property_photos: PropertyPhoto[] };
