import { Suspense } from "react";
import { TelaRetrospectiva } from "@/components/retrospectiva/tela-retrospectiva";
import { CarregandoTela } from "@/components/ui/esqueleto";

export const metadata = { title: "Retrospectiva · Zerei" };

export default function Retrospectiva() {
  return (
    <Suspense fallback={<CarregandoTela />}>
      <TelaRetrospectiva />
    </Suspense>
  );
}
