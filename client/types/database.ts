export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          admin_wallet_address: string;
          name: string;
          payroll_contract_address: string | null;
          token_contract_address: string | null;
          verifier_contract_address: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["companies"]["Row"],
          "id" | "created_at"
        > & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["companies"]["Insert"]>;
      };
      employees: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          email: string | null;
          starknet_wallet_address: string;
          role: string | null;
          department: string | null;
          salary: number;
          secret_hash: string;
          leaf_nonce_counter: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["employees"]["Row"],
          "id" | "created_at" | "updated_at" | "leaf_nonce_counter" | "status"
        > & {
          id?: string;
          created_at?: string;
          updated_at?: string;
          leaf_nonce_counter?: number;
          status?: string;
        };
        Update: Partial<Database["public"]["Tables"]["employees"]["Insert"]>;
      };
      payroll_periods: {
        Row: {
          id: string;
          company_id: string;
          period_id: string;
          label: string | null;
          merkle_root: string;
          total_gross: string;
          state: string;
          commit_tx_hash: string | null;
          fund_tx_hash: string | null;
          freeze_tx_hash: string | null;
          close_tx_hash: string | null;
          committed_at: string | null;
          funded_at: string | null;
          frozen_at: string | null;
          closed_at: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["payroll_periods"]["Row"],
          "id" | "created_at" | "state"
        > & {
          id?: string;
          created_at?: string;
          state?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["payroll_periods"]["Insert"]
        >;
      };
      period_leaves: {
        Row: {
          id: string;
          period_id: string;
          employee_id: string;
          leaf_index: number;
          leaf_hash: string;
          amount: string;
          nonce: number;
          recipient_commitment: string;
          path_elements: string[];
          path_indices: number[];
          claimed: boolean;
          claim_tx_hash: string | null;
          nullifier_hash: string | null;
          claimed_at: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["period_leaves"]["Row"],
          "id" | "created_at" | "claimed"
        > & {
          id?: string;
          created_at?: string;
          claimed?: boolean;
        };
        Update: Partial<
          Database["public"]["Tables"]["period_leaves"]["Insert"]
        >;
      };
      employee_invites: {
        Row: {
          id: string;
          employee_id: string;
          company_id: string;
          invite_token: string;
          encrypted_secret: string;
          salt: string;
          expires_at: string;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["employee_invites"]["Row"],
          "id" | "created_at"
        > & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["employee_invites"]["Insert"]
        >;
      };
    };
  };
};
