"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, GripVertical, Pencil, Plus, Share2, Trash2, X } from "lucide-react";
import { Capa } from "@/components/ui/capa";
import { CarregandoTela } from "@/components/ui/esqueleto";
import { EstadoVazio } from "@/components/ui/estado-vazio";
import { Painel } from "@/components/ui/painel";
import { BotaoRedondo, Topo } from "@/components/ui/topo";
import { compartilharCartao } from "@/lib/compartilhar";
import {
  useAlternarItemLista,
  useApagarLista,
  useEditarLista,
  useListas,
  useRegistros,
  useReordenarLista,
} from "@/lib/dados";
import { plural } from "@/lib/formato";
import { ROTULO_TIPO } from "@/lib/status";
import type { ItemLista, ListaComItens } from "@/lib/tipos";

export function TelaLista() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: listas, isPending } = useListas();
  const reordenar = useReordenarLista();
  const alternar = useAlternarItemLista();
  const apagar = useApagarLista();
  const [editando, setEditando] = useState(false);
  const [adicionando, setAdicionando] = useState(false);
  const [gerando, setGerando] = useState(false);

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (isPending) return <CarregandoTela />;
  const lista = listas?.find((l) => l.id === id);
  if (!lista) {
    return (
      <main>
        <Topo voltarPara="/listas" />
        <EstadoVazio titulo="Lista não encontrada." texto="Ela pode ter sido apagada." />
      </main>
    );
  }

  const aoSoltar = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const ids = lista.itens.map((i) => i.midia_id);
    const nova = arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
    reordenar.mutate({ listaId: lista.id, ordem: nova });
  };

  return (
    <main>
      <Topo voltarPara="/listas">
        <BotaoRedondo
          rotulo="Compartilhar como imagem"
          onClick={async () => {
            setGerando(true);
            await compartilharCartao(`/api/cartao?tipo=lista&id=${lista.id}`, `zerei-${lista.nome}`, `Minha lista "${lista.nome}" no Zerei`);
            setGerando(false);
          }}
        >
          <Share2 size={20} strokeWidth={2.2} className={gerando ? "animate-pulse" : ""} />
        </BotaoRedondo>
        <BotaoRedondo rotulo="Editar lista" onClick={() => setEditando(true)}>
          <Pencil size={20} strokeWidth={2.2} />
        </BotaoRedondo>
      </Topo>

      <h1 className="titulo mt-6 text-tela [overflow-wrap:anywhere]">{lista.nome}</h1>
      {lista.descricao && <p className="mt-3 text-corpo text-texto-suave">{lista.descricao}</p>}
      <p className="mt-2 text-13 font-bold">{plural(lista.itens.length, "item", "itens")}</p>

      <button type="button" onClick={() => setAdicionando(true)} className="botao botao-azul mt-4 w-full">
        <Plus size={20} strokeWidth={2.4} /> Adicionar da biblioteca
      </button>

      {lista.itens.length === 0 ? (
        <EstadoVazio expressao="procurando" titulo="Lista vazia." texto="Adicione títulos da sua biblioteca." />
      ) : (
        <>
          <p className="mt-4 text-12 text-texto-suave">Segure e arraste pela alça para mudar a ordem.</p>
          <DndContext sensors={sensores} collisionDetection={closestCenter} onDragEnd={aoSoltar}>
            <SortableContext items={lista.itens.map((i) => i.midia_id)} strategy={verticalListSortingStrategy}>
              <ol className="mt-2 space-y-2">
                {lista.itens.map((item, indice) => (
                  <ItemOrdenavel
                    key={item.midia_id}
                    item={item}
                    posicao={indice + 1}
                    aoRemover={() => alternar.mutate({ listaId: lista.id, midiaId: item.midia_id, incluir: false })}
                  />
                ))}
              </ol>
            </SortableContext>
          </DndContext>
        </>
      )}

      <EditarLista lista={lista} aberto={editando} aoFechar={() => setEditando(false)} aoApagar={() => {
        if (window.confirm(`Apagar a lista "${lista.nome}"? Os títulos continuam na biblioteca.`)) {
          apagar.mutate(lista.id, { onSuccess: () => router.replace("/listas") });
        }
      }} />
      <AdicionarItens lista={lista} aberto={adicionando} aoFechar={() => setAdicionando(false)} />
    </main>
  );
}

function ItemOrdenavel({ item, posicao, aoRemover }: { item: ItemLista; posicao: number; aoRemover: () => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: item.midia_id,
  });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 rounded-[20px] bg-cartao p-2 ${isDragging ? "relative z-10 shadow-xl" : ""}`}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label={`Mover ${item.midia.titulo}`}
        className="flex size-11 shrink-0 touch-none items-center justify-center rounded-full text-texto-suave"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={20} strokeWidth={2.2} />
      </button>
      <span className="titulo w-6 shrink-0 text-center text-20">{posicao}</span>
      <Link href={`/midia/${item.midia_id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <Capa midia={item.midia} className="h-14 w-10 shrink-0 rounded-[10px]" tamanhoLetra="text-20" />
        <span className="min-w-0">
          <span className="block truncate text-corpo font-bold">{item.midia.titulo}</span>
          <span className="block text-12 text-texto-suave">
            {[ROTULO_TIPO[item.midia.tipo], item.midia.ano].filter(Boolean).join(" · ")}
          </span>
        </span>
      </Link>
      <button
        type="button"
        onClick={aoRemover}
        aria-label={`Tirar ${item.midia.titulo} da lista`}
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-chip"
      >
        <X size={18} strokeWidth={2.2} />
      </button>
    </li>
  );
}

function EditarLista({
  lista,
  aberto,
  aoFechar,
  aoApagar,
}: {
  lista: ListaComItens;
  aberto: boolean;
  aoFechar: () => void;
  aoApagar: () => void;
}) {
  const editar = useEditarLista();
  return (
    <Painel aberto={aberto} aoFechar={aoFechar} titulo="Editar lista">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const dados = new FormData(e.currentTarget);
          const nome = String(dados.get("nome") ?? "").trim();
          if (!nome) return;
          editar.mutate(
            { id: lista.id, nome: nome.slice(0, 80), descricao: String(dados.get("descricao") ?? "").trim() || null },
            { onSuccess: aoFechar },
          );
        }}
        className="space-y-4 pt-2"
      >
        <div>
          <label htmlFor="e-nome" className="rotulo">Nome</label>
          <input id="e-nome" name="nome" className="campo" defaultValue={lista.nome} maxLength={80} required />
        </div>
        <div>
          <label htmlFor="e-desc" className="rotulo">Descrição</label>
          <textarea id="e-desc" name="descricao" rows={2} className="campo resize-none" defaultValue={lista.descricao ?? ""} maxLength={300} />
        </div>
        <button type="submit" disabled={editar.isPending} className="botao botao-azul w-full">Salvar</button>
        <button type="button" onClick={aoApagar} className="botao botao-perigo w-full">
          <Trash2 size={18} strokeWidth={2.2} /> Apagar lista
        </button>
      </form>
    </Painel>
  );
}

function AdicionarItens({ lista, aberto, aoFechar }: { lista: ListaComItens; aberto: boolean; aoFechar: () => void }) {
  const { data: registros = [] } = useRegistros();
  const alternar = useAlternarItemLista();
  const [texto, setTexto] = useState("");
  const dentro = new Set(lista.itens.map((i) => i.midia_id));
  const busca = texto.trim().toLowerCase();
  const opcoes = registros
    .filter((r) => !busca || r.midia.titulo.toLowerCase().includes(busca))
    .sort((a, b) => a.midia.titulo.localeCompare(b.midia.titulo, "pt-BR"));

  return (
    <Painel aberto={aberto} aoFechar={aoFechar} titulo="Adicionar à lista">
      <label htmlFor="add-busca" className="sr-only">Procurar na biblioteca</label>
      <input
        id="add-busca"
        type="search"
        className="campo sticky top-0 z-10"
        placeholder="Procurar na biblioteca"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      <ul className="mt-3 space-y-1">
        {opcoes.map((r) => {
          const incluido = dentro.has(r.midia_id);
          return (
            <li key={r.id}>
              <button
                type="button"
                aria-pressed={incluido}
                disabled={alternar.isPending}
                onClick={() => alternar.mutate({ listaId: lista.id, midiaId: r.midia_id, incluir: !incluido })}
                className="flex w-full items-center gap-3 rounded-[16px] p-2 text-left hover:bg-chip"
              >
                <Capa midia={r.midia} className="h-12 w-9 shrink-0 rounded-[8px]" tamanhoLetra="text-13" />
                <span className="min-w-0 flex-1 truncate text-corpo font-bold">{r.midia.titulo}</span>
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full ${incluido ? "bg-azul text-white" : "bg-chip"}`}
                >
                  {incluido ? <Check size={18} strokeWidth={2.6} /> : <Plus size={18} strokeWidth={2.4} />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Painel>
  );
}
