import { NextResponse, type NextRequest } from "next/server";
import { naoAutorizado, respostaDeErro, usuarioLogado } from "@/lib/api";
import { buscarJogos } from "@/lib/igdb";

export async function GET(request: NextRequest) {
  if (!(await usuarioLogado())) return naoAutorizado();
  const termo = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (termo.length < 2) return NextResponse.json({ resultados: [] });

  try {
    return NextResponse.json({ resultados: await buscarJogos(termo) });
  } catch (erro) {
    return respostaDeErro(erro);
  }
}
