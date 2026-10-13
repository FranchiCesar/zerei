import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { naoAutorizado, respostaDeErro, usuarioLogado } from "@/lib/api";
import { buscarRanking } from "@/lib/rankings";

const esquema = z.object({
  tipo: z.enum(["jogo", "filme", "serie"]),
  criterio: z.enum(["critica", "publico", "em_alta"]),
  periodo: z.enum(["todos", "ano", "ano_passado", "2020", "2010", "2000", "1990", "1980"]).default("todos"),
  plataforma: z.enum(["todas", "ps5", "ps4", "pc", "switch", "switch2", "xbox"]).default("todas"),
  pagina: z.coerce.number().int().min(1).max(25).default(1),
});

// Ranking geral de jogos (IGDB) e de filmes e séries (TMDB).
export async function GET(request: NextRequest) {
  if (!(await usuarioLogado())) return naoAutorizado();
  const filtro = esquema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!filtro.success) {
    return NextResponse.json({ erro: "invalido", mensagem: "Filtro inválido." }, { status: 400 });
  }
  try {
    return NextResponse.json({ itens: await buscarRanking(filtro.data) });
  } catch (erro) {
    return respostaDeErro(erro);
  }
}
