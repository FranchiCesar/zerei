import "server-only";
import { ErroConfiguracao } from "./supabase/admin";
import type { ResultadoBusca, TipoMidia } from "./tipos";

// TMDB: API v3 com o "API Read Access Token". Exige crédito à TMDB no app.

async function consultar<T>(caminho: string, params: Record<string, string> = {}): Promise<T> {
  const token = process.env.TMDB_TOKEN;
  if (!token) throw new ErroConfiguracao("TMDB_TOKEN");
  const url = new URL(`https://api.themoviedb.org/3${caminho}`);
  url.searchParams.set("language", "pt-BR");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const resposta = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });
  if (!resposta.ok) throw new Error(`TMDB respondeu ${resposta.status}`);
  return resposta.json() as Promise<T>;
}

const poster = (caminho?: string | null) => (caminho ? `https://image.tmdb.org/t/p/w500${caminho}` : null);
const ano = (data?: string) => (data ? Number(data.slice(0, 4)) || null : null);

interface ItemBusca {
  id: number;
  media_type?: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
}

export async function buscarFilmesESeries(
  termo: string,
  tipo?: Exclude<TipoMidia, "jogo">,
): Promise<ResultadoBusca[]> {
  const caminho = tipo === "filme" ? "/search/movie" : tipo === "serie" ? "/search/tv" : "/search/multi";
  const dados = await consultar<{ results: ItemBusca[] }>(caminho, {
    query: termo.slice(0, 100),
    include_adult: "false",
  });

  return dados.results
    .map((item) => ({ ...item, media_type: item.media_type ?? (tipo === "filme" ? "movie" : "tv") }))
    .filter((item) => item.media_type === "movie" || item.media_type === "tv")
    .slice(0, 15)
    .map((item) => ({
      fonte: "tmdb" as const,
      id_externo: `${item.media_type}:${item.id}`,
      tipo: item.media_type === "movie" ? ("filme" as const) : ("serie" as const),
      titulo: item.title ?? item.name ?? "Sem título",
      ano: ano(item.release_date ?? item.first_air_date),
      capa_url: poster(item.poster_path),
      detalhe: item.media_type === "movie" ? "Filme" : "Série",
    }));
}

interface DetalheTMDB {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  runtime?: number;
  episode_run_time?: number[];
  genres?: { name: string }[];
  networks?: { name: string }[];
  number_of_seasons?: number;
  seasons?: { season_number: number; episode_count: number }[];
  credits?: { cast?: { name: string; character?: string }[] };
}

/** idExterno no formato "movie:123" ou "tv:456". */
export async function detalharFilmeOuSerie(idExterno: string) {
  const [tipoTmdb, id] = idExterno.split(":");
  if ((tipoTmdb !== "movie" && tipoTmdb !== "tv") || !/^\d+$/.test(id)) throw new Error("id inválido");

  const d = await consultar<DetalheTMDB>(`/${tipoTmdb}/${id}`, { append_to_response: "credits" });
  const serie = tipoTmdb === "tv";

  return {
    midia: {
      tipo: (serie ? "serie" : "filme") as TipoMidia,
      fonte: "tmdb" as const,
      id_externo: idExterno,
      titulo: d.title ?? d.name ?? "Sem título",
      capa_url: poster(d.poster_path),
      ano: ano(d.release_date ?? d.first_air_date),
      generos: (d.genres ?? []).map((g) => g.name),
      plataformas: serie ? (d.networks ?? []).map((n) => n.name).slice(0, 3) : [],
      duracao_min: d.runtime ?? d.episode_run_time?.[0] ?? null,
      tempo_zerar_h: null,
      dados_extra: {
        sinopse: d.overview || undefined,
        elenco: (d.credits?.cast ?? []).slice(0, 8).map((c) => ({ nome: c.name, personagem: c.character })),
        numero_temporadas: d.number_of_seasons,
      },
    },
    // Temporada 0 costuma ser "especiais": fica de fora
    temporadas: serie
      ? (d.seasons ?? [])
          .filter((t) => t.season_number > 0 && t.episode_count > 0)
          .map((t) => ({ numero: t.season_number, total_episodios: t.episode_count }))
      : [],
  };
}
