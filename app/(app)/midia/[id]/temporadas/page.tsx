import { Suspense } from "react";
import { TelaTemporadas } from "@/components/midia/tela-temporadas";
import { CarregandoTela } from "@/components/ui/esqueleto";

export const metadata = { title: "Temporadas · Zerei" };

export default function Temporadas() {
  return (
    <Suspense fallback={<CarregandoTela />}>
      <TelaTemporadas />
    </Suspense>
  );
}
