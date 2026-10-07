import { anoDe, formatarCentavos } from "./formato";
import { GRUPO_DO_STATUS, ROTULO_STATUS_PECA, pecaContaNoValor, pecaSaiu } from "./status";
import type { Meta, Peca, RegistroComMidia, TipoMidia } from "./tipos";

export const concluido = (r: RegistroComMidia) => GRUPO_DO_STATUS[r.status] === "concluido";

/** Concluídos no ano (pela data de fim). */
export function concluidosNoAno(registros: RegistroComMidia[], ano: number, tipo?: TipoMidia) {
  return registros.filter(
    (r) => concluido(r) && anoDe(r.fim) === ano && (!tipo || r.midia.tipo === tipo),
  );
}

export function progressoMetas(registros: RegistroComMidia[], metas: Meta[], ano: number) {
  return (["jogo", "filme", "serie"] as TipoMidia[]).map((tipo) => ({
    tipo,
    feitos: concluidosNoAno(registros, ano, tipo).length,
    alvo: metas.find((m) => m.ano === ano && m.tipo === tipo)?.alvo ?? null,
  }));
}

export function contar(valores: string[]) {
  const mapa = new Map<string, number>();
  valores.forEach((v) => mapa.set(v, (mapa.get(v) ?? 0) + 1));
  return [...mapa.entries()].map(([nome, total]) => ({ nome, total })).sort((a, b) => b.total - a.total);
}

/** Gêneros dos títulos concluídos ou em andamento (o que de fato foi consumido). */
export function porGenero(registros: RegistroComMidia[]) {
  return contar(
    registros
      .filter((r) => ["concluido", "ativo", "pausado"].includes(GRUPO_DO_STATUS[r.status]))
      .flatMap((r) => r.midia.generos),
  );
}

export function porPlataforma(registros: RegistroComMidia[]) {
  return contar(
    registros
      .filter((r) => r.midia.tipo === "jogo" && GRUPO_DO_STATUS[r.status] !== "desejo")
      .map((r) => r.plataforma)
      .filter((p): p is string => Boolean(p)),
  );
}

export function totalHoras(registros: RegistroComMidia[]) {
  return registros.reduce((soma, r) => soma + (r.horas ?? 0), 0);
}

export function valorSetup(pecas: Peca[]) {
  return pecas.reduce((soma, p) => soma + (p.preco_centavos ?? 0), 0);
}

export interface EventoLinhaDoTempo {
  data: string;
  tipo: "midia" | "peca";
  titulo: string;
  detalhe: string;
  href: string;
}

export function linhaDoTempo(registros: RegistroComMidia[], pecas: Peca[]): EventoLinhaDoTempo[] {
  const midias = registros
    .filter((r) => concluido(r) && r.fim)
    .map((r) => ({
      data: r.fim!,
      tipo: "midia" as const,
      titulo: r.midia.titulo,
      detalhe: r.midia.tipo === "jogo" ? "Zerado" : r.midia.tipo === "filme" ? "Assistido" : "Série concluída",
      href: `/midia/${r.midia_id}`,
    }));
  const compras = pecas
    .filter((p) => p.comprado_em)
    .map((p) => ({
      data: p.comprado_em!,
      tipo: "peca" as const,
      titulo: [p.marca, p.modelo].filter(Boolean).join(" "),
      detalhe: "Peça comprada",
      href: `/setup/${p.id}`,
    }));
  const saidas = pecas
    .filter((p) => pecaSaiu(p.status) && p.status_desde)
    .map((p) => ({
      data: p.status_desde!,
      tipo: "peca" as const,
      titulo: [p.marca, p.modelo].filter(Boolean).join(" "),
      detalhe:
        p.valor_saida_centavos != null
          ? `${ROTULO_STATUS_PECA[p.status]} por ${formatarCentavos(p.valor_saida_centavos)}`
          : ROTULO_STATUS_PECA[p.status],
      href: `/setup/${p.id}`,
    }));
  return [...midias, ...compras, ...saidas].sort((a, b) => b.data.localeCompare(a.data));
}

export interface Conquista {
  id: string;
  titulo: string;
  descricao: string;
  obtida: boolean;
}

export function conquistas(registros: RegistroComMidia[], pecas: Peca[]): Conquista[] {
  const zerados = registros.filter((r) => r.status === "zerado").length;
  const filmes = registros.filter((r) => r.status === "assistido").length;
  const series = registros.filter((r) => r.status === "concluida").length;
  const platinas = registros.filter((r) => r.tags.includes("platinado")).length;
  const notas10 = registros.filter((r) => r.nota === 10).length;
  const setup = valorSetup(pecas.filter((p) => pecaContaNoValor(p.status)));

  return [
    { id: "primeiro", titulo: "Primeiro zerado", descricao: "Zerar o primeiro jogo", obtida: zerados >= 1 },
    { id: "dez", titulo: "Dezena", descricao: "10 jogos zerados", obtida: zerados >= 10 },
    { id: "cinquenta", titulo: "Lenda", descricao: "50 jogos zerados", obtida: zerados >= 50 },
    { id: "platina", titulo: "Platinador", descricao: "Platinar um jogo", obtida: platinas >= 1 },
    { id: "cinefilo", titulo: "Cinéfilo", descricao: "25 filmes assistidos", obtida: filmes >= 25 },
    { id: "maratona", titulo: "Maratonista", descricao: "5 séries concluídas", obtida: series >= 5 },
    { id: "critico", titulo: "Crítico exigente", descricao: "Dar nota 10 para algo", obtida: notas10 >= 1 },
    { id: "setup", titulo: "Setup de respeito", descricao: "R$ 10 mil em peças em uso", obtida: setup >= 1_000_000 },
  ];
}
