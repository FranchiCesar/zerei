import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseChavePublica, supabaseUrl } from "./config";

// Rotas abertas sem login
const ROTAS_PUBLICAS = ["/entrar", "/instalar", "/~offline", "/privacidade"];

/** Renova a sessão do Supabase e manda quem não entrou para /entrar. */
export async function atualizarSessao(request: NextRequest) {
  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseChavePublica, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesParaGravar, cabecalhos) {
        cookiesParaGravar.forEach(({ name, value }) => request.cookies.set(name, value));
        resposta = NextResponse.next({ request });
        cookiesParaGravar.forEach(({ name, value, options }) =>
          resposta.cookies.set(name, value, options),
        );
        Object.entries(cabecalhos).forEach(([chave, valor]) => resposta.headers.set(chave, valor));
      },
    },
  });

  // Não colocar código entre a criação do cliente e getClaims():
  // é aqui que o token expirado é renovado.
  const { data } = await supabase.auth.getClaims();
  const logado = Boolean(data?.claims);

  const caminho = request.nextUrl.pathname;
  const publica = ROTAS_PUBLICAS.some((r) => caminho === r || caminho.startsWith(`${r}/`));
  // Rotas de API respondem 401 em JSON por conta própria; redirecionar quebraria o fetch
  const api = caminho.startsWith("/api/");

  if (!logado && !publica && !api) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.search = "";
    if (caminho !== "/" && caminho !== "/inicio") url.searchParams.set("voltar", caminho);
    return redirecionar(url, resposta);
  }

  if (logado && caminho === "/entrar") {
    const url = request.nextUrl.clone();
    url.pathname = "/inicio";
    url.search = "";
    return redirecionar(url, resposta);
  }

  return resposta;
}

// Mantém os cookies renovados também nos redirecionamentos
function redirecionar(url: URL, resposta: NextResponse) {
  const redirecionamento = NextResponse.redirect(url);
  resposta.cookies.getAll().forEach((cookie) => redirecionamento.cookies.set(cookie));
  return redirecionamento;
}
