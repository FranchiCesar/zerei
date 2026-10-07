const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const moedaCurta = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function formatarCentavos(centavos: number | null | undefined, curto = false) {
  if (centavos == null) return "—";
  return (curto ? moedaCurta : moeda).format(centavos / 100);
}

/** "1.234,56" ou "1234.56" → centavos. Retorna null se vazio ou inválido. */
export function reaisParaCentavos(texto: string): number | null {
  const limpo = texto.replace(/[R$\s]/g, "");
  if (!limpo) return null;
  const normalizado = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
  const valor = Number(normalizado);
  return Number.isFinite(valor) && valor >= 0 ? Math.round(valor * 100) : null;
}

export function centavosParaTexto(centavos: number | null) {
  if (centavos == null) return "";
  return (centavos / 100).toFixed(2).replace(".", ",");
}

/** Datas do banco vêm como "2026-10-07" (sem fuso). */
export function formatarData(iso: string | null | undefined, opcoes?: Intl.DateTimeFormatOptions) {
  if (!iso) return "—";
  const [a, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString(
    "pt-BR",
    opcoes ?? { day: "2-digit", month: "short", year: "numeric" },
  );
}

export function hojeISO() {
  const agora = new Date();
  const m = String(agora.getMonth() + 1).padStart(2, "0");
  const d = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${m}-${d}`;
}

export function anoDe(iso: string | null | undefined) {
  return iso ? Number(iso.slice(0, 4)) : null;
}

export function formatarNota(nota: number | null | undefined) {
  if (nota == null) return "—";
  return Number.isInteger(nota) ? String(nota) : nota.toFixed(1).replace(".", ",");
}

export function formatarHoras(horas: number | null | undefined) {
  if (horas == null) return null;
  return `${Number.isInteger(horas) ? horas : horas.toFixed(1).replace(".", ",")} h`;
}

export function formatarDuracao(min: number | null | undefined) {
  if (!min) return null;
  const h = Math.floor(min / 60);
  const r = min % 60;
  return h ? `${h}h${r ? ` ${r}min` : ""}` : `${r}min`;
}

export function plural(n: number, singular: string, pluralTexto: string) {
  return `${n} ${n === 1 ? singular : pluralTexto}`;
}
