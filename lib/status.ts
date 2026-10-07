import type { CategoriaPeca, StatusPeca, StatusRegistro, TipoMidia } from "./tipos";

export const STATUS_POR_TIPO: Record<TipoMidia, StatusRegistro[]> = {
  jogo: ["jogando", "na_fila", "zerado", "pausado", "abandonado", "desejo"],
  filme: ["assistido", "quero_ver", "abandonado"],
  serie: ["assistindo", "concluida", "pausado", "quero_ver", "abandonado"],
};

/** Status padrão ao adicionar rápido. */
export const STATUS_INICIAL: Record<TipoMidia, StatusRegistro> = {
  jogo: "na_fila",
  filme: "quero_ver",
  serie: "quero_ver",
};

const ROTULOS: Record<StatusRegistro, string> = {
  jogando: "Jogando",
  na_fila: "Na fila",
  zerado: "Zerado",
  desejo: "Desejo",
  assistido: "Assistido",
  assistindo: "Assistindo",
  concluida: "Concluída",
  quero_ver: "Quero ver",
  pausado: "Pausado",
  abandonado: "Abandonado",
};

export function rotuloStatus(status: StatusRegistro, tipo?: TipoMidia) {
  // Série é feminino
  if (tipo === "serie" && status === "pausado") return "Pausada";
  if (tipo === "serie" && status === "abandonado") return "Abandonada";
  return ROTULOS[status];
}

/** Agrupa os status dos três tipos para abas e cores. */
export type GrupoStatus = "ativo" | "fila" | "concluido" | "pausado" | "abandonado" | "desejo";

export const GRUPO_DO_STATUS: Record<StatusRegistro, GrupoStatus> = {
  jogando: "ativo",
  assistindo: "ativo",
  na_fila: "fila",
  quero_ver: "fila",
  zerado: "concluido",
  assistido: "concluido",
  concluida: "concluido",
  pausado: "pausado",
  abandonado: "abandonado",
  desejo: "desejo",
};

export const ROTULO_GRUPO: Record<GrupoStatus, string> = {
  ativo: "Em andamento",
  fila: "Na fila",
  concluido: "Concluídos",
  pausado: "Pausados",
  abandonado: "Abandonados",
  desejo: "Desejos",
};

/** Classes de cor por grupo (doc: cores de status). */
export const COR_GRUPO: Record<GrupoStatus, string> = {
  ativo: "bg-status-ativo text-white",
  fila: "bg-status-fila text-tinta",
  concluido: "bg-status-zerado text-tinta",
  pausado: "bg-status-pausado text-tinta",
  abandonado: "bg-status-abandonado text-white",
  desejo: "bg-marca-claro text-marca-texto",
};

export const ROTULO_TIPO: Record<TipoMidia, string> = { jogo: "Jogo", filme: "Filme", serie: "Série" };
export const ROTULO_TIPO_PLURAL: Record<TipoMidia, string> = { jogo: "Jogos", filme: "Filmes", serie: "Séries" };

export const ROTULO_CATEGORIA: Record<CategoriaPeca, string> = {
  processador: "Processador",
  placa_video: "Placa de vídeo",
  memoria: "Memória",
  placa_mae: "Placa-mãe",
  armazenamento: "Armazenamento",
  fonte: "Fonte",
  gabinete: "Gabinete",
  refrigeracao: "Refrigeração",
  console: "Console",
  monitor: "Monitor e TV",
  periferico: "Periféricos",
  audio: "Áudio",
  movel: "Móveis",
  acessorio: "Acessórios",
};

/** Ordem de exibição e agrupamento do setup. */
export const GRUPOS_SETUP: { rotulo: string; categorias: CategoriaPeca[] }[] = [
  {
    rotulo: "PC",
    categorias: ["processador", "placa_video", "memoria", "placa_mae", "armazenamento", "fonte", "gabinete", "refrigeracao"],
  },
  { rotulo: "Console", categorias: ["console"] },
  { rotulo: "Monitor e TV", categorias: ["monitor"] },
  { rotulo: "Periféricos", categorias: ["periferico"] },
  { rotulo: "Áudio", categorias: ["audio"] },
  { rotulo: "Móveis", categorias: ["movel"] },
  { rotulo: "Acessórios", categorias: ["acessorio"] },
];

export const ROTULO_STATUS_PECA: Record<StatusPeca, string> = {
  em_uso: "Em uso",
  guardado: "Guardado",
  vendido: "Vendido",
  quebrado: "Quebrado",
};

export const COR_STATUS_PECA: Record<StatusPeca, string> = {
  em_uso: "bg-marca text-white",
  guardado: "bg-status-pausado text-tinta",
  vendido: "bg-status-fila text-tinta",
  quebrado: "bg-status-abandonado text-white",
};

export const TAGS_SUGERIDAS = ["emocionante", "cansativo", "joga de novo", "obra-prima", "viciante", "decepcionou"];

export const SERVICOS = ["Cinema", "Netflix", "Prime Video", "Disney+", "Max", "Apple TV+", "Globoplay", "Crunchyroll", "TV", "Outro"];

export const PLATAFORMAS_COMUNS = ["PS5", "PS4", "PC", "Switch", "Switch 2", "Xbox Series", "Xbox One", "Mobile"];

export const CRITERIOS: { chave: "graficos" | "historia" | "jogabilidade" | "trilha" | "diversao"; rotulo: string }[] = [
  { chave: "graficos", rotulo: "Gráficos" },
  { chave: "historia", rotulo: "História" },
  { chave: "jogabilidade", rotulo: "Jogabilidade" },
  { chave: "trilha", rotulo: "Trilha sonora" },
  { chave: "diversao", rotulo: "Diversão" },
];
