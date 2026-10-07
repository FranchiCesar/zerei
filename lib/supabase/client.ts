import { createBrowserClient } from "@supabase/ssr";
import { supabaseChavePublica, supabaseUrl } from "./config";

/** Cliente do Supabase para componentes do navegador ("use client"). */
export function criarClienteNavegador() {
  return createBrowserClient(supabaseUrl, supabaseChavePublica);
}
