// Dados de exemplo até o Supabase entrar (etapa 3). Remover depois.

export const jogandoAgora = {
  id: "elden-ring",
  titulo: "Elden Ring",
  plataforma: "PS5",
  genero: "RPG",
  horas: 62,
  conclusaoPct: 48,
};

export const meta = {
  ano: 2026,
  jogosZerados: 12,
  alvoJogos: 20,
  filmes: 31,
  series: 8,
};

export const proximosDaFila = [
  { id: "hollow-knight", titulo: "Hollow Knight", plataforma: "Switch", cor: "tinta" },
  { id: "celeste", titulo: "Celeste", plataforma: "PC", cor: "azul" },
  { id: "disco-elysium", titulo: "Disco Elysium", plataforma: "PC", cor: "neutro" },
  { id: "hades", titulo: "Hades", plataforma: "PC", cor: "tinta" },
] as const;
