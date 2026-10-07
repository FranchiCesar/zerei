import { Suspense } from "react";
import { TelaPeca } from "@/components/setup/tela-peca";
import { CarregandoTela } from "@/components/ui/esqueleto";

export const metadata = { title: "Peça · Zerei" };

export default function Peca() {
  return (
    <Suspense fallback={<CarregandoTela />}>
      <TelaPeca />
    </Suspense>
  );
}
