"use client";

import Link from "next/link";
import { useState } from "react";
import { Compass, EllipsisVertical, Plus, Share, SquarePlus } from "lucide-react";
import { Mascote } from "@/components/ui/mascote";
import { pedirInstalacao, useInstalacao } from "@/lib/instalacao";

type Passo = { icone: React.ReactNode; titulo: React.ReactNode; texto: string };

function Passos({ passos }: { passos: Passo[] }) {
  return (
    <ol className="mt-6 space-y-3">
      {passos.map((passo, i) => (
        <li key={i} className="flex gap-4 rounded-[22px] bg-cartao p-4">
          <span className="titulo flex size-11 shrink-0 items-center justify-center rounded-full bg-azul text-20 text-white">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-corpo font-bold">{passo.titulo}</p>
            <p className="mt-1 text-13 text-texto-suave">{passo.texto}</p>
          </div>
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-azul-claro text-azul"
          >
            {passo.icone}
          </span>
        </li>
      ))}
    </ol>
  );
}

const passosIOS: Passo[] = [
  {
    icone: <Share size={22} strokeWidth={2.2} />,
    titulo: "Toque em Compartilhar",
    texto: "É o quadrado com a seta para cima, na barra do Safari (embaixo no iPhone, em cima no iPad).",
  },
  {
    icone: <SquarePlus size={22} strokeWidth={2.2} />,
    titulo: <>Escolha “Adicionar à Tela de Início”</>,
    texto: "Role a lista de opções para baixo se não aparecer de cara.",
  },
  {
    icone: <Plus size={22} strokeWidth={2.4} />,
    titulo: <>Toque em “Adicionar”</>,
    texto: "Pronto: o Zerei aparece na tela inicial. Abra sempre por lá.",
  },
];

const passosAndroid: Passo[] = [
  {
    icone: <EllipsisVertical size={22} strokeWidth={2.2} />,
    titulo: "Abra o menu do navegador",
    texto: "No Chrome, são os três pontinhos no canto superior direito.",
  },
  {
    icone: <SquarePlus size={22} strokeWidth={2.2} />,
    titulo: <>Toque em “Instalar app”</>,
    texto: "Em alguns aparelhos aparece como “Adicionar à tela inicial”.",
  },
  {
    icone: <Plus size={22} strokeWidth={2.4} />,
    titulo: "Confirme a instalação",
    texto: "O Zerei vai para a gaveta de apps, como qualquer outro.",
  },
];

export function GuiaInstalacao() {
  const { plataforma, podeInstalar } = useInstalacao();
  const [recusou, setRecusou] = useState(false);

  if (plataforma === "desconhecida") {
    return <div className="mt-6 h-72 animate-pulse rounded-[28px] bg-cartao" />;
  }

  if (plataforma === "instalado") {
    return (
      <div className="mt-6 flex flex-col items-center rounded-[28px] bg-cartao px-6 py-10 text-center">
        <Mascote expressao="comemorando" className="h-32 w-auto" />
        <h2 className="titulo mt-5 text-22">Instalado! Que lenda.</h2>
        <p className="mt-2 text-corpo text-texto-suave">
          O Zerei já está rodando como app neste aparelho.
        </p>
        <Link
          href="/inicio"
          className="mt-6 flex h-12 items-center rounded-full bg-azul px-6 text-corpo font-bold text-white"
        >
          Ir para a Início
        </Link>
      </div>
    );
  }

  if (plataforma === "ios-embutido") {
    return (
      <div className="mt-6 rounded-[28px] bg-cartao p-5">
        <div className="flex items-center gap-3">
          <Compass size={28} strokeWidth={2.2} className="text-azul" />
          <h2 className="titulo text-22">Abra no Safari primeiro</h2>
        </div>
        <p className="mt-3 text-corpo text-texto-suave">
          Você está no navegador de dentro de outro app, e ele não deixa instalar.
          Toque nos três pontinhos ou no ícone de bússola e escolha “Abrir no Safari”.
          Depois é só seguir o passo a passo.
        </p>
      </div>
    );
  }

  return (
    <>
      {podeInstalar && (
        <div className="mt-6 rounded-[28px] bg-azul p-5 text-white shadow-destaque">
          <p className="text-corpo font-bold">Seu navegador permite instalar direto.</p>
          <button
            type="button"
            onClick={async () => setRecusou(!(await pedirInstalacao()))}
            className="mt-4 flex h-14 w-full items-center justify-center rounded-full bg-cartao text-corpo font-bold text-texto active:scale-[0.98]"
          >
            Instalar o Zerei
          </button>
          {recusou && (
            <p className="mt-3 text-13 font-bold">Sem problema. Dá para instalar depois pelo menu do navegador.</p>
          )}
        </div>
      )}

      {plataforma === "ios" ? (
        <>
          <h2 className="titulo mt-8 text-22">No iPhone e no iPad</h2>
          <Passos passos={passosIOS} />
          <p className="mt-4 text-13 text-texto-suave">
            Funciona no Safari e, a partir do iOS 16.4, também no Chrome e no Edge pelo mesmo botão Compartilhar.
          </p>
        </>
      ) : (
        <>
          <h2 className="titulo mt-8 text-22">
            {podeInstalar ? "Ou pelo menu" : "Pelo menu do navegador"}
          </h2>
          <Passos passos={passosAndroid} />
        </>
      )}
    </>
  );
}
