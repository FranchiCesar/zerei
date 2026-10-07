import { Suspense } from "react";
import { GuardaAcesso } from "@/components/auth/guarda-acesso";
import { SoNoCliente } from "@/components/so-no-cliente";
import { CarregandoTela } from "@/components/ui/esqueleto";
import { NavegacaoInferior } from "@/components/ui/navegacao-inferior";

// As telas do app dependem do usuário, da data e do endereço: renderizam no acesso,
// com o esqueleto de carregamento como casca estática.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-md px-4 pt-[max(env(safe-area-inset-top),16px)] pb-[calc(112px+env(safe-area-inset-bottom))]">
      <Suspense fallback={<CarregandoTela />}>
        <SoNoCliente fallback={<CarregandoTela />}>
          <GuardaAcesso>{children}</GuardaAcesso>
        </SoNoCliente>
      </Suspense>
      <NavegacaoInferior />
    </div>
  );
}
