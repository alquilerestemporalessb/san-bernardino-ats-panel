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
          status: "disponible" | "reservada" | "alquilada_temporada";
          price_per_night: number | null;
          price_per_week: number | null;
          price_per_month: number | null;
          min_nights: number;
          bedrooms: number | null;
          beds: number | null;
          bathrooms: number | null;
          amenities: string[];
          tour_url: string | null;
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
          status?: "disponible" | "reservada" | "alquilada_temporada";
          price_per_night?: number | null;
          price_per_week?: number | null;
          price_per_month?: number | null;
          min_nights?: number;
          bedrooms?: number | null;
          beds?: number | null;
          bathrooms?: number | null;
          amenities?: string[];
          tour_url?: string | null;
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
          status?: "disponible" | "reservada" | "alquilada_temporada";
          price_per_night?: number | null;
          price_per_week?: number | null;
          price_per_month?: number | null;
          min_nights?: number;
          bedrooms?: number | null;
          beds?: number | null;
          bathrooms?: number | null;
          amenities?: string[];
          tour_url?: string | null;
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
      property_events: {
        Row: {
          id: string;
          property_id: string;
          event_type: "view" | "whatsapp_click";
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          event_type: "view" | "whatsapp_click";
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          event_type?: "view" | "whatsapp_click";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_events_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      property_owners: {
        Row: {
          property_id: string;
          owner_name: string;
          owner_contact: string | null;
          updated_at: string;
        };
        Insert: {
          property_id: string;
          owner_name: string;
          owner_contact?: string | null;
          updated_at?: string;
        };
        Update: {
          property_id?: string;
          owner_name?: string;
          owner_contact?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_owners_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: true;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      property_bookings: {
        Row: {
          id: string;
          property_id: string;
          guest_name: string;
          guest_contact: string | null;
          check_in: string;
          check_out: string;
          amount: number;
          commission_pct: number;
          status: "confirmada" | "cancelada";
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          guest_name: string;
          guest_contact?: string | null;
          check_in: string;
          check_out: string;
          amount: number;
          commission_pct?: number;
          status?: "confirmada" | "cancelada";
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          property_id?: string;
          guest_name?: string;
          guest_contact?: string | null;
          check_in?: string;
          check_out?: string;
          amount?: number;
          commission_pct?: number;
          status?: "confirmada" | "cancelada";
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "property_bookings_property_id_fkey";
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
export type PropertyStatus = Property["status"];
export type PropertyPhoto = Database["public"]["Tables"]["property_photos"]["Row"];
export type PropertyBlockedDate = Database["public"]["Tables"]["property_blocked_dates"]["Row"];
export type PropertyEvent = Database["public"]["Tables"]["property_events"]["Row"];
export type PropertyWithPhotos = Property & { property_photos: PropertyPhoto[] };
export type PropertyOwner = Database["public"]["Tables"]["property_owners"]["Row"];
export type Booking = Database["public"]["Tables"]["property_bookings"]["Row"];
export type BookingStatus = Booking["status"];
export type BookingWithProperty = Booking & { properties: Pick<Property, "code" | "name"> };
