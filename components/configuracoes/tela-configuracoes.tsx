"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FileDown, LogOut, Monitor, Moon, Sun, UserX } from "lucide-react";
import { LigarEmLote } from "@/components/configuracoes/ligar-em-lote";
import { Painel } from "@/components/ui/painel";
import { Topo } from "@/components/ui/topo";
import { TituloTela } from "@/components/ui/titulo-tela";
import { avisarErro, mostrarAviso } from "@/lib/avisos";
import { useAtualizarPerfil, useMetas, usePerfil, useSalvarMeta, useUsuario } from "@/lib/dados";
import { hojeISO } from "@/lib/formato";
import { limparCopiaLocal } from "@/lib/offline";
import { ROTULO_TIPO_PLURAL } from "@/lib/status";
import { criarClienteNavegador } from "@/lib/supabase/client";
import { definirTema, useTema, type Tema } from "@/lib/tema";
import type { TipoMidia } from "@/lib/tipos";

export function TelaConfiguracoes() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data: usuario } = useUsuario();
  const tema = useTema();
  const [saindo, setSaindo] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const sair = async () => {
    setSaindo(true);
    await criarClienteNavegador().auth.signOut();
    qc.clear();
    await limparCopiaLocal();
    router.replace("/entrar");
    router.refresh();
  };

  return (
    <main>
      <Topo voltarPara="/perfil" />
      <TituloTela>Configurações</TituloTela>

      <Conta email={usuario?.email ?? null} />

      <section className="mt-4 rounded-[24px] bg-cartao p-5">
        <h2 className="titulo text-20">Tema</h2>
        <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Tema">
          {(
            [
              ["sistema", "Sistema", Monitor],
              ["claro", "Claro", Sun],
              ["escuro", "Escuro", Moon],
            ] as [Tema, string, typeof Sun][]
          ).map(([valor, rotulo, Icone]) => (
            <button
              key={valor}
              type="button"
              role="radio"
              aria-checked={tema === valor}
              onClick={() => definirTema(valor)}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-[18px] text-13 font-bold ${
                tema === valor ? "bg-azul text-white" : "bg-chip"
              }`}
            >
              <Icone size={20} strokeWidth={2.2} />
              {rotulo}
            </button>
          ))}
        </div>
      </section>

      <Metas />

      <LigarEmLote />

      <section className="mt-4 rounded-[24px] bg-cartao p-5">
        <h2 className="titulo text-20">Seus dados</h2>
        <button type="button" onClick={exportarDados} className="botao botao-chip mt-3 w-full">
          <FileDown size={18} strokeWidth={2.2} /> Exportar tudo (JSON)
        </button>
        <Link href="/privacidade" className="mt-2 flex min-h-11 items-center justify-center text-13 font-bold underline underline-offset-4">
          Política de privacidade
        </Link>
      </section>

      <section className="mt-4 rounded-[24px] bg-cartao p-5">
        <h2 className="titulo text-20">Créditos</h2>
        <p className="mt-2 text-13 text-texto-suave">
          Dados de jogos fornecidos pela IGDB (Twitch). Dados e imagens de filmes e séries fornecidos pela TMDB (The Movie
          Database). Este app usa a API da TMDB, mas não é endossado nem certificado pela TMDB.
        </p>
      </section>

      <button type="button" onClick={sair} disabled={saindo} className="botao botao-chip mt-6 w-full">
        <LogOut size={18} strokeWidth={2.2} /> {saindo ? "Saindo..." : "Sair da conta"}
      </button>
      <button type="button" onClick={() => setExcluindo(true)} className="botao botao-perigo mt-3 w-full">
        <UserX size={18} strokeWidth={2.2} /> Excluir conta e dados
      </button>

      <ExcluirConta aberto={excluindo} aoFechar={() => setExcluindo(false)} />
    </main>
  );
}

function Conta({ email }: { email: string | null }) {
  const { data: perfil } = usePerfil();
  const atualizar = useAtualizarPerfil();
  const [erro, setErro] = useState<string | null>(null);

  return (
    <section className="mt-5 rounded-[24px] bg-cartao p-5">
      <h2 className="titulo text-20">Conta</h2>
      <p className="mt-1 text-13 text-texto-suave">{email}</p>
      <form
        key={perfil?.id ?? "carregando"}
        onSubmit={(e) => {
          e.preventDefault();
          const dados = new FormData(e.currentTarget);
          const nome = String(dados.get("nome") ?? "").trim().slice(0, 60);
          const usuario = String(dados.get("usuario") ?? "").trim().toLowerCase();
          if (usuario && !/^[a-z0-9_]{3,20}$/.test(usuario)) {
            setErro("Usuário: 3 a 20 letras minúsculas, números ou _");
            return;
          }
          setErro(null);
          atualizar.mutate({ nome: nome || null, usuario: usuario || null });
        }}
        className="mt-3 space-y-3"
      >
        <div>
          <label htmlFor="nome" className="rotulo">Nome</label>
          <input id="nome" name="nome" className="campo" defaultValue={perfil?.nome ?? ""} maxLength={60} />
        </div>
        <div>
          <label htmlFor="usuario" className="rotulo">Usuário</label>
          <input id="usuario" name="usuario" className="campo" defaultValue={perfil?.usuario ?? ""} placeholder="cesar" maxLength={20} autoCapitalize="none" />
        </div>
        {erro && <p role="alert" className="text-13 font-bold text-perigo">{erro}</p>}
        <button type="submit" disabled={atualizar.isPending} className="botao botao-azul w-full">
          Salvar
        </button>
      </form>
    </section>
  );
}

function Metas() {
  const ano = new Date().getFullYear();
  const { data: metas = [] } = useMetas();
  const salvar = useSalvarMeta();
  const tipos: TipoMidia[] = ["jogo", "filme", "serie"];

  return (
    <section id="metas" className="mt-4 scroll-mt-4 rounded-[24px] bg-cartao p-5">
      <h2 className="titulo text-20">Metas de {ano}</h2>
      <p className="mt-1 text-13 text-texto-suave">Quantos você quer concluir no ano. Deixe vazio para não ter meta.</p>
      <form
        key={metas.map((m) => `${m.tipo}${m.alvo}`).join()}
        onSubmit={async (e) => {
          e.preventDefault();
          const dados = new FormData(e.currentTarget);
          for (const tipo of tipos) {
            const valor = Number(dados.get(tipo));
            const alvo = Number.isInteger(valor) && valor > 0 ? Math.min(valor, 9999) : null;
            const atual = metas.find((m) => m.ano === ano && m.tipo === tipo)?.alvo ?? null;
            if (alvo !== atual) await salvar.mutateAsync({ ano, tipo, alvo });
          }
          mostrarAviso("Metas salvas.");
        }}
        className="mt-3"
      >
        <div className="grid grid-cols-3 gap-3">
          {tipos.map((tipo) => (
            <div key={tipo}>
              <label htmlFor={`meta-${tipo}`} className="rotulo">{ROTULO_TIPO_PLURAL[tipo]}</label>
              <input
                id={`meta-${tipo}`}
                name={tipo}
                inputMode="numeric"
                className="campo text-center"
                defaultValue={metas.find((m) => m.ano === ano && m.tipo === tipo)?.alvo ?? ""}
                placeholder="—"
              />
            </div>
          ))}
        </div>
        <button type="submit" disabled={salvar.isPending} className="botao botao-azul mt-3 w-full">
          Salvar metas
        </button>
      </form>
    </section>
  );
}

async function exportarDados() {
  try {
    const sb = criarClienteNavegador();
    const tabelas = ["perfis", "registros", "listas", "itens_lista", "pecas", "fotos_setup", "metas", "episodios_vistos", "notas_temporada"] as const;
    const dados: Record<string, unknown> = { exportado_em: new Date().toISOString() };
    for (const tabela of tabelas) {
      const consulta = tabela === "registros" ? sb.from(tabela).select("*, midia:midias(*)") : sb.from(tabela).select("*");
      const { data, error } = await consulta;
      if (error) throw error;
      dados[tabela] = data;
    }
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `zerei-dados-${hojeISO()}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    mostrarAviso("Arquivo baixado.");
  } catch (e) {
    avisarErro(e, "Não deu para exportar.");
  }
}

function ExcluirConta({ aberto, aoFechar }: { aberto: boolean; aoFechar: () => void }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [texto, setTexto] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  return (
    <Painel aberto={aberto} aoFechar={aoFechar} titulo="Excluir conta">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (texto !== "EXCLUIR") return;
          setExcluindo(true);
          const resposta = await fetch("/api/conta", { method: "DELETE" });
          if (!resposta.ok) {
            setExcluindo(false);
            const json = await resposta.json().catch(() => ({}));
            avisarErro(json, json.erro === "nao_configurado" ? "Exclusão indisponível: falta configurar o servidor." : "Não deu para excluir.");
            return;
          }
          qc.clear();
          await limparCopiaLocal();
          await criarClienteNavegador().auth.signOut();
          router.replace("/entrar");
        }}
        className="space-y-4 pt-2"
      >
        <p className="text-corpo">
          Isso apaga para sempre sua biblioteca, listas, setup, fotos e metas. Não dá para desfazer. Se quiser, exporte seus
          dados antes.
        </p>
        <div>
          <label htmlFor="confirmar" className="rotulo">Digite EXCLUIR para confirmar</label>
          <input id="confirmar" className="campo" value={texto} onChange={(e) => setTexto(e.target.value)} autoCapitalize="characters" />
        </div>
        <button type="submit" disabled={texto !== "EXCLUIR" || excluindo} className="botao w-full bg-perigo text-white">
          {excluindo ? "Excluindo..." : "Excluir para sempre"}
        </button>
      </form>
    </Painel>
  );
}
