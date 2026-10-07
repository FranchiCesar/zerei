import { NextResponse, type NextRequest } from "next/server";
import { naoAutorizado, respostaDeErro, usuarioLogado } from "@/lib/api";
import { buscarFilmesESeries } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
  if (!(await usuarioLogado())) return naoAutorizado();
  const termo = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const tipo = request.nextUrl.searchParams.get("tipo");
  if (termo.length < 2) return NextResponse.json({ resultados: [] });

  try {
    const resultados = await buscarFilmesESeries(
      termo,
      tipo === "filme" || tipo === "serie" ? tipo : undefined,
    );
    return NextResponse.json({ resultados });
  } catch (erro) {
    return respostaDeErro(erro);
  }
}
