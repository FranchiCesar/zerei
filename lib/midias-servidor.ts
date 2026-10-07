import "server-only";
import { z } from "zod";
import { detalharJogo } from "./igdb";
import { criarClienteAdmin } from "./supabase/admin";
import { detalharFilmeOuSerie } from "./tmdb";

export const esquemaReferencia = z.object({
  fonte: z.enum(["igdb", "tmdb"]),
  id_externo: z.string().regex(/^(\d+|(movie|tv):\d+)$/),
});

/**
 * Regra de ouro: a mídia é copiada para o Supabase na primeira vez que alguém a adiciona.
 * Retorna o id da mídia no banco.
 */
export async function garantirMidia(fonte: "igdb" | "tmdb", idExterno: string) {
  const admin = criarClienteAdmin();

  const { data: existente } = await admin
    .from("midias")
    .select("id")
    .eq("fonte", fonte)
    .eq("id_externo", idExterno)
    .maybeSingle();
  if (existente) return existente.id as string;

  if (fonte === "igdb") {
    const jogo = await detalharJogo(idExterno);
    const { data, error } = await admin
      .from("midias")
      .upsert(jogo, { onConflict: "fonte,id_externo" })
      .select("id")
      .single();
    if (error) throw error;
    return data.id as string;
  }

  const { midia, temporadas } = await detalharFilmeOuSerie(idExterno);
  const { data, error } = await admin
    .from("midias")
    .upsert(midia, { onConflict: "fonte,id_externo" })
    .select("id")
    .single();
  if (error) throw error;

  if (temporadas.length) {
    const { error: erroTemporadas } = await admin
      .from("temporadas")
      .upsert(
        temporadas.map((t) => ({ ...t, midia_id: data.id })),
        { onConflict: "midia_id,numero" },
      );
    if (erroTemporadas) throw erroTemporadas;
  }
  return data.id as string;
}
