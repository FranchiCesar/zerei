import { NavegacaoInferior } from "@/components/ui/navegacao-inferior";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-md px-4 pt-[max(env(safe-area-inset-top),16px)] pb-[calc(112px+env(safe-area-inset-bottom))]">
      {children}
      <NavegacaoInferior />
    </div>
  );
}
