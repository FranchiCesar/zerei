import { Suspense } from "react";
import { FormularioPeca } from "@/components/setup/formulario-peca";
import { CarregandoTela } from "@/components/ui/esqueleto";

export const metadata = { title: "Nova peça · Zerei" };

export default function NovaPeca() {
  return (
    <Suspense fallback={<CarregandoTela />}>
      <FormularioPeca />
    </Suspense>
  );
}
