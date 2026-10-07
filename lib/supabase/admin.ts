import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./config";

/**
 * Cliente com a chave secreta: ignora o RLS. Só para gravar o cache de mídias
 * e excluir contas. Nunca importar em componente do navegador.
 */
export function criarClienteAdmin() {
  const chave = process.env.SUPABASE_SECRET_KEY;
  if (!chave || chave.endsWith("...")) {
    throw new ErroConfiguracao("SUPABASE_SECRET_KEY");
  }
  return createClient(supabaseUrl, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export class ErroConfiguracao extends Error {
  constructor(public variavel: string) {
    super(`Falta configurar ${variavel} no .env.local (e na Vercel).`);
  }
}
