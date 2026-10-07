import { Mascote } from "./mascote";

export function Esqueleto({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-[22px] bg-cartao ${className}`} />;
}

export function CarregandoTela() {
  return (
    <div role="status" aria-label="Carregando" className="mt-6 space-y-3">
      <div className="flex items-end gap-3">
        <Esqueleto className="h-12 flex-1" />
        <Mascote expressao="pensando" animacao="flutuar" className="h-16 w-auto shrink-0" />
      </div>
      <Esqueleto className="h-44" />
      <Esqueleto className="h-24" />
    </div>
  );
}
