import type { FonteNota, Midia, NotaExterna } from "./tipos";

export const ROTULO_FONTE_NOTA: Record<FonteNota, string> = {
  imdb: "IMDb",
  rotten: "Rotten Tomatoes",
  metacritic: "Metacritic",
  tmdb: "TMDB",
  igdb_critica: "Crítica",
  igdb_publico: "Público",
};

export const ESCALA_FONTE_NOTA: Record<FonteNota, string> = {
  imdb: "/10",
  rotten: "",
  metacritic: "/100",
  tmdb: "/10",
  igdb_critica: "/100",
  igdb_publico: "/100",
};

// Ordem de exibição e de preferência ao escolher "a" nota da crítica ou do público
const CRITICA: FonteNota[] = ["metacritic", "igdb_critica", "rotten"];
const PUBLICO: FonteNota[] = ["imdb", "igdb_publico", "tmdb"];
export const ORDEM_FONTES: FonteNota[] = ["imdb", "metacritic", "rotten", "igdb_critica", "igdb_publico", "tmdb"];

/** Nota de referência (0–100) da crítica ou do público, para ordenar a biblioteca. */
export function notaReferencia(midia: Pick<Midia, "dados_extra">, tipo: "critica" | "publico"): number | null {
  const lista = midia.dados_extra?.notas?.lista ?? [];
  for (const fonte of tipo === "critica" ? CRITICA : PUBLICO) {
    const nota = lista.find((n) => n.fonte === fonte);
    if (nota) return nota.valor;
  }
  return null;
}

/** Cor da faixa no estilo dos sites: verde (boa), amarela (mista), vermelha (ruim). */
export function faixaDaNota(nota: NotaExterna): "boa" | "mista" | "ruim" {
  const corte = nota.fonte === "metacritic" || nota.fonte === "igdb_critica" ? [75, 50] : nota.fonte === "rotten" ? [60, 40] : [70, 50];
  return nota.valor >= corte[0] ? "boa" : nota.valor >= corte[1] ? "mista" : "ruim";
}

export function formatarVotos(votos: number | null) {
  if (votos == null) return null;
  if (votos >= 1_000_000) return `${(votos / 1_000_000).toFixed(1).replace(".", ",")} mi`;
  if (votos >= 1_000) return `${(votos / 1_000).toFixed(votos >= 10_000 ? 0 : 1).replace(".", ",")} mil`;
  return String(votos);
}
