import { Suspense } from "react";
import { TelaListas } from "@/components/listas/tela-listas";
import { CarregandoTela } from "@/components/ui/esqueleto";

export const metadata = { title: "Listas · Zerei" };

export default function Listas() {
  return (
    <Suspense fallback={<CarregandoTela />}>
      <TelaListas />
    </Suspense>
  );
}
