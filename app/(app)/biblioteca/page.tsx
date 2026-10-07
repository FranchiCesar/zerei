import { Suspense } from "react";
import { TelaBiblioteca } from "@/components/biblioteca/tela-biblioteca";
import { CarregandoTela } from "@/components/ui/esqueleto";

export const metadata = { title: "Biblioteca · Zerei" };

export default function Biblioteca() {
  return (
    <Suspense fallback={<CarregandoTela />}>
      <TelaBiblioteca />
    </Suspense>
  );
}
