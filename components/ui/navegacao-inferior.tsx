"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Columns2, House, List, Plus, User, type LucideIcon } from "lucide-react";

function ItemNav({
  href,
  rotulo,
  Icone,
  ativo,
}: {
  href: string;
  rotulo: string;
  Icone: LucideIcon;
  ativo: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={rotulo}
      aria-current={ativo ? "page" : undefined}
      className={`flex size-12 items-center justify-center rounded-full transition-colors ${
        ativo ? "text-azul" : "text-white hover:text-white/80"
      }`}
    >
      <Icone size={24} strokeWidth={2.2} />
    </Link>
  );
}

export function NavegacaoInferior() {
  const caminho = usePathname();
  const ativo = (href: string) =>
    caminho === href || caminho.startsWith(`${href}/`);

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md px-4 pb-[max(env(safe-area-inset-bottom),12px)]"
    >
      <div className="flex h-16 items-center justify-around rounded-full bg-tinta px-3">
        <ItemNav href="/inicio" rotulo="Início" Icone={House} ativo={ativo("/inicio")} />
        <ItemNav href="/biblioteca" rotulo="Biblioteca" Icone={Columns2} ativo={ativo("/biblioteca")} />
        <Link
          href="/adicionar"
          aria-label="Adicionar"
          aria-current={ativo("/adicionar") ? "page" : undefined}
          className="-mt-9 box-content flex size-14 shrink-0 items-center justify-center rounded-full border-4 border-papel bg-azul text-white shadow-destaque transition-colors active:bg-azul-escuro"
        >
          <Plus size={28} strokeWidth={2.6} />
        </Link>
        <ItemNav href="/listas" rotulo="Listas" Icone={List} ativo={ativo("/listas")} />
        <ItemNav href="/perfil" rotulo="Perfil" Icone={User} ativo={ativo("/perfil")} />
      </div>
    </nav>
  );
}
