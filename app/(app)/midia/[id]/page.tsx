import { Suspense } from "react";
import { TelaFicha } from "@/components/midia/tela-ficha";
import { CarregandoTela } from "@/components/ui/esqueleto";

export const metadata = { title: "Ficha · Zerei" };

export default function Ficha() {
  return (
    <Suspense fallback={<CarregandoTela />}>
      <TelaFicha />
    </Suspense>
  );
}
