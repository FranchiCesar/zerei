import { Suspense } from "react";
import { TelaAdicionar } from "@/components/adicionar/tela-adicionar";
import { CarregandoTela } from "@/components/ui/esqueleto";

export const metadata = { title: "Adicionar · Zerei" };

export default function Adicionar() {
  return (
    <Suspense fallback={<CarregandoTela />}>
      <TelaAdicionar />
    </Suspense>
  );
}
