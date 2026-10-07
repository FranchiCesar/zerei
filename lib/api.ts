import "server-only";
import { NextResponse } from "next/server";
import { ErroConfiguracao } from "./supabase/admin";
import { criarClienteServidor } from "./supabase/server";

/** Id do usuário logado, ou null. As rotas de API só atendem quem entrou. */
export async function usuarioLogado() {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  return typeof id === "string" ? { id, supabase } : null;
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
