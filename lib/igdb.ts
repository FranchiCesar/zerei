import "server-only";
import { ErroConfiguracao } from "./supabase/admin";
import type { ResultadoBusca } from "./tipos";

// IGDB: autenticação pela Twitch (client credentials). Limite de 4 requisições por segundo.

let token: { valor: string; expiraEm: number } | null = null;

function credenciais() {
  const id = process.env.IGDB_CLIENT_ID;
  const segredo = process.env.IGDB_CLIENT_SECRET;
  if (!id || !segredo) throw new ErroConfiguracao("IGDB_CLIENT_ID e IGDB_CLIENT_SECRET");
  return { id, segredo };
}

async function obterToken() {
  if (token && token.expiraEm > Date.now() + 60_000) return token.valor;
  const { id, segredo } = credenciais();
  const resposta = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${id}&client_secret=${segredo}&grant_type=client_credentials`,
    { method: "POST", cache: "no-store" },
  );
  if (!resposta.ok) throw new Error(`Twitch respondeu ${resposta.status}`);
  const dados = (await resposta.json()) as { access_token: string; expires_in: number };
  token = { valor: dados.access_token, expiraEm: Date.now() + dados.expires_in * 1000 };
  return token.valor;
}

async function consultar<T>(endpoint: string, corpo: string): Promise<T> {
  const { id } = credenciais();
  const resposta = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
    method: "POST",
    headers: {
      "Client-ID": id,
      Authorization: `Bearer ${await obterToken()}`,
      Accept: "application/json",
    },
    body: corpo,
    cache: "no-store",
  });
  if (resposta.status === 401) token = null;
  if (!resposta.ok) throw new Error(`IGDB respondeu ${resposta.status}`);
  return resposta.json() as Promise<T>;
}

interface JogoIGDB {
  id: number;
  name: string;
  first_release_date?: number;
  cover?: { image_id: string };
  platforms?: { abbreviation?: string; name: string }[];
  genres?: { name: string }[];
  summary?: string;
  involved_companies?: { developer: boolean; company: { name: string } }[];
}

const capa = (imagem?: { image_id: string }) =>
  imagem ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${imagem.image_id}.jpg` : null;

const ano = (segundos?: number) => (segundos ? new Date(segundos * 1000).getUTCFullYear() : null);

const plataformas = (jogo: JogoIGDB) =>
  (jogo.platforms ?? []).map((p) => p.abbreviation ?? p.name);

// Busca só por texto do usuário: tira aspas para não quebrar a consulta.
const limpar = (texto: string) => texto.replace(/["\\;]/g, " ").trim().slice(0, 100);

export async function buscarJogos(termo: string): Promise<ResultadoBusca[]> {
  const jogos = await consultar<JogoIGDB[]>(
    "games",
    `search "${limpar(termo)}"; fields name,first_release_date,cover.image_id,platforms.abbreviation,platforms.name; where version_parent = null; limit 15;`,
  );
  return jogos.map((jogo) => ({
    fonte: "igdb",
    id_externo: String(jogo.id),
    tipo: "jogo",
    titulo: jogo.name,
    ano: ano(jogo.first_release_date),
    capa_url: capa(jogo.cover),
    detalhe: plataformas(jogo).slice(0, 4).join(" · ") || null,
  }));
}

export async function detalharJogo(idExterno: string) {
  const id = Number(idExterno);
  if (!Number.isInteger(id)) throw new Error("id inválido");

  const [jogos, tempos] = await Promise.all([
    consultar<JogoIGDB[]>(
      "games",
      `fields name,first_release_date,cover.image_id,platforms.abbreviation,platforms.name,genres.name,summary,involved_companies.developer,involved_companies.company.name; where id = ${id};`,
    ),
    consultar<{ normally?: number; hastily?: number }[]>(
      "game_time_to_beats",
      `fields normally,hastily; where game_id = ${id};`,
    ).catch(() => []),
  ]);

  const jogo = jogos[0];
  if (!jogo) throw new Error("Jogo não encontrado na IGDB");
  const segundos = tempos[0]?.normally ?? tempos[0]?.hastily;

  return {
    tipo: "jogo" as const,
    fonte: "igdb" as const,
    id_externo: String(jogo.id),
    titulo: jogo.name,
    capa_url: capa(jogo.cover),
    ano: ano(jogo.first_release_date),
    generos: (jogo.genres ?? []).map((g) => g.name),
    plataformas: plataformas(jogo),
    duracao_min: null,
    tempo_zerar_h: segundos ? Math.round((segundos / 3600) * 10) / 10 : null,
    dados_extra: {
      sinopse: jogo.summary,
      desenvolvedora: jogo.involved_companies?.find((c) => c.developer)?.company.name,
    },
  };
}
