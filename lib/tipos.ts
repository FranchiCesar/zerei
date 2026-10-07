// Espelho das tabelas do Supabase (supabase/migrations).

export type TipoMidia = "jogo" | "filme" | "serie";
export type FonteMidia = "igdb" | "tmdb" | "manual";

export type StatusRegistro =
  | "jogando"
  | "na_fila"
  | "zerado"
  | "desejo"
  | "assistido"
  | "assistindo"
  | "concluida"
  | "quero_ver"
  | "pausado"
  | "abandonado";

export type CategoriaPeca =
  | "processador"
  | "placa_video"
  | "memoria"
  | "placa_mae"
  | "armazenamento"
  | "fonte"
  | "gabinete"
  | "refrigeracao"
  | "console"
  | "monitor"
  | "periferico"
  | "audio"
  | "movel"
  | "acessorio";

export type StatusPeca =
  | "em_uso"
  | "guardado"
  | "emprestado"
  | "em_conserto"
  | "quebrado"
  | "vendido"
  | "trocado"
  | "doado"
  | "descartado";

export interface DadosExtra {
  sinopse?: string;
  desenvolvedora?: string;
  elenco?: { nome: string; personagem?: string }[];
  numero_temporadas?: number;
  [chave: string]: unknown;
}

export interface Midia {
  id: string;
  tipo: TipoMidia;
  fonte: FonteMidia;
  id_externo: string | null;
  titulo: string;
  capa_url: string | null;
  ano: number | null;
  generos: string[];
  plataformas: string[];
  duracao_min: number | null;
  tempo_zerar_h: number | null;
  dados_extra: DadosExtra;
  criado_por: string | null;
}

export interface NotasCriterio {
  graficos?: number;
  historia?: number;
  jogabilidade?: number;
  trilha?: number;
  diversao?: number;
}

export interface Registro {
  id: string;
  usuario_id: string;
  midia_id: string;
  status: StatusRegistro;
  nota: number | null;
  notas_criterio: NotasCriterio;
  resumo: string | null;
  tags: string[];
  inicio: string | null;
  fim: string | null;
  horas: number | null;
  conclusao_pct: number | null;
  plataforma: string | null;
  servico: string | null;
  peca_id: string | null;
  favorito: boolean;
  revisto: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface RegistroComMidia extends Registro {
  midia: Midia;
}

export interface Temporada {
  id: string;
  midia_id: string;
  numero: number;
  total_episodios: number;
}

export interface EpisodioVisto {
  midia_id: string;
  temporada: number;
  episodio: number;
  visto_em: string;
}

export interface NotaTemporada {
  midia_id: string;
  temporada: number;
  nota: number;
}

export interface Lista {
  id: string;
  usuario_id: string;
  nome: string;
  descricao: string | null;
  capa_url: string | null;
  publica: boolean;
  criada_em: string;
}

export interface ItemLista {
  lista_id: string;
  midia_id: string;
  posicao: number;
  adicionado_em: string;
  midia: Pick<Midia, "id" | "titulo" | "capa_url" | "tipo" | "ano">;
}

export interface ListaComItens extends Lista {
  itens: ItemLista[];
}

export interface Peca {
  id: string;
  usuario_id: string;
  categoria: CategoriaPeca;
  marca: string | null;
  modelo: string;
  foto_url: string | null;
  preco_centavos: number | null;
  comprado_em: string | null;
  loja: string | null;
  garantia_ate: string | null;
  status: StatusPeca;
  status_desde: string | null;
  valor_saida_centavos: number | null;
  status_com: string | null;
  status_onde: string | null;
  status_detalhes: string | null;
  observacoes: string | null;
  criado_em: string;
}

export interface FotoSetup {
  id: string;
  usuario_id: string;
  foto_url: string;
  legenda: string | null;
  tirada_em: string;
}

export interface Meta {
  usuario_id: string;
  ano: number;
  tipo: TipoMidia;
  alvo: number;
}

export interface Perfil {
  id: string;
  nome: string | null;
  usuario: string | null;
  avatar_url: string | null;
  criado_em: string;
}

/** Resultado de busca nas APIs (IGDB/TMDB), antes de virar mídia no banco. */
export interface ResultadoBusca {
  fonte: "igdb" | "tmdb";
  id_externo: string;
  tipo: TipoMidia;
  titulo: string;
  ano: number | null;
  capa_url: string | null;
  detalhe: string | null; // plataformas ou "Filme"/"Série"
}
