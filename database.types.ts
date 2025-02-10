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
          symbols: string[] | null
        }
        Insert: {
          article_name: string
          created_at?: string
          symbols?: string[] | null
        }
        Update: {
          article_name?: string
          created_at?: string
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
      news_story: {
        Row: {
          article_names: string[] | null
          content: string
          created_at: string
          id: number
          image_id: string | null
        }
        Insert: {
          article_names?: string[] | null
          content: string
          created_at?: string
          id?: number
          image_id?: string | null
        }
        Update: {
          article_names?: string[] | null
          content?: string
          created_at?: string
          id?: number
          image_id?: string | null
        }
        Relationships: []
      }
      slot: {
        Row: {
          created_at: string
          id: number
          slot: number
        }
        Insert: {
          created_at?: string
          id?: number
          slot: number
        }
        Update: {
          created_at?: string
          id?: number
          slot?: number
        }
        Relationships: []
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
      swap: {
        Row: {
          created_at: string
          id: number
          is_buy: boolean
          mint: string
          sol_amount: number
          token_amount: number
          user_address: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_buy: boolean
          mint: string
          sol_amount: number
          token_amount: number
          user_address: string
        }
        Update: {
          created_at?: string
          id?: number
          is_buy?: boolean
          mint?: string
          sol_amount?: number
          token_amount?: number
          user_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "swap_mint_fkey"
            columns: ["mint"]
            isOneToOne: false
            referencedRelation: "token_metadata"
            referencedColumns: ["mint"]
          },
        ]
      }
      token_metadata: {
        Row: {
          complete: boolean | null
          created_at: string
          creator: string
          decimals: number
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
      trade_volume_12h: {
        Row: {
          mint: string
          total_volume: number
        }
        Insert: {
          mint: string
          total_volume: number
        }
        Update: {
          mint?: string
          total_volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "trade_volume_12h_mint_fkey"
            columns: ["mint"]
            isOneToOne: true
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
      get_price_changes: {
        Args: {
          target_mints: string[]
        }
        Returns: {
          mint: string
          current_price: number
          price_1h: number
          price_24h: number
          price_30d: number
        }[]
      }
      get_price_changes_2: {
        Args: {
          target_mint: string
        }
        Returns: {
          current_price: number
          price_change_1h: number
          price_change_24h: number
          price_change_30d: number
        }[]
      }
      get_token_prices: {
        Args: {
          mint_array: string[]
        }
        Returns: {
          mint: string
          price_usd: number
        }[]
      }
      get_total_trade_volume_bulk: {
        Args: {
          mint_addresses: string[]
          start_date: string
          end_date: string
        }
        Returns: {
          mint: string
          total_volume: number
        }[]
      }
      upsert_trade_volume_12h: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
