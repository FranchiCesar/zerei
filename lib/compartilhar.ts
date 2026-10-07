"use client";

import { avisarErro, mostrarAviso } from "./avisos";

/** Baixa o cartão PNG do servidor e abre o compartilhar do celular (ou baixa o arquivo). */
export async function compartilharCartao(url: string, nomeArquivo: string, texto: string) {
  try {
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error(`Cartão respondeu ${resposta.status}`);
    const blob = await resposta.blob();
    const arquivo = new File([blob], `${nomeArquivo}.png`, { type: "image/png" });

    if (navigator.canShare?.({ files: [arquivo] })) {
      await navigator.share({ files: [arquivo], text: texto });
      return;
    }
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = arquivo.name;
    link.click();
    URL.revokeObjectURL(link.href);
    mostrarAviso("Imagem baixada.");
  } catch (erro) {
    // Usuário fechou o compartilhar: não é erro
    if (erro instanceof DOMException && erro.name === "AbortError") return;
    avisarErro(erro, "Não deu para gerar a imagem.");
  }
}
