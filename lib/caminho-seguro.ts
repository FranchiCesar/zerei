/** Aceita só caminhos internos (evita redirecionar para outro site). */
export function caminhoSeguro(valor: string | null | undefined, padrao = "/inicio") {
  if (!valor || !valor.startsWith("/") || valor.startsWith("//") || valor.startsWith("/\\")) {
    return padrao;
  }
  return valor;
}
