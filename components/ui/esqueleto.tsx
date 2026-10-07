export function Esqueleto({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-[22px] bg-cartao ${className}`} />;
}

export function CarregandoTela() {
  return (
    <div role="status" aria-label="Carregando" className="mt-6 space-y-3">
      <Esqueleto className="h-12 w-2/3" />
      <Esqueleto className="h-44" />
      <Esqueleto className="h-24" />
    </div>
  );
}
