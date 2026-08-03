/**
 * Tipos de la base de datos, a mano (v1 tiene una sola tabla).
 * Sigue la forma que genera `supabase gen types typescript` para que
 * @supabase/supabase-js pueda inferir correctamente los tipos de cada query.
 * Si el esquema crece, conviene migrar a tipos generados de verdad.
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
          photo_url: string | null;
          whatsapp_message: string | null;
          verified: boolean;
          active: boolean;
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
          photo_url?: string | null;
          whatsapp_message?: string | null;
          verified?: boolean;
          active?: boolean;
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
          photo_url?: string | null;
          whatsapp_message?: string | null;
          verified?: boolean;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Property = Database["public"]["Tables"]["properties"]["Row"];
