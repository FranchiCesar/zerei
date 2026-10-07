"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRightLeft, CalendarDays, Pencil, ShieldCheck, Store, Trash2 } from "lucide-react";
import { ImagemPeca } from "@/components/setup/icone-categoria";
import { MudarStatusPeca } from "@/components/setup/mudar-status-peca";
import { Capa } from "@/components/ui/capa";
import { ChipStatus } from "@/components/ui/chip-status";
import { CarregandoTela } from "@/components/ui/esqueleto";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { Mascote } from "@/components/ui/mascote";
import { Topo } from "@/components/ui/topo";
import { useApagarPeca, usePecas, useRegistros } from "@/lib/dados";
import { formatarCentavos, formatarData, hojeISO } from "@/lib/formato";
import { pecaSaiu, COR_STATUS_PECA, DETALHES_STATUS_PECA, EXPRESSAO_STATUS_PECA, ROTULO_CATEGORIA, ROTULO_STATUS_PECA } from "@/lib/status";

function situacaoGarantia(ate: string | null) {
  if (!ate) return null;
  const dias = Math.round((new Date(ate).getTime() - new Date(hojeISO()).getTime()) / 86_400_000);
  if (dias < 0) return { texto: `Venceu em ${formatarData(ate)}`, alerta: false };
  if (dias <= 30) return { texto: `Vence em ${dias} dias (${formatarData(ate)})`, alerta: true };
  return { texto: `Até ${formatarData(ate)}`, alerta: false };
}

export function TelaPeca() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: pecas, isPending } = usePecas();
  const { data: registros = [] } = useRegistros();
  const apagar = useApagarPeca();
  const [mudando, setMudando] = useState(false);

  if (isPending) return <CarregandoTela />;
  const peca = pecas?.find((p) => p.id === id);
  if (!peca) {
    return (
      <main>
        <Topo voltarPara="/setup" />
        <EstadoVazio expressao="confuso" titulo="Peça não encontrada." texto="Ela pode ter sido apagada." />
      </main>
    );
  }

  const jogos = registros.filter((r) => r.peca_id === peca.id);
  const resumo = [
    peca.status_desde ? `${DETALHES_STATUS_PECA[peca.status].data ?? "Desde"} ${formatarData(peca.status_desde)}` : null,
    peca.valor_saida_centavos != null ? formatarCentavos(peca.valor_saida_centavos) : null,
    peca.status_onde,
    peca.status_com ? (peca.status === "vendido" ? `comprador: ${peca.status_com}` : peca.status_com) : null,
  ].filter(Boolean) as string[];
  const resultado =
    peca.valor_saida_centavos != null && peca.preco_centavos != null ? peca.valor_saida_centavos - peca.preco_centavos : null;
  const garantia = pecaSaiu(peca.status) ? null : situacaoGarantia(peca.garantia_ate);

  return (
    <main>
      <Topo voltarPara="/setup">
        <Link href={`/setup/${peca.id}/editar`} className="botao botao-marca">
          <Pencil size={18} strokeWidth={2.2} /> Editar
        </Link>
      </Topo>

      <ImagemPeca peca={peca} className="mt-5 aspect-[4/3] w-full rounded-[28px]" tamanhoIcone={72} />

      <p className="mt-5 text-11 font-bold uppercase tracking-[0.14em] text-texto-suave">
        {ROTULO_CATEGORIA[peca.categoria]}
        {peca.marca ? ` · ${peca.marca}` : ""}
      </p>
      <h1 className="titulo mt-1 text-destaque [overflow-wrap:anywhere]">{peca.modelo}</h1>

      {/* Status atual e detalhes */}
      <section className="mt-4 rounded-[22px] bg-cartao p-4">
        <div className="flex items-center gap-3">
          <Mascote expressao={EXPRESSAO_STATUS_PECA[peca.status]} className="h-14 w-auto shrink-0" />
          <div className="min-w-0 flex-1">
            <span className={`inline-block rounded-full px-3 py-1 text-12 font-bold ${COR_STATUS_PECA[peca.status]}`}>
              {ROTULO_STATUS_PECA[peca.status]}
            </span>
            {resumo.length > 0 && <p className="mt-1.5 text-13 font-bold">{resumo.join(" · ")}</p>}
            {peca.status_detalhes && <p className="mt-1 text-13 text-texto-suave">{peca.status_detalhes}</p>}
          </div>
        </div>
        {resultado != null && (
          <p className={`mt-3 rounded-[14px] px-3 py-2 text-13 font-bold ${resultado >= 0 ? "bg-conquista text-tinta" : "bg-chip text-perigo"}`}>
            {resultado === 0
              ? "Saiu pelo mesmo preço que você pagou."
              : `${resultado > 0 ? "Lucro" : "Prejuízo"} de ${formatarCentavos(Math.abs(resultado))} em relação ao preço pago.`}
          </p>
        )}
        <button type="button" onClick={() => setMudando(true)} className="botao botao-chip mt-3 w-full">
          <ArrowRightLeft size={18} strokeWidth={2.2} /> Mudar status
        </button>
        <p className="mt-2 text-center text-12 text-texto-suave">Vendeu, quebrou, emprestou, mandou para o conserto...</p>
      </section>

      <dl className="mt-5 grid grid-cols-2 gap-3">
        <div className="col-span-2 rounded-[22px] bg-cartao p-4">
          <dt className="text-11 font-bold uppercase tracking-[0.1em] text-texto-suave">Preço pago</dt>
          <dd className="titulo mt-1 text-destaque">{formatarCentavos(peca.preco_centavos)}</dd>
        </div>
        <div className="rounded-[22px] bg-cartao p-4">
          <dt className="flex items-center gap-1.5 text-11 font-bold uppercase tracking-[0.1em] text-texto-suave">
            <CalendarDays size={14} strokeWidth={2.4} /> Compra
          </dt>
          <dd className="mt-1 text-corpo font-bold">{formatarData(peca.comprado_em)}</dd>
        </div>
        <div className="rounded-[22px] bg-cartao p-4">
          <dt className="flex items-center gap-1.5 text-11 font-bold uppercase tracking-[0.1em] text-texto-suave">
            <Store size={14} strokeWidth={2.4} /> Loja
          </dt>
          <dd className="mt-1 truncate text-corpo font-bold">{peca.loja ?? "—"}</dd>
        </div>
        <div className={`col-span-2 rounded-[22px] p-4 ${garantia?.alerta ? "bg-status-fila text-tinta" : "bg-cartao"}`}>
          <dt className="flex items-center gap-1.5 text-11 font-bold uppercase tracking-[0.1em] opacity-80">
            <ShieldCheck size={14} strokeWidth={2.4} /> Garantia
          </dt>
          <dd className="mt-1 flex items-center justify-between gap-2 text-corpo font-bold">
            {garantia?.texto ?? (pecaSaiu(peca.status) ? "Não se aplica mais" : "Não informada")}
            {garantia?.alerta && <Mascote expressao="surpreso" className="h-10 w-auto shrink-0" />}
          </dd>
        </div>
      </dl>

      {peca.observacoes && (
        <p className="mt-3 rounded-[22px] bg-cartao p-4 text-corpo">{peca.observacoes}</p>
      )}

      {(peca.categoria === "console" || peca.categoria === "gabinete") && (
        <section className="mt-6">
          <h2 className="titulo text-22">Jogados nesta máquina</h2>
          {jogos.length === 0 ? (
            <p className="mt-2 text-13 text-texto-suave">
              Nenhum jogo ligado ainda. No registro do jogo, escolha esta máquina em &quot;Máquina do setup&quot;.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {jogos.map((r) => (
                <li key={r.id}>
                  <Link href={`/midia/${r.midia_id}`} className="flex items-center gap-3 rounded-[20px] bg-cartao p-2.5">
                    <Capa midia={r.midia} className="h-14 w-10 shrink-0 rounded-[10px]" tamanhoLetra="text-20" />
                    <span className="min-w-0 flex-1 truncate text-corpo font-bold">{r.midia.titulo}</span>
                    <ChipStatus status={r.status} tipo={r.midia.tipo} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <button
        type="button"
        disabled={apagar.isPending}
        onClick={() => {
          if (window.confirm(`Apagar "${peca.modelo}" do setup?`)) {
            apagar.mutate(peca, { onSuccess: () => router.replace("/setup") });
          }
        }}
        className="botao botao-perigo mt-8 w-full"
      >
        <Trash2 size={18} strokeWidth={2.2} /> Apagar peça
      </button>
      <p className="mt-2 text-center text-12 text-texto-suave">
        Apagar remove de vez. Se você vendeu ou se desfez dela, prefira mudar o status para manter o histórico.
      </p>

      <MudarStatusPeca peca={peca} aberto={mudando} aoFechar={() => setMudando(false)} />
    </main>
  );
}
