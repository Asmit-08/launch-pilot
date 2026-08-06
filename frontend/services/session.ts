import { supabase } from "@/lib/supabase";

export async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}