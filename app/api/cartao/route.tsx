import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { MASCOTE_SVG } from "@/components/ui/mascote";
import { naoAutorizado, usuarioLogado } from "@/lib/api";

// Cartão compartilhável (1080x1350, formato de post) gerado no servidor.
const LARGURA = 1080;
const ALTURA = 1350;

const COR = {
  marca: "#7C4DFF",
  marcaEscuro: "#5B2EE0",
  marcaClaro: "#ECE5FF",
  tinta: "#00262B",
  papel: "#F4F4F4",
  conquista: "#5CE481",
};

// Mascote em SVG para o rodapé (o Satori desenha imagens, não componentes com hooks)
const MASCOTE = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="120 30 460 630"><defs><linearGradient id="d" x1="350.75" y1="105.737" x2="350.75" y2="585.409" gradientUnits="userSpaceOnUse"><stop stop-color="#9E75FE"/><stop offset="0.15" stop-color="#AD6FFF"/><stop offset="0.48" stop-color="#5CE481"/><stop offset="1" stop-color="#5CE481"/></linearGradient></defs><path d="${MASCOTE_SVG.HALO}" fill="url(#d)"/><path d="${MASCOTE_SVG.FORMA}" fill="${MASCOTE_SVG.CORPO}"/><path d="${MASCOTE_SVG.CONTORNO}" fill="${MASCOTE_SVG.TINTA}"/><path d="M275.5 265.5V317M378 266V317.5" stroke="${MASCOTE_SVG.TINTA}" stroke-width="66" stroke-linecap="round"/></svg>`,
)}`;

// Fontes da marca, baixadas uma vez por instância do servidor
let fontes: Promise<{ name: string; data: ArrayBuffer; weight: 700 | 800 }[]> | null = null;

async function baixarFonte(familia: string, peso: number) {
  const css = await fetch(`https://fonts.googleapis.com/css2?family=${familia}:wght@${peso}`).then((r) => r.text());
  const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error("Fonte não encontrada");
  return fetch(url).then((r) => r.arrayBuffer());
}

function carregarFontes() {
  fontes ??= Promise.all([
    baixarFonte("Bricolage+Grotesque", 800).then((data) => ({ name: "Bricolage", data, weight: 800 as const })),
    baixarFonte("DM+Sans", 700).then((data) => ({ name: "DM Sans", data, weight: 700 as const })),
  ]).catch(() => {
    fontes = null; // tenta de novo na próxima
    return [];
  });
  return fontes;
}

interface ItemCartao {
  titulo: string;
  capa_url: string | null;
}

function CapaCartao({ item, largura }: { item: ItemCartao; largura: number }) {
  const altura = Math.round(largura * 1.33);
  if (item.capa_url) {
    // eslint-disable-next-line @next/next/no-img-element -- renderizado pelo Satori, não pelo navegador
    return <img src={item.capa_url} width={largura} height={altura} style={{ borderRadius: 24, objectFit: "cover" }} alt="" />;
  }
  return (
    <div
      style={{
        width: largura,
        height: altura,
        borderRadius: 24,
        background: COR.tinta,
        color: COR.conquista,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: largura * 0.45,
        fontFamily: "Bricolage",
      }}
    >
      {item.titulo[0]?.toUpperCase()}
    </div>
  );
}

function Moldura({ children, fundo = COR.marca, cor = "#fff" }: { children: React.ReactNode; fundo?: string; cor?: string }) {
  return (
    <div
      style={{
        width: LARGURA,
        height: ALTURA,
        display: "flex",
        flexDirection: "column",
        background: fundo,
        color: cor,
        padding: 72,
        fontFamily: "DM Sans",
      }}
    >
      {children}
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 30 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- renderizado pelo Satori */}
          <img src={MASCOTE} width={64} height={88} alt="" />
          <span style={{ fontFamily: "Bricolage", fontSize: 56 }}>Zerei</span>
        </span>
        <span>Tudo que você zerou, assistiu e montou.</span>
      </div>
    </div>
  );
}

export async function GET(request: NextRequest) {
  const usuario = await usuarioLogado();
  if (!usuario) return naoAutorizado();
  const { supabase } = usuario;
  const params = request.nextUrl.searchParams;
  const tipo = params.get("tipo");

  let conteudo: React.ReactNode;

  if (tipo === "lista") {
    const { data: lista } = await supabase
      .from("listas")
      .select("nome, descricao, itens:itens_lista(posicao, midia:midias(titulo, capa_url))")
      .eq("id", params.get("id") ?? "")
      .single();
    if (!lista) return new Response("Lista não encontrada", { status: 404 });

    const itens = ((lista.itens ?? []) as unknown as { posicao: number; midia: ItemCartao }[])
      .sort((a, b) => a.posicao - b.posicao)
      .slice(0, 9);

    conteudo = (
      <Moldura>
        <span style={{ fontSize: 30, opacity: 0.85 }}>Minha lista</span>
        <span style={{ fontFamily: "Bricolage", fontSize: 92, lineHeight: 0.95, letterSpacing: -3, marginTop: 12 }}>{lista.nome}</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, marginTop: 48 }}>
          {itens.map((i, n) => (
            <div key={n} style={{ display: "flex", position: "relative" }}>
              <CapaCartao item={i.midia} largura={288} />
              <span
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  width: 56,
                  height: 56,
                  borderRadius: 999,
                  background: COR.tinta,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "Bricolage",
                  fontSize: 30,
                }}
              >
                {n + 1}
              </span>
            </div>
          ))}
        </div>
      </Moldura>
    );
  } else if (tipo === "retro") {
    const ano = Number(params.get("ano")) || new Date().getFullYear();
    const { data: registros } = await supabase
      .from("registros")
      .select("status, fim, horas, nota, midia:midias(titulo, capa_url, tipo)")
      .in("status", ["zerado", "assistido", "concluida"])
      .gte("fim", `${ano}-01-01`)
      .lte("fim", `${ano}-12-31`)
      .order("fim", { ascending: false });

    const lista = (registros ?? []) as unknown as {
      status: string;
      horas: number | null;
      nota: number | null;
      midia: ItemCartao & { tipo: string };
    }[];
    const jogos = lista.filter((r) => r.midia.tipo === "jogo");
    const filmes = lista.filter((r) => r.midia.tipo === "filme").length;
    const series = lista.filter((r) => r.midia.tipo === "serie").length;
    const horas = Math.round(lista.reduce((s, r) => s + (r.horas ?? 0), 0));

    const numero = (valor: number, legenda: string) => (
      <div style={{ display: "flex", flexDirection: "column", background: COR.marcaEscuro, borderRadius: 32, padding: "28px 32px", flex: 1 }}>
        <span style={{ fontFamily: "Bricolage", fontSize: 96, lineHeight: 1 }}>{valor}</span>
        <span style={{ fontSize: 28 }}>{legenda}</span>
      </div>
    );

    conteudo = (
      <Moldura>
        <span style={{ fontSize: 34 }}>Retrospectiva</span>
        <span style={{ fontFamily: "Bricolage", fontSize: 180, lineHeight: 0.9, letterSpacing: -6 }}>{ano}</span>
        <div style={{ display: "flex", gap: 20, marginTop: 40 }}>
          {numero(jogos.length, jogos.length === 1 ? "jogo zerado" : "jogos zerados")}
          {numero(filmes, filmes === 1 ? "filme" : "filmes")}
          {numero(series, series === 1 ? "série" : "séries")}
        </div>
        {horas > 0 && <span style={{ fontSize: 34, marginTop: 28 }}>{horas} horas registradas</span>}
        <div style={{ display: "flex", gap: 20, marginTop: 40 }}>
          {jogos.slice(0, 5).map((r, n) => (
            <CapaCartao key={n} item={r.midia} largura={170} />
          ))}
        </div>
      </Moldura>
    );
  } else {
    return new Response("Tipo de cartão inválido", { status: 400 });
  }

  return new ImageResponse(conteudo, {
    width: LARGURA,
    height: ALTURA,
    fonts: await carregarFontes(),
    headers: { "Cache-Control": "private, no-store" },
  });
}
