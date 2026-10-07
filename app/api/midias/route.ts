import { NextResponse, type NextRequest } from "next/server";
import { naoAutorizado, respostaDeErro, usuarioLogado } from "@/lib/api";
import { esquemaReferencia, garantirMidia } from "@/lib/midias-servidor";

// Copia a mídia da IGDB/TMDB para o banco (se ainda não estiver) e devolve o id.
export async function POST(request: NextRequest) {
  if (!(await usuarioLogado())) return naoAutorizado();

  const corpo = esquemaReferencia.safeParse(await request.json().catch(() => null));
  if (!corpo.success) {
    return NextResponse.json({ erro: "invalido", mensagem: "Pedido inválido." }, { status: 400 });
  }

  try {
    const id = await garantirMidia(corpo.data.fonte, corpo.data.id_externo);
    return NextResponse.json({ id });
  } catch (erro) {
    return respostaDeErro(erro);
  }
}
