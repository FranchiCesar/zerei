import { NextResponse, type NextRequest } from "next/server";
import { caminhoSeguro } from "@/lib/caminho-seguro";
import { criarClienteServidor } from "@/lib/supabase/server";

// Volta do login com Google: troca o código pela sessão.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const codigo = searchParams.get("code");
  const destino = caminhoSeguro(searchParams.get("voltar"));

  if (codigo) {
    const supabase = await criarClienteServidor();
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);
    if (!error) {
      return NextResponse.redirect(`${origin}${destino}`);
    }
  }

  return NextResponse.redirect(`${origin}/entrar?erro=google`);
}
