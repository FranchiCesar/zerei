"use client";

import { useState } from "react";
import { Mascote } from "@/components/ui/mascote";
import { Painel } from "@/components/ui/painel";
import { useMudarStatusPeca } from "@/lib/dados";
import { centavosParaTexto, formatarCentavos, hojeISO, reaisParaCentavos } from "@/lib/formato";
import {
  CANAIS_VENDA,
  DETALHES_STATUS_PECA,
  EXPRESSAO_STATUS_PECA,
  ROTULO_STATUS_PECA,
  STATUS_PECA_NO_SETUP,
  STATUS_PECA_SAIDA,
  pecaSaiu,
} from "@/lib/status";
import type { Peca, StatusPeca } from "@/lib/tipos";

/** Painel para trocar o status da peça e anotar os detalhes de cada situação. */
export function MudarStatusPeca({ peca, aberto, aoFechar }: { peca: Peca; aberto: boolean; aoFechar: () => void }) {
  return (
    <Painel aberto={aberto} aoFechar={aoFechar} titulo="Status da peça">
      {/* key: reabrir sempre começa do status atual */}
      <Formulario key={`${peca.id}-${peca.status}-${aberto}`} peca={peca} aoFechar={aoFechar} />
    </Painel>
  );
}

function Formulario({ peca, aoFechar }: { peca: Peca; aoFechar: () => void }) {
  const mudar = useMudarStatusPeca();
  const [status, setStatus] = useState<StatusPeca>(peca.status);
  const mesmo = status === peca.status;
  const [desde, setDesde] = useState(peca.status_desde ?? "");
  const [valor, setValor] = useState(centavosParaTexto(peca.valor_saida_centavos));
  const [com, setCom] = useState(peca.status_com ?? "");
  const [onde, setOnde] = useState(peca.status_onde ?? "");
  const [detalhes, setDetalhes] = useState(peca.status_detalhes ?? "");
  const [erro, setErro] = useState<string | null>(null);

  const campos = DETALHES_STATUS_PECA[status];

  const escolher = (novo: StatusPeca) => {
    setStatus(novo);
    setErro(null);
    if (novo === peca.status) {
      setDesde(peca.status_desde ?? "");
      setValor(centavosParaTexto(peca.valor_saida_centavos));
      setCom(peca.status_com ?? "");
      setOnde(peca.status_onde ?? "");
      setDetalhes(peca.status_detalhes ?? "");
    } else {
      setDesde(hojeISO());
      setValor("");
      setCom("");
      setOnde("");
      setDetalhes("");
    }
  };

  const centavos = valor.trim() ? reaisParaCentavos(valor) : null;
  const resultado = centavos != null && peca.preco_centavos != null ? centavos - peca.preco_centavos : null;

  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (valor.trim() && centavos == null) {
      setErro("Valor inválido. Use algo como 1.200,00");
      return;
    }
    if (desde && peca.comprado_em && desde < peca.comprado_em) {
      setErro("A data não pode ser antes da compra.");
      return;
    }
    mudar.mutate(
      {
        id: peca.id,
        status,
        status_desde: campos.data ? desde || null : null,
        valor_saida_centavos: campos.valor ? centavos : null,
        status_com: campos.com ? com.trim() || null : null,
        status_onde: campos.onde ? onde.trim() || null : null,
        status_detalhes: campos.detalhes ? detalhes.trim() || null : null,
      },
      { onSuccess: aoFechar },
    );
  };

  return (
    <form onSubmit={salvar} className="space-y-4 pt-1">
      <GrupoStatus titulo="Com você" opcoes={STATUS_PECA_NO_SETUP} atual={status} aoEscolher={escolher} />
      <GrupoStatus titulo="Saiu do setup" opcoes={STATUS_PECA_SAIDA} atual={status} aoEscolher={escolher} />

      <div className="flex items-center gap-3 rounded-[20px] bg-chip p-3">
        <Mascote expressao={EXPRESSAO_STATUS_PECA[status]} className="h-14 w-auto shrink-0" />
        <p className="text-13 font-bold">
          {pecaSaiu(status)
            ? "Sai da lista do setup atual, vai para Vendidos e saídas e deixa de contar no valor."
            : status === "quebrado"
              ? "Continua na lista, mas não conta no valor do setup enquanto estiver quebrada."
              : "Fica no setup atual e conta no valor."}
        </p>
      </div>

      {campos.data && (
        <div>
          <label htmlFor="status-desde" className="rotulo">{campos.data}</label>
          <input id="status-desde" type="date" className="campo" value={desde} max={hojeISO()} onChange={(e) => setDesde(e.target.value)} />
        </div>
      )}

      {campos.valor && (
        <div>
          <label htmlFor="status-valor" className="rotulo">{campos.valor}</label>
          <input
            id="status-valor"
            inputMode="decimal"
            className="campo"
            placeholder="1.200,00"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
          {resultado != null && (
            <p className={`mt-1.5 text-13 font-bold ${resultado >= 0 ? "text-marca-texto" : "text-perigo"}`}>
              {resultado === 0
                ? "Saiu pelo mesmo preço que você pagou."
                : `${resultado > 0 ? "Lucro" : "Prejuízo"} de ${formatarCentavos(Math.abs(resultado))} sobre os ${formatarCentavos(peca.preco_centavos)} pagos.`}
            </p>
          )}
        </div>
      )}

      {campos.onde && (
        <div>
          <label htmlFor="status-onde" className="rotulo">{campos.onde[0]}</label>
          <input id="status-onde" className="campo" placeholder={campos.onde[1]} maxLength={80} value={onde} onChange={(e) => setOnde(e.target.value)} />
          {status === "vendido" && (
            <div className="mt-2 flex flex-wrap gap-2">
              {CANAIS_VENDA.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={onde === c}
                  onClick={() => setOnde(c)}
                  className={`min-h-9 rounded-full px-3 text-12 font-bold ${onde === c ? "bg-tinta text-white" : "bg-chip"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {campos.com && (
        <div>
          <label htmlFor="status-com" className="rotulo">{campos.com[0]}</label>
          <input id="status-com" className="campo" placeholder={campos.com[1]} maxLength={120} value={com} onChange={(e) => setCom(e.target.value)} />
        </div>
      )}

      {campos.detalhes && (
        <div>
          <label htmlFor="status-detalhes" className="rotulo">{campos.detalhes[0]}</label>
          <textarea
            id="status-detalhes"
            rows={2}
            className="campo resize-none"
            placeholder={campos.detalhes[1]}
            maxLength={500}
            value={detalhes}
            onChange={(e) => setDetalhes(e.target.value)}
          />
        </div>
      )}

      {erro && <p role="alert" className="text-13 font-bold text-perigo">{erro}</p>}

      <button type="submit" disabled={mudar.isPending} className="botao botao-marca w-full">
        {mudar.isPending ? "Salvando..." : mesmo ? "Salvar detalhes" : `Marcar como ${ROTULO_STATUS_PECA[status].toLowerCase()}`}
      </button>
    </form>
  );
}

function GrupoStatus({
  titulo,
  opcoes,
  atual,
  aoEscolher,
}: {
  titulo: string;
  opcoes: StatusPeca[];
  atual: StatusPeca;
  aoEscolher: (s: StatusPeca) => void;
}) {
  return (
    <fieldset>
      <legend className="rotulo">{titulo}</legend>
      <div className="flex flex-wrap gap-2">
        {opcoes.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={atual === s}
            onClick={() => aoEscolher(s)}
            className={`min-h-11 rounded-full px-4 text-13 font-bold transition-colors ${
              atual === s ? "bg-marca text-white" : "bg-chip"
            }`}
          >
            {ROTULO_STATUS_PECA[s]}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
