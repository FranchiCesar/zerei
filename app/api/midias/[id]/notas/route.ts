import { NextResponse, type NextRequest } from "next/server";
import { naoAutorizado, respostaDeErro, usuarioLogado } from "@/lib/api";
import { notasDeFilmeOuSerie, notasDoJogo } from "@/lib/notas-externas";
import { criarClienteAdmin } from "@/lib/supabase/admin";
import type { DadosExtra, NotasExternas } from "@/lib/tipos";

const UMA_SEMANA = 7 * 24 * 60 * 60 * 1000;
const UMA_HORA = 60 * 60 * 1000;

// Notas de crítica e público da mídia. Ficam em cache em midias.dados_extra.notas por uma semana;
// ?atualizar=1 busca de novo (no máximo uma vez por hora).
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await usuarioLogado())) return naoAutorizado();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) {
    return NextResponse.json({ erro: "invalido", mensagem: "Pedido inválido." }, { status: 400 });
  }

  try {
    const admin = criarClienteAdmin();
    const { data: midia, error } = await admin
      .from("midias")
      .select("fonte, id_externo, dados_extra")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!midia) return NextResponse.json({ erro: "nao_encontrado", mensagem: "Título não encontrado." }, { status: 404 });

    const extra = (midia.dados_extra ?? {}) as DadosExtra;
    if (midia.fonte === "manual" || !midia.id_externo) {
      return NextResponse.json({ lista: [], atualizado_em: new Date().toISOString(), omdb: true } satisfies NotasExternas);
    }

    const idade = extra.notas ? Date.now() - new Date(extra.notas.atualizado_em).getTime() : Infinity;
    const pediuAtualizar = request.nextUrl.searchParams.get("atualizar") === "1";
    // Chave da OMDb recém-configurada: busca de novo para trazer IMDb e companhia
    const faltaOmdb = extra.notas?.omdb === false && Boolean(process.env.OMDB_API_KEY);
    if (extra.notas && idade < UMA_SEMANA && !faltaOmdb && !(pediuAtualizar && idade > UMA_HORA)) {
      return NextResponse.json(extra.notas);
    }

    const notas =
      midia.fonte === "igdb" ? await notasDoJogo(midia.id_externo) : await notasDeFilmeOuSerie(midia.id_externo);
    const { error: erroSalvar } = await admin
      .from("midias")
      .update({ dados_extra: { ...extra, notas } })
      .eq("id", id);
    if (erroSalvar) throw erroSalvar;
    return NextResponse.json(notas);
  } catch (erro) {
    return respostaDeErro(erro);
  }
}
