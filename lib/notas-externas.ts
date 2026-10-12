import "server-only";
import { consultarIGDB } from "./igdb";
import { consultarTMDB } from "./tmdb";
import type { NotaExterna, NotasExternas } from "./tipos";

// Notas de crítica e público. Jogos: IGDB (média da crítica e do público).
// Filmes e séries: TMDB e, com a chave da OMDb, IMDb, Rotten Tomatoes e Metacritic.

const umaCasa = (n: number) => n.toFixed(1).replace(".", ",");

export async function notasDoJogo(idExterno: string): Promise<NotasExternas> {
  const id = Number(idExterno);
  if (!Number.isInteger(id)) throw new Error("id inválido");
  const [jogo] = await consultarIGDB<
    { rating?: number; rating_count?: number; aggregated_rating?: number; aggregated_rating_count?: number; url?: string }[]
  >("games", `fields rating,rating_count,aggregated_rating,aggregated_rating_count,url; where id = ${id};`);

  const lista: NotaExterna[] = [];
  if (jogo?.aggregated_rating != null) {
    lista.push({
      fonte: "igdb_critica",
      valor: Math.round(jogo.aggregated_rating),
      texto: String(Math.round(jogo.aggregated_rating)),
      votos: jogo.aggregated_rating_count ?? null,
      url: jogo.url ?? null,
    });
  }
  if (jogo?.rating != null) {
    lista.push({
      fonte: "igdb_publico",
      valor: Math.round(jogo.rating),
      texto: String(Math.round(jogo.rating)),
      votos: jogo.rating_count ?? null,
      url: jogo.url ?? null,
    });
  }
  return { lista, atualizado_em: new Date().toISOString(), omdb: true };
}

interface RespostaOMDb {
  Response: "True" | "False";
  imdbRating?: string;
  imdbVotes?: string;
  Metascore?: string;
  Ratings?: { Source: string; Value: string }[];
}

async function notasDaOMDb(imdbId: string, chave: string): Promise<NotaExterna[]> {
  const resposta = await fetch(`https://www.omdbapi.com/?i=${imdbId}&apikey=${chave}`, { cache: "no-store" });
  if (!resposta.ok) throw new Error(`OMDb respondeu ${resposta.status}`);
  const d = (await resposta.json()) as RespostaOMDb;
  if (d.Response !== "True") return [];

  const lista: NotaExterna[] = [];
  const imdb = Number(d.imdbRating);
  if (d.imdbRating && !Number.isNaN(imdb)) {
    const votos = Number(d.imdbVotes?.replace(/,/g, ""));
    lista.push({
      fonte: "imdb",
      valor: Math.round(imdb * 10),
      texto: umaCasa(imdb),
      votos: Number.isNaN(votos) ? null : votos,
      url: `https://www.imdb.com/title/${imdbId}/`,
    });
  }
  const tomate = d.Ratings?.find((r) => r.Source === "Rotten Tomatoes")?.Value;
  if (tomate && /^\d+%$/.test(tomate)) {
    lista.push({ fonte: "rotten", valor: Number(tomate.slice(0, -1)), texto: tomate, votos: null, url: null });
  }
  const meta = Number(d.Metascore ?? d.Ratings?.find((r) => r.Source === "Metacritic")?.Value.split("/")[0]);
  if (!Number.isNaN(meta) && meta > 0) {
    lista.push({ fonte: "metacritic", valor: meta, texto: String(meta), votos: null, url: null });
  }
  return lista;
}

/** idExterno no formato "movie:123" ou "tv:456". */
export async function notasDeFilmeOuSerie(idExterno: string): Promise<NotasExternas> {
  const [tipo, id] = idExterno.split(":");
  if ((tipo !== "movie" && tipo !== "tv") || !/^\d+$/.test(id)) throw new Error("id inválido");

  const d = await consultarTMDB<{ vote_average?: number; vote_count?: number; external_ids?: { imdb_id?: string | null } }>(
    `/${tipo}/${id}`,
    { append_to_response: "external_ids" },
  );

  const lista: NotaExterna[] = [];
  const chave = process.env.OMDB_API_KEY;
  const imdbId = d.external_ids?.imdb_id;
  if (chave && imdbId && /^tt\d+$/.test(imdbId)) {
    // A OMDb fora do ar não pode derrubar as notas do TMDB
    lista.push(...(await notasDaOMDb(imdbId, chave).catch(() => [])));
  }
  if (d.vote_average && d.vote_count) {
    lista.push({
      fonte: "tmdb",
      valor: Math.round(d.vote_average * 10),
      texto: umaCasa(d.vote_average),
      votos: d.vote_count,
      url: `https://www.themoviedb.org/${tipo}/${id}`,
    });
  }
  return { lista, atualizado_em: new Date().toISOString(), omdb: Boolean(chave) };
}
