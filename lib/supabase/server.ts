import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseChavePublica, supabaseUrl } from "./config";

/** Cliente do Supabase para Server Components, Server Actions e rotas. Um por requisição. */
export async function criarClienteServidor() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseChavePublica, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesParaGravar) {
        try {
          cookiesParaGravar.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Chamado de um Server Component, que não pode gravar cookies.
          // Sem problema: o proxy renova a sessão a cada requisição.
        }
      },
    },
  });
}
