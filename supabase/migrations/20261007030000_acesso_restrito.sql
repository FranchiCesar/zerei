-- Acesso restrito: só e-mails da lista entram. O primeiro usuário vira administrador.

create table public.emails_permitidos (
  email text primary key check (email = lower(email) and email like '%_@_%._%'),
  papel text not null default 'usuario' check (papel in ('admin', 'usuario')),
  adicionado_por uuid references auth.users (id) on delete set null,
  adicionado_em timestamptz not null default now()
);

-- O dono atual (único usuário até aqui) vira o administrador
insert into public.emails_permitidos (email, papel)
select lower(email), 'admin' from auth.users
on conflict (email) do update set papel = 'admin';

-- ============================================================
-- Funções de checagem
-- ============================================================

create or replace function public.tem_acesso()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.emails_permitidos
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create or replace function public.sou_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.emails_permitidos
    where email = lower(coalesce(auth.jwt() ->> 'email', '')) and papel = 'admin'
  );
$$;

-- Usada pela tela de login antes de mandar o código (evita e-mails para quem não tem acesso)
create or replace function public.email_tem_acesso(p_email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.emails_permitidos where email = lower(trim(p_email)));
$$;

revoke all on function public.tem_acesso() from public;
revoke all on function public.sou_admin() from public;
revoke all on function public.email_tem_acesso(text) from public;
grant execute on function public.tem_acesso() to authenticated;
grant execute on function public.sou_admin() to authenticated;
grant execute on function public.email_tem_acesso(text) to anon, authenticated;

-- ============================================================
-- Gancho do Supabase Auth: "Before User Created"
-- Recusa a criação de conta (e-mail ou Google) de quem não está na lista.
-- Ativar em Authentication > Hooks > Before User Created > Postgres > public.antes_de_criar_usuario
-- ============================================================

create or replace function public.antes_de_criar_usuario(event jsonb)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
  v_email text := lower(coalesce(event -> 'user' ->> 'email', ''));
begin
  if exists (select 1 from public.emails_permitidos where email = v_email) then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object(
    'error', jsonb_build_object('http_code', 403, 'message', 'Este e-mail não tem acesso ao Zerei.')
  );
end;
$$;

revoke all on function public.antes_de_criar_usuario(jsonb) from public, anon, authenticated;
grant execute on function public.antes_de_criar_usuario(jsonb) to supabase_auth_admin;
grant usage on schema public to supabase_auth_admin;
grant select on public.emails_permitidos to supabase_auth_admin;

-- ============================================================
-- RLS da lista: o gancho lê; o admin vê e altera
-- ============================================================

alter table public.emails_permitidos enable row level security;

create policy "emails: auth lê" on public.emails_permitidos
  for select to supabase_auth_admin using (true);
create policy "emails: admin lê" on public.emails_permitidos
  for select to authenticated using ((select public.sou_admin()));
create policy "emails: admin adiciona" on public.emails_permitidos
  for insert to authenticated with check ((select public.sou_admin()) and papel = 'usuario');
create policy "emails: admin remove" on public.emails_permitidos
  for delete to authenticated using ((select public.sou_admin()) and papel = 'usuario');

grant select, insert, delete on public.emails_permitidos to authenticated;

-- ============================================================
-- Trava geral: quem não está na lista não lê nem grava nada,
-- mesmo que tenha conseguido criar conta. Políticas "restrictive" somam às existentes.
-- ============================================================

do $$
declare
  t text;
begin
  foreach t in array array[
    'perfis', 'registros', 'episodios_vistos', 'notas_temporada',
    'listas', 'itens_lista', 'pecas', 'fotos_setup', 'metas'
  ]
  loop
    execute format(
      'create policy "%1$s: só com acesso" on public.%1$I as restrictive for all to authenticated using ((select public.tem_acesso())) with check ((select public.tem_acesso()))',
      t
    );
  end loop;
end;
$$;

create policy "fotos: só com acesso" on storage.objects
  as restrictive for all to authenticated
  using (bucket_id <> 'fotos' or (select public.tem_acesso()))
  with check (bucket_id <> 'fotos' or (select public.tem_acesso()));


-- Cadastro manual também só para quem tem acesso
create or replace function public.criar_midia_manual(
  p_tipo public.tipo_midia,
  p_titulo text,
  p_ano smallint default null,
  p_plataformas text[] default '{}',
  p_duracao_min integer default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null or not public.tem_acesso() then
    raise exception 'Sem acesso' using errcode = 'insufficient_privilege';
  end if;

  insert into public.midias (tipo, fonte, titulo, ano, plataformas, duracao_min, criado_por)
  values (p_tipo, 'manual', trim(p_titulo), p_ano, coalesce(p_plataformas, '{}'), p_duracao_min, auth.uid())
  returning id into v_id;

  return v_id;
end;
$$;

-- Conferência: deve mostrar o seu e-mail como admin
select email, papel from public.emails_permitidos;
