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
      article_symbol_options: {
        Row: {
          article_name: string
          created_at: string
          description: string | null
          symbols: string[] | null
        }
        Insert: {
          article_name: string
          created_at?: string
          description?: string | null
          symbols?: string[] | null
        }
        Update: {
          article_name?: string
          created_at?: string
          description?: string | null
          symbols?: string[] | null
        }
        Relationships: []
      }
      curve_data: {
        Row: {
          complete: boolean
          created_at: string
          id: number
          mint: string
          real_sol_reserves: number
          real_token_reserves: number
          user: string | null
          virtual_sol_reserves: number
          virtual_token_reserves: number
        }
        Insert: {
          complete?: boolean
          created_at?: string
          id?: number
          mint: string
          real_sol_reserves: number
          real_token_reserves: number
          user?: string | null
          virtual_sol_reserves: number
          virtual_token_reserves: number
        }
        Update: {
          complete?: boolean
          created_at?: string
          id?: number
          mint?: string
          real_sol_reserves?: number
          real_token_reserves?: number
          user?: string | null
          virtual_sol_reserves?: number
          virtual_token_reserves?: number
        }
        Relationships: [
          {
            foreignKeyName: "curve_data_mint_fkey"
            columns: ["mint"]
            isOneToOne: false
            referencedRelation: "token_metadata"
            referencedColumns: ["mint"]
          },
        ]
      }
      mint_article_name: {
        Row: {
          article_name: string
          created_at: string
          id: number
          mint: string
        }
        Insert: {
          article_name: string
          created_at?: string
          id?: number
          mint: string
        }
        Update: {
          article_name?: string
          created_at?: string
          id?: number
          mint?: string
        }
        Relationships: [
          {
            foreignKeyName: "mint_article_name_article_name_fkey"
            columns: ["article_name"]
            isOneToOne: false
            referencedRelation: "token_metadata"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "mint_article_name_mint_fkey"
            columns: ["mint"]
            isOneToOne: false
            referencedRelation: "token_metadata"
            referencedColumns: ["mint"]
          },
        ]
      }
      sol_price_usd: {
        Row: {
          created_at: string
          id: number
          price_usd: number
        }
        Insert: {
          created_at?: string
          id?: number
          price_usd: number
        }
        Update: {
          created_at?: string
          id?: number
          price_usd?: number
        }
        Relationships: []
      }
      token_metadata: {
        Row: {
          complete: boolean | null
          created_at: string
          creator: string
          decimals: number
          description: string | null
          id: number
          mint: string
          name: string
          start_slot: number
          supply: number
          symbol: string
          uri: string
        }
        Insert: {
          complete?: boolean | null
          created_at?: string
          creator: string
          decimals: number
          description?: string | null
          id?: number
          mint: string
          name: string
          start_slot: number
          supply: number
          symbol: string
          uri: string
        }
        Update: {
          complete?: boolean | null
          created_at?: string
          creator?: string
          decimals?: number
          description?: string | null
          id?: number
          mint?: string
          name?: string
          start_slot?: number
          supply?: number
          symbol?: string
          uri?: string
        }
        Relationships: []
      }
      token_price_usd: {
        Row: {
          created_at: string
          id: number
          mint: string
          price_usd: number
        }
        Insert: {
          created_at?: string
          id?: number
          mint: string
          price_usd: number
        }
        Update: {
          created_at?: string
          id?: number
          mint?: string
          price_usd?: number
        }
        Relationships: [
          {
            foreignKeyName: "token_price_usd_mint_fkey"
            columns: ["mint"]
            isOneToOne: false
            referencedRelation: "token_metadata"
            referencedColumns: ["mint"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_latest_prices: {
        Args: Record<PropertyKey, never>
        Returns: {
          mint: string
          price_usd: number
        }[]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
