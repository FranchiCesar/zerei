import "server-only";
import { anoIGDB, capaIGDB, consultarIGDB, plataformasIGDB, type JogoIGDB } from "./igdb";
import { anoTMDB, consultarTMDB, posterTMDB } from "./tmdb";
import type { CriterioRanking, ItemRanking, PeriodoRanking, PlataformaRanking, TipoMidia } from "./tipos";

// Rankings gerais (não só da biblioteca). Jogos: IGDB, crítica ou jogadores.
// Filmes e séries: TMDB, mais bem avaliados ou em alta na semana.

export const POR_PAGINA = 20;

const ID_PLATAFORMA: Record<Exclude<PlataformaRanking, "todas">, number> = {
  ps5: 167,
  ps4: 48,
  pc: 6,
  switch: 130,
  switch2: 508,
  xbox: 169,
};

/** Intervalo de anos do período (inclusive), ou null para todos os tempos. */
function anos(periodo: PeriodoRanking): [number, number] | null {
  const atual = new Date().getFullYear();
  if (periodo === "todos") return null;
  if (periodo === "ano") return [atual, atual];
  if (periodo === "ano_passado") return [atual - 1, atual - 1];
  const decada = Number(periodo); // "2020", "2010"...
  return [decada, decada + 9];
}

// Cache em memória: rankings mudam devagar e as APIs têm limite
const cache = new Map<string, { expira: number; itens: ItemRanking[] }>();
const SEIS_HORAS = 6 * 60 * 60 * 1000;

export async function buscarRanking(filtro: {
  tipo: TipoMidia;
  criterio: CriterioRanking;
  periodo: PeriodoRanking;
  plataforma: PlataformaRanking;
  pagina: number;
}): Promise<ItemRanking[]> {
  const chave = JSON.stringify(filtro);
  const guardado = cache.get(chave);
  if (guardado && guardado.expira > Date.now()) return guardado.itens;

  const itens = filtro.tipo === "jogo" ? await rankingJogos(filtro) : await rankingFilmesSeries(filtro);
  cache.set(chave, { expira: Date.now() + SEIS_HORAS, itens });
  if (cache.size > 300) cache.delete(cache.keys().next().value!);
  return itens;
}

type JogoComNota = JogoIGDB & {
  rating?: number;
  rating_count?: number;
  aggregated_rating?: number;
  aggregated_rating_count?: number;
};

async function rankingJogos({
  criterio,
  periodo,
  plataforma,
  pagina,
}: {
  criterio: CriterioRanking;
  periodo: PeriodoRanking;
  plataforma: PlataformaRanking;
  pagina: number;
}): Promise<ItemRanking[]> {
  const critica = criterio !== "publico";
  const intervalo = anos(periodo);
  // Mínimo de avaliações para a nota valer: menor em recortes curtos
  const curto = intervalo && intervalo[1] - intervalo[0] < 9;
  const minimo = critica ? (curto ? 3 : intervalo ? 5 : 8) : curto ? 100 : intervalo ? 150 : 300;
  const campoNota = critica ? "aggregated_rating" : "rating";

  const condicoes = [
    `${campoNota}_count >= ${minimo}`,
    "version_parent = null",
    "game_type = (0,8)", // jogo principal e remakes (sem DLC, edições e remasters repetidos)
  ];
  if (intervalo) {
    const inicio = Date.UTC(intervalo[0], 0, 1) / 1000;
    const fim = Date.UTC(intervalo[1] + 1, 0, 1) / 1000;
    condicoes.push(`first_release_date >= ${inicio} & first_release_date < ${fim}`);
  }
  if (plataforma !== "todas") condicoes.push(`platforms = (${ID_PLATAFORMA[plataforma]})`);

  const jogos = await consultarIGDB<JogoComNota[]>(
    "games",
    `fields name,first_release_date,cover.image_id,platforms.abbreviation,platforms.name,rating,rating_count,aggregated_rating,aggregated_rating_count;
     where ${condicoes.join(" & ")};
     sort ${campoNota} desc; limit ${POR_PAGINA}; offset ${(pagina - 1) * POR_PAGINA};`,
  );

  return jogos.map((jogo) => {
    const nota = (critica ? jogo.aggregated_rating : jogo.rating) ?? 0;
    const votos = (critica ? jogo.aggregated_rating_count : jogo.rating_count) ?? null;
    return {
      fonte: "igdb",
      id_externo: String(jogo.id),
      tipo: "jogo",
      titulo: jogo.name,
      ano: anoIGDB(jogo.first_release_date),
      capa_url: capaIGDB(jogo.cover),
      detalhe: plataformasIGDB(jogo).slice(0, 3).join(" · ") || null,
      nota: Math.round(nota),
      texto: String(Math.round(nota)),
      escala: "/100",
      votos,
      tipo_votos: critica ? "análises" : "votos",
    };
  });
}

interface ItemTMDB {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  vote_average?: number;
  vote_count?: number;
}

async function rankingFilmesSeries({
  tipo,
  criterio,
  periodo,
  pagina,
}: {
  tipo: TipoMidia;
  criterio: CriterioRanking;
  periodo: PeriodoRanking;
  pagina: number;
}): Promise<ItemRanking[]> {
  const tv = tipo === "serie";
  const midia = tv ? "tv" : "movie";
  let dados: { results: ItemTMDB[] };

  if (criterio === "em_alta") {
    dados = await consultarTMDB(`/trending/${midia}/week`, { page: String(pagina) });
  } else {
    const intervalo = anos(periodo);
    const curto = intervalo && intervalo[1] - intervalo[0] < 9;
    const minimo = tv ? (curto ? 100 : intervalo ? 400 : 1500) : curto ? 200 : intervalo ? 1000 : 3000;
    const campoData = tv ? "first_air_date" : "primary_release_date";
    const params: Record<string, string> = {
      sort_by: "vote_average.desc",
      "vote_count.gte": String(minimo),
      include_adult: "false",
      page: String(pagina),
    };
    if (intervalo) {
      params[`${campoData}.gte`] = `${intervalo[0]}-01-01`;
      params[`${campoData}.lte`] = `${intervalo[1]}-12-31`;
    }
    dados = await consultarTMDB(`/discover/${midia}`, params);
  }

  return dados.results.map((item) => {
    const media = item.vote_average ?? 0;
    return {
      fonte: "tmdb",
      id_externo: `${midia}:${item.id}`,
      tipo: tv ? "serie" : "filme",
      titulo: item.title ?? item.name ?? "Sem título",
      ano: anoTMDB(item.release_date ?? item.first_air_date),
      capa_url: posterTMDB(item.poster_path),
      detalhe: tv ? "Série" : "Filme",
      nota: Math.round(media * 10),
      texto: media.toFixed(1).replace(".", ","),
      escala: "/10",
      votos: item.vote_count ?? null,
      tipo_votos: "votos",
    };
  });
}
