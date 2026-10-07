"use client";

import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

/**
 * Ranking em barras horizontais, uma série só: um tom (roxo da marca), sem legenda,
 * valor escrito na ponta da barra e tooltip ao tocar. Acima de 6 itens, o resto vira "Outros".
 */
export function GraficoRanking({
  dados,
  rotulo,
  unidade,
}: {
  dados: { nome: string; total: number }[];
  rotulo: string;
  unidade: [string, string];
}) {
  const principais = dados.slice(0, 6);
  const resto = dados.slice(6).reduce((s, d) => s + d.total, 0);
  const linhas = resto ? [...principais, { nome: "Outros", total: resto }] : principais;
  const texto = (n: number) => `${n} ${n === 1 ? unidade[0] : unidade[1]}`;

  return (
    <figure>
      <div style={{ height: linhas.length * 34 + 8 }} aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={linhas} layout="vertical" margin={{ top: 4, right: 36, bottom: 4, left: 0 }} barCategoryGap={8}>
            <XAxis type="number" hide domain={[0, "dataMax"]} />
            <YAxis
              type="category"
              dataKey="nome"
              width={112}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--texto)", fontSize: 13, fontWeight: 500 }}
              tickFormatter={(v: string) => (v.length > 15 ? `${v.slice(0, 14)}…` : v)}
            />
            <Tooltip
              cursor={{ fill: "var(--chip)" }}
              formatter={(v) => [texto(Number(v)), rotulo]}
              contentStyle={{
                background: "var(--cartao)",
                border: "2px solid var(--borda)",
                borderRadius: 14,
                color: "var(--texto)",
                fontSize: 13,
              }}
              labelStyle={{ fontWeight: 700 }}
            />
            <Bar dataKey="total" fill="var(--marca)" radius={[0, 4, 4, 0]} barSize={18} isAnimationActive={false}>
              <LabelList dataKey="total" position="right" style={{ fill: "var(--texto)", fontSize: 12, fontWeight: 700 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Versão em tabela para leitores de tela */}
      <table className="sr-only">
        <caption>{rotulo}</caption>
        <tbody>
          {linhas.map((l) => (
            <tr key={l.nome}>
              <th scope="row">{l.nome}</th>
              <td>{texto(l.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
