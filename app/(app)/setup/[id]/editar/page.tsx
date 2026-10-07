import { Suspense } from "react";
import { FormularioPeca } from "@/components/setup/formulario-peca";
import { CarregandoTela } from "@/components/ui/esqueleto";

export const metadata = { title: "Editar peça · Zerei" };

export default function EditarPeca() {
  return (
    <Suspense fallback={<CarregandoTela />}>
      <FormularioPeca />
    </Suspense>
  );
}
