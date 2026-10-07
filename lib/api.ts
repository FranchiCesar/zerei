import "server-only";
import { NextResponse } from "next/server";
import { ErroConfiguracao } from "./supabase/admin";
import { criarClienteServidor } from "./supabase/server";

/** Id do usuário logado e com e-mail autorizado, ou null. As rotas de API só atendem esses. */
export async function usuarioLogado() {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (typeof id !== "string") return null;
  const { data: temAcesso } = await supabase.rpc("tem_acesso");
  return temAcesso === true ? { id, supabase } : null;
}

export function respostaDeErro(erro: unknown) {
  if (erro instanceof ErroConfiguracao) {
    return NextResponse.json({ erro: "nao_configurado", mensagem: erro.message }, { status: 503 });
  }
  console.error(erro);
  return NextResponse.json(
    { erro: "falha", mensagem: erro instanceof Error ? erro.message : "Erro inesperado" },
    { status: 502 },
  );
}

export const naoAutorizado = () =>
  NextResponse.json({ erro: "nao_autorizado", mensagem: "Entre na sua conta." }, { status: 401 });
