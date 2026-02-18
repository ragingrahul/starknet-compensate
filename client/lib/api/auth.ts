import { createServiceClient } from "@/lib/supabase/server";
import { normalizeAddress } from "@/lib/address";

export async function getCompanyByWallet(walletAddress: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("admin_wallet_address", normalizeAddress(walletAddress))
    .single();

  if (error || !data) return null;
  return data;
}
