"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { ImagemPeca } from "@/components/setup/icone-categoria";
import { CarregandoTela } from "@/components/ui/esqueleto";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { Mascote } from "@/components/ui/mascote";
import { Painel } from "@/components/ui/painel";
import { Topo } from "@/components/ui/topo";
import { useAdicionarFotoSetup, useApagarFotoSetup, useFotosSetup, usePecas } from "@/lib/dados";
import { valorSetup } from "@/lib/estatisticas";
import { formatarCentavos, formatarData, plural } from "@/lib/formato";
import { COR_STATUS_PECA, GRUPOS_SETUP, ROTULO_STATUS_PECA, STATUS_PECA_NO_SETUP, pecaContaNoValor, pecaSaiu } from "@/lib/status";
import type { FotoSetup, Peca, StatusPeca } from "@/lib/tipos";

const FILTROS: (StatusPeca | "todos")[] = ["todos", ...STATUS_PECA_NO_SETUP];

export function TelaSetup() {
  const { data: pecas, isPending } = usePecas();
  const [filtro, setFiltro] = useState<StatusPeca | "todos">("todos");
  const [aba, setAba] = useState<"atual" | "saidas">("atual");

  if (isPending || !pecas) return <CarregandoTela />;

  const noSetup = pecas.filter((p) => !pecaSaiu(p.status));
  const saidas = pecas
    .filter((p) => pecaSaiu(p.status))
    .sort((a, b) => (b.status_desde ?? "").localeCompare(a.status_desde ?? ""));
  const contam = noSetup.filter((p) => pecaContaNoValor(p.status));
  const quebradas = noSetup.filter((p) => p.status === "quebrado");
  const totalAtual = valorSetup(contam);
  const totalGeral = valorSetup(pecas);
  const visiveis = noSetup.filter((p) => filtro === "todos" || p.status === filtro);
  const grupos = GRUPOS_SETUP.map((g) => {
    const itens = visiveis.filter((p) => g.categorias.includes(p.categoria));
    return { ...g, itens, total: valorSetup(itens.filter((p) => pecaContaNoValor(p.status))) };
  }).filter((g) => g.itens.length > 0);
  const divisao = GRUPOS_SETUP.map((g) => ({
    rotulo: g.rotulo,
    total: valorSetup(contam.filter((p) => g.categorias.includes(p.categoria))),
  }))
    .filter((g) => g.total > 0)
    .sort((a, b) => b.total - a.total);

  return (
    <main>
      <Topo voltarPara="/perfil">
        <Link href="/setup/nova" className="botao botao-marca">
          <Plus size={20} strokeWidth={2.4} /> Peça
        </Link>
      </Topo>
      <h1 className="titulo mt-6 text-tela">
        Meu
        <br />
        setup
      </h1>

      {pecas.length === 0 ? (
        <EstadoVazio expressao="dormindo" titulo="Seu setup está sem peças." texto="Comece pela principal." />
      ) : (
        <>
          <section className="relative mt-5 overflow-hidden rounded-[28px] bg-marca p-5 text-white shadow-destaque">
            <Mascote expressao="feliz" className="pointer-events-none absolute top-4 right-4 h-20 w-auto" />
            <p className="text-11 font-bold uppercase tracking-[0.14em] text-white/80">Valor do setup</p>
            <p className="titulo mt-1 text-[40px] leading-none">{formatarCentavos(totalAtual, true)}</p>
            <p className="mt-2 max-w-[70%] text-13 font-bold">
              {plural(contam.length, "peça", "peças")}
              {totalGeral !== totalAtual && ` · ${formatarCentavos(totalGeral, true)} já investidos no total`}
            </p>
            {quebradas.length > 0 && (
              <p className="mt-1 text-12 font-bold text-white/80">
                {plural(quebradas.length, "quebrada fora", "quebradas fora")} da conta (
                {formatarCentavos(valorSetup(quebradas), true)})
              </p>
            )}
            <ul className="mt-4 space-y-2" aria-label="Divisão por categoria">
              {divisao.map((d) => (
                <li key={d.rotulo} className="text-12 font-bold">
                  <div className="flex justify-between">
                    <span>{d.rotulo}</span>
                    <span>{formatarCentavos(d.total, true)}</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-marca-escuro">
                    <div className="h-full rounded-full bg-tinta" style={{ width: `${(d.total / totalAtual) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <Galeria />

          <div className="mt-6 grid grid-cols-2 gap-1 rounded-full bg-cartao p-1" role="tablist" aria-label="Peças">
            {(
              [
                ["atual", `No setup (${noSetup.length})`],
                ["saidas", `Vendidos e saídas (${saidas.length})`],
              ] as const
            ).map(([valor, rotulo]) => (
              <button
                key={valor}
                type="button"
                role="tab"
                aria-selected={aba === valor}
                onClick={() => setAba(valor)}
                className={`min-h-11 rounded-full px-2 text-12 font-bold ${aba === valor ? "bg-tinta text-white" : ""}`}
              >
                {rotulo}
              </button>
            ))}
          </div>

          {aba === "saidas" ? (
            <Saidas pecas={saidas} />
          ) : (
            <>
              <div className="sem-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4" role="group" aria-label="Filtrar por status">
                {FILTROS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={filtro === f}
                    onClick={() => setFiltro(f)}
                    className={`min-h-10 shrink-0 rounded-full px-4 text-12 font-bold ${filtro === f ? "bg-tinta text-white" : "bg-cartao"}`}
                  >
                    {f === "todos" ? "Todas" : ROTULO_STATUS_PECA[f]}
                  </button>
                ))}
              </div>

              {grupos.length === 0 && (
                <EstadoVazio expressao="procurando" titulo="Nenhuma peça com esse status." texto="Escolha outro filtro." />
              )}

              {grupos.map((g) => (
                <section key={g.rotulo} className="mt-5">
                  <div className="flex items-baseline justify-between">
                    <h2 className="titulo text-22">{g.rotulo}</h2>
                    <span className="text-13 font-bold text-texto-suave">{formatarCentavos(g.total, true)}</span>
                  </div>
                  <ul className="mt-2 divide-y-2 divide-chip overflow-hidden rounded-[22px] bg-cartao">
                    {g.itens.map((p) => (
                      <LinhaPeca key={p.id} peca={p} />
                    ))}
                  </ul>
                </section>
              ))}
            </>
          )}
        </>
      )}
    </main>
  );
}

function LinhaPeca({ peca: p, valor, detalhe }: { peca: Peca; valor?: string; detalhe?: string }) {
  return (
    <li>
      <Link href={`/setup/${p.id}`} className="flex items-center gap-3 p-3">
        <ImagemPeca peca={p} className={`size-12 shrink-0 rounded-[14px] ${pecaSaiu(p.status) ? "opacity-70 grayscale" : ""}`} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-corpo font-bold">{p.modelo}</p>
          <p className="truncate text-12 text-texto-suave">
            {detalhe ?? ([p.marca, p.observacoes].filter(Boolean).join(" · ") || "—")}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-13 font-bold">{valor ?? formatarCentavos(p.preco_centavos)}</p>
          {p.status !== "em_uso" && (
            <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-11 font-bold ${COR_STATUS_PECA[p.status]}`}>
              {ROTULO_STATUS_PECA[p.status]}
            </span>
          )}
        </div>
      </Link>
    </li>
  );
}

/** Peças que saíram: quanto entrou com vendas e trocas e o resultado contra o que foi pago. */
function Saidas({ pecas }: { pecas: Peca[] }) {
  if (pecas.length === 0) {
    return (
      <EstadoVazio
        expressao="dormindo"
        titulo="Nada vendido ainda."
        texto="Quando vender, trocar, doar ou descartar uma peça, mude o status na ficha dela e ela aparece aqui."
      />
    );
  }

  const comValor = pecas.filter((p) => p.valor_saida_centavos != null);
  const recebido = comValor.reduce((s, p) => s + (p.valor_saida_centavos ?? 0), 0);
  const pagoNelas = comValor.reduce((s, p) => s + (p.preco_centavos ?? 0), 0);
  const resultado = recebido - pagoNelas;

  return (
    <>
      <section className="mt-4 flex items-center gap-4 rounded-[24px] bg-tinta p-5 text-white">
        <div className="flex-1">
          <p className="text-11 font-bold uppercase tracking-[0.14em] text-white/70">Recebido em vendas e trocas</p>
          <p className="titulo mt-1 text-destaque">{comValor.length ? formatarCentavos(recebido, true) : "—"}</p>
          {comValor.length === 0 ? (
            <p className="mt-1 text-13 font-bold text-white/80">Anote o valor da venda na ficha da peça para ver lucro ou prejuízo.</p>
          ) : (
            <p className={`mt-1 text-13 font-bold ${resultado >= 0 ? "text-conquista" : "text-white/80"}`}>
              {resultado >= 0 ? "Lucro" : "Prejuízo"} de {formatarCentavos(Math.abs(resultado), true)} sobre{" "}
              {formatarCentavos(pagoNelas, true)} pagos
            </p>
          )}
        </div>
        <Mascote expressao={comValor.length === 0 ? "pensando" : resultado >= 0 ? "comemorando" : "feliz"} className="h-20 w-auto shrink-0" />
      </section>

      <ul className="mt-4 divide-y-2 divide-chip overflow-hidden rounded-[22px] bg-cartao">
        {pecas.map((p) => (
          <LinhaPeca
            key={p.id}
            peca={p}
            valor={p.valor_saida_centavos != null ? formatarCentavos(p.valor_saida_centavos) : "—"}
            detalhe={[p.status_desde ? formatarData(p.status_desde) : null, p.status_onde, `pago ${formatarCentavos(p.preco_centavos)}`]
              .filter(Boolean)
              .join(" · ")}
          />
        ))}
      </ul>
    </>
  );
}

function Galeria() {
  const { data: fotos = [] } = useFotosSetup();
  const adicionar = useAdicionarFotoSetup();
  const apagar = useApagarFotoSetup();
  const entrada = useRef<HTMLInputElement>(null);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [legenda, setLegenda] = useState("");
  const [vendo, setVendo] = useState<FotoSetup | null>(null);
  const previa = useMemo(() => (arquivo ? URL.createObjectURL(arquivo) : null), [arquivo]);
  useEffect(() => () => {
    if (previa) URL.revokeObjectURL(previa);
  }, [previa]);

  return (
    <section className="mt-6">
      <h2 className="titulo text-22">Galeria</h2>
      <div className="sem-scrollbar -mx-4 mt-3 flex gap-3 overflow-x-auto px-4">
        <button
          type="button"
          onClick={() => entrada.current?.click()}
          className="flex h-32 w-28 shrink-0 flex-col items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-borda text-13 font-bold"
        >
          <ImagePlus size={24} strokeWidth={2.2} className="text-marca" />
          Adicionar foto
        </button>
        {fotos.map((f) => (
          <button key={f.id} type="button" onClick={() => setVendo(f)} className="relative h-32 w-44 shrink-0 overflow-hidden rounded-[20px]">
            {/* eslint-disable-next-line @next/next/no-img-element -- foto do Storage */}
            <img src={f.foto_url} alt={f.legenda ?? "Foto do setup"} loading="lazy" className="h-full w-full object-cover" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-tinta/80 to-transparent p-2 text-left text-11 font-bold text-white">
              {f.legenda ?? formatarData(f.tirada_em)}
            </span>
          </button>
        ))}
      </div>
      <input
        ref={entrada}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) setArquivo(f);
          e.target.value = "";
        }}
      />

      <Painel aberto={arquivo !== null} aoFechar={() => setArquivo(null)} titulo="Nova foto do setup">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!arquivo) return;
            adicionar.mutate(
              { arquivo, legenda: legenda.trim() || null },
              {
                onSuccess: () => {
                  setArquivo(null);
                  setLegenda("");
                },
              },
            );
          }}
          className="space-y-4 pt-2"
        >
          {previa && (
            // eslint-disable-next-line @next/next/no-img-element -- prévia local
            <img src={previa} alt="Prévia" className="max-h-64 w-full rounded-[20px] object-cover" />
          )}
          <div>
            <label htmlFor="legenda" className="rotulo">Legenda (opcional)</label>
            <input id="legenda" className="campo" value={legenda} onChange={(e) => setLegenda(e.target.value)} maxLength={120} placeholder="Setup novo, RGB ligado" />
          </div>
          <button type="submit" disabled={adicionar.isPending} className="botao botao-marca w-full">
            {adicionar.isPending ? "Enviando..." : "Salvar na galeria"}
          </button>
        </form>
      </Painel>

      <Painel aberto={vendo !== null} aoFechar={() => setVendo(null)} titulo={vendo?.legenda ?? "Foto do setup"}>
        {vendo && (
          <div className="space-y-4 pt-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- foto do Storage */}
            <img src={vendo.foto_url} alt={vendo.legenda ?? "Foto do setup"} className="w-full rounded-[20px]" />
            <p className="text-13 text-texto-suave">{formatarData(vendo.tirada_em)}</p>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Apagar esta foto?")) apagar.mutate(vendo, { onSuccess: () => setVendo(null) });
              }}
              className="botao botao-perigo w-full"
            >
              <Trash2 size={18} strokeWidth={2.2} /> Apagar foto
            </button>
          </div>
        )}
      </Painel>
    </section>
  );
}
