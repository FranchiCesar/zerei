import { NextResponse, type NextRequest } from "next/server";
import { caminhoSeguro } from "@/lib/caminho-seguro";
import { criarClienteServidor } from "@/lib/supabase/server";

// Volta do login com Google: troca o código pela sessão.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const codigo = searchParams.get("code");
  const destino = caminhoSeguro(searchParams.get("voltar"));

  // O gancho "Before User Created" recusou a conta (e-mail fora da lista)
  if (searchParams.get("error")) {
    return NextResponse.redirect(`${origin}/entrar?erro=acesso`);
  }

  if (codigo) {
    const supabase = await criarClienteServidor();
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);
    if (!error) {
      // Segunda trava: conta existe mas o e-mail não está liberado
      const { data: temAcesso } = await supabase.rpc("tem_acesso");
      if (temAcesso !== true) {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/entrar?erro=acesso`);
      }
      return NextResponse.redirect(`${origin}${destino}`);
    }
  }

  return NextResponse.redirect(`${origin}/entrar?erro=google`);
}
