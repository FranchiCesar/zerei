import type { Expressao } from "@/components/ui/mascote";
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
  emprestado: "Emprestado",
  em_conserto: "Em conserto",
  quebrado: "Quebrado",
  vendido: "Vendido",
  trocado: "Trocado",
  doado: "Doado",
  descartado: "Descartado",
};

export const COR_STATUS_PECA: Record<StatusPeca, string> = {
  em_uso: "bg-marca text-white",
  guardado: "bg-status-pausado text-tinta",
  emprestado: "bg-marca-claro text-marca-texto",
  em_conserto: "bg-status-fila text-tinta",
  quebrado: "bg-perigo text-white",
  vendido: "bg-conquista text-tinta",
  trocado: "bg-conquista text-tinta",
  doado: "bg-chip text-texto",
  descartado: "bg-status-abandonado text-white",
};

/** Ainda com você (aparecem no setup atual). */
export const STATUS_PECA_NO_SETUP: StatusPeca[] = ["em_uso", "guardado", "emprestado", "em_conserto", "quebrado"];
/** Saíram do setup: vão para "Vendidos e saídas" e deixam de contar no valor. */
export const STATUS_PECA_SAIDA: StatusPeca[] = ["vendido", "trocado", "doado", "descartado"];

export const pecaSaiu = (status: StatusPeca) => STATUS_PECA_SAIDA.includes(status);
/** Entra no "Valor do setup": está com você e funcionando. */
export const pecaContaNoValor = (status: StatusPeca) => !pecaSaiu(status) && status !== "quebrado";

/** Campos de detalhe pedidos em cada status (rótulos e exemplos). */
export const DETALHES_STATUS_PECA: Record<
  StatusPeca,
  { data?: string; valor?: string; com?: [string, string]; onde?: [string, string]; detalhes?: [string, string] }
> = {
  em_uso: {},
  guardado: { data: "Guardado desde", detalhes: ["Onde está guardado", "Caixa no armário"] },
  emprestado: { data: "Emprestado em", com: ["Para quem", "Nome do amigo"], detalhes: ["Combinado", "Devolve em dezembro"] },
  em_conserto: {
    data: "Enviado em",
    onde: ["Assistência", "Assistência técnica ou fabricante"],
    detalhes: ["Problema", "Não liga, cooler barulhento..."],
  },
  quebrado: { data: "Quebrou em", detalhes: ["O que aconteceu", "Tela trincada, não dá vídeo..."] },
  vendido: {
    data: "Vendido em",
    valor: "Valor da venda (R$)",
    onde: ["Onde vendeu", "OLX, Mercado Livre, amigo..."],
    com: ["Comprador", "Nome (opcional)"],
    detalhes: ["Detalhes da venda", "Com caixa, frete por conta do comprador..."],
  },
  trocado: {
    data: "Trocado em",
    valor: "Valor abatido na troca (R$)",
    onde: ["Onde trocou", "Loja ou pessoa"],
    detalhes: ["Trocado por", "RTX 5070 + diferença em dinheiro"],
  },
  doado: { data: "Doado em", com: ["Para quem", "Irmão, primo..."], detalhes: ["Observação", ""] },
  descartado: { data: "Descartado em", onde: ["Onde descartou", "Ponto de coleta de eletrônicos"], detalhes: ["Motivo", ""] },
};

/** Como o mascote reage a cada status da biblioteca. */
export function expressaoDoRegistro(status: StatusRegistro, tags: string[] = []): Expressao {
  if (tags.includes("platinado")) return "deslumbrado";
  const mapa: Record<StatusRegistro, Expressao> = {
    jogando: "feliz",
    assistindo: "feliz",
    na_fila: "pensando",
    quero_ver: "pensando",
    zerado: "comemorando",
    assistido: "comemorando",
    concluida: "comemorando",
    pausado: "dormindo",
    abandonado: "triste",
    desejo: "piscando",
  };
  return mapa[status] ?? "neutro";
}

/** Como o mascote reage a cada status de peça. */
export const EXPRESSAO_STATUS_PECA: Record<StatusPeca, Expressao> = {
  em_uso: "feliz",
  guardado: "dormindo",
  emprestado: "piscando",
  em_conserto: "pensando",
  quebrado: "tonto",
  vendido: "piscando",
  trocado: "comemorando",
  doado: "feliz",
  descartado: "triste",
};

export const CANAIS_VENDA = ["OLX", "Mercado Livre", "Facebook", "Enjoei", "Amigo", "Loja"];

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
