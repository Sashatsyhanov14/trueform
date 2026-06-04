import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project-id.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Use relative URL for client-side to bypass ad-blockers and VK in-app browser restrictions
// Keep full URL for server-side
const isBrowser = typeof window !== "undefined";
const clientUrl = isBrowser ? "/supabase-proxy" : supabaseUrl;

// Initialize Supabase client
export const supabase = createClient(clientUrl, supabaseAnonKey);

// Check if Supabase keys are fully configured
export const isSupabaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== undefined &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder-project-id.supabase.co"
  );
};
