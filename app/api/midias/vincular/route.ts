import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { naoAutorizado, respostaDeErro, usuarioLogado } from "@/lib/api";
import { esquemaReferencia, garantirMidia } from "@/lib/midias-servidor";
import { criarClienteAdmin } from "@/lib/supabase/admin";

const esquema = esquemaReferencia.extend({ midia_id: z.uuid() });

/**
 * Liga uma mídia cadastrada à mão à IGDB/TMDB: o registro, as listas e o progresso
 * passam para a mídia oficial (com capa, gêneros etc.) e a manual é apagada.
 */
export async function POST(request: NextRequest) {
  const usuario = await usuarioLogado();
  if (!usuario) return naoAutorizado();

  const corpo = esquema.safeParse(await request.json().catch(() => null));
  if (!corpo.success) {
    return NextResponse.json({ erro: "invalido", mensagem: "Pedido inválido." }, { status: 400 });
  }
  const { midia_id: manualId, fonte, id_externo } = corpo.data;

  try {
    const admin = criarClienteAdmin();

    const { data: manual } = await admin
      .from("midias")
      .select("id, tipo, fonte, criado_por")
      .eq("id", manualId)
      .single();
    if (!manual || manual.fonte !== "manual" || manual.criado_por !== usuario.id) {
      return NextResponse.json({ erro: "proibido", mensagem: "Mídia não encontrada." }, { status: 403 });
    }

    const oficialId = await garantirMidia(fonte, id_externo);
    const { data: oficial } = await admin.from("midias").select("tipo").eq("id", oficialId).single();
    if (oficial?.tipo !== manual.tipo) {
      return NextResponse.json(
        { erro: "tipo", mensagem: "Escolha um resultado do mesmo tipo (jogo, filme ou série)." },
        { status: 400 },
      );
    }

    const { data: jaTem } = await admin
      .from("registros")
      .select("id")
      .eq("usuario_id", usuario.id)
      .eq("midia_id", oficialId)
      .maybeSingle();
    if (jaTem) {
      return NextResponse.json(
        { erro: "duplicado", mensagem: "Esse título já está na sua biblioteca.", id: oficialId },
        { status: 409 },
      );
    }

    // Mover tudo o que aponta para a mídia manual
    const { error: e1 } = await admin
      .from("registros")
      .update({ midia_id: oficialId })
      .eq("usuario_id", usuario.id)
      .eq("midia_id", manualId);
    if (e1) throw e1;

    const { data: itens } = await admin.from("itens_lista").select("*").eq("midia_id", manualId);
    if (itens?.length) {
      await admin
        .from("itens_lista")
        .upsert(
          itens.map((i) => ({ ...i, midia_id: oficialId })),
          { onConflict: "lista_id,midia_id", ignoreDuplicates: true },
        );
    }
    for (const tabela of ["episodios_vistos", "notas_temporada"] as const) {
      const { data: linhas } = await admin.from(tabela).select("*").eq("midia_id", manualId);
      if (linhas?.length) {
        await admin.from(tabela).upsert(
          linhas.map((l) => ({ ...l, midia_id: oficialId })),
          { ignoreDuplicates: true },
        );
      }
    }

    await admin.from("midias").delete().eq("id", manualId);
    return NextResponse.json({ id: oficialId });
  } catch (erro) {
    return respostaDeErro(erro);
  }
}
