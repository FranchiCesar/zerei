import { Suspense } from "react";
import { TelaLista } from "@/components/listas/tela-lista";
import { CarregandoTela } from "@/components/ui/esqueleto";

export const metadata = { title: "Lista · Zerei" };

export default function Lista() {
  return (
    <Suspense fallback={<CarregandoTela />}>
      <TelaLista />
    </Suspense>
  );
}
