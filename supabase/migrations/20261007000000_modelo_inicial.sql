-- Zerei: modelo de dados inicial (ver CLAUDE.md > Modelo de dados)
-- Rodar uma vez no SQL Editor do Supabase.

-- ============================================================
-- Tipos
-- ============================================================

create type public.tipo_midia as enum ('jogo', 'filme', 'serie');
create type public.fonte_midia as enum ('igdb', 'tmdb', 'manual');

-- Um enum só para os três tipos; o gatilho valida_status_registro
-- garante quais valores valem para cada tipo de mídia.
create type public.status_registro as enum (
  'jogando', 'na_fila', 'zerado', 'desejo',  -- jogos
  'assistido',                                -- filmes
  'assistindo', 'concluida',                  -- séries
  'quero_ver',                                -- filmes e séries
  'pausado', 'abandonado'                     -- todos (pausado não vale para filme)
);

create type public.categoria_peca as enum (
  'processador', 'placa_video', 'memoria', 'placa_mae', 'armazenamento', 'fonte', 'gabinete',
  'console', 'monitor', 'periferico', 'audio', 'movel'
);

create type public.status_peca as enum ('em_uso', 'guardado', 'vendido', 'quebrado');

-- ============================================================
-- Funções auxiliares
-- ============================================================

create or replace function public.tocar_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

-- ============================================================
-- Tabelas
-- ============================================================

create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text,
  usuario text unique check (usuario ~ '^[a-z0-9_]{3,20}$'),
  avatar_url text,
  criado_em timestamptz not null default now()
);

-- Cópia em cache dos dados da IGDB/TMDB (ou cadastro manual).
create table public.midias (
  id uuid primary key default gen_random_uuid(),
  tipo public.tipo_midia not null,
  fonte public.fonte_midia not null,
  id_externo text,
  titulo text not null check (length(titulo) between 1 and 300),
  capa_url text,
  ano smallint check (ano between 1870 and 2200),
  generos text[] not null default '{}',
  plataformas text[] not null default '{}',
  duracao_min integer check (duracao_min >= 0),
  tempo_zerar_h numeric(6, 1) check (tempo_zerar_h >= 0),
  dados_extra jsonb not null default '{}',
  criado_por uuid references auth.users (id) on delete set null, -- só para cadastro manual
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (fonte, id_externo),
  check ((fonte = 'manual') = (id_externo is null))
);

create table public.pecas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  categoria public.categoria_peca not null,
  marca text,
  modelo text not null check (length(modelo) between 1 and 200),
  foto_url text,
  preco_centavos integer check (preco_centavos >= 0), -- preço sempre em centavos
  comprado_em date,
  loja text,
  garantia_ate date,
  status public.status_peca not null default 'em_uso',
  observacoes text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.registros (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  midia_id uuid not null references public.midias (id) on delete cascade,
  status public.status_registro not null,
  nota numeric(3, 1) check (nota between 0 and 10),
  notas_criterio jsonb not null default '{}', -- { graficos, historia, jogabilidade, trilha, diversao }
  resumo text,
  tags text[] not null default '{}',
  inicio date,
  fim date,
  horas numeric(7, 1) check (horas >= 0),
  conclusao_pct smallint check (conclusao_pct between 0 and 100),
  plataforma text,
  servico text,
  peca_id uuid references public.pecas (id) on delete set null,
  favorito boolean not null default false,
  revisto boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (usuario_id, midia_id),
  check (fim is null or inicio is null or fim >= inicio)
);

create table public.temporadas (
  id uuid primary key default gen_random_uuid(),
  midia_id uuid not null references public.midias (id) on delete cascade,
  numero smallint not null check (numero >= 0),
  total_episodios smallint not null check (total_episodios >= 0),
  unique (midia_id, numero)
);

create table public.episodios_vistos (
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  midia_id uuid not null references public.midias (id) on delete cascade,
  temporada smallint not null check (temporada >= 0),
  episodio smallint not null check (episodio >= 1),
  visto_em timestamptz not null default now(),
  primary key (usuario_id, midia_id, temporada, episodio)
);

create table public.notas_temporada (
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  midia_id uuid not null references public.midias (id) on delete cascade,
  temporada smallint not null check (temporada >= 0),
  nota numeric(3, 1) not null check (nota between 0 and 10),
  primary key (usuario_id, midia_id, temporada)
);

create table public.listas (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome text not null check (length(nome) between 1 and 80),
  descricao text,
  capa_url text,
  publica boolean not null default false,
  criada_em timestamptz not null default now()
);

create table public.itens_lista (
  lista_id uuid not null references public.listas (id) on delete cascade,
  midia_id uuid not null references public.midias (id) on delete cascade,
  posicao integer not null default 0,
  adicionado_em timestamptz not null default now(),
  primary key (lista_id, midia_id)
);

create table public.fotos_setup (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  foto_url text not null,
  legenda text,
  tirada_em date not null default current_date
);

create table public.metas (
  usuario_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  ano smallint not null check (ano between 2000 and 2200),
  tipo public.tipo_midia not null,
  alvo smallint not null check (alvo between 1 and 9999),
  primary key (usuario_id, ano, tipo)
);

-- Índices para as consultas por usuário
create index registros_usuario_status_idx on public.registros (usuario_id, status);
create index registros_midia_idx on public.registros (midia_id);
create index registros_peca_idx on public.registros (peca_id);
create index episodios_vistos_midia_idx on public.episodios_vistos (midia_id);
create index listas_usuario_idx on public.listas (usuario_id);
create index itens_lista_posicao_idx on public.itens_lista (lista_id, posicao);
create index itens_lista_midia_idx on public.itens_lista (midia_id);
create index pecas_usuario_idx on public.pecas (usuario_id, categoria);
create index fotos_setup_usuario_idx on public.fotos_setup (usuario_id);
create index midias_criado_por_idx on public.midias (criado_por);
create index notas_temporada_midia_idx on public.notas_temporada (midia_id);

-- ============================================================
-- Gatilhos
-- ============================================================

create trigger midias_atualizado_em before update on public.midias
  for each row execute function public.tocar_atualizado_em();
create trigger registros_atualizado_em before update on public.registros
  for each row execute function public.tocar_atualizado_em();
create trigger pecas_atualizado_em before update on public.pecas
  for each row execute function public.tocar_atualizado_em();

-- Status válidos por tipo de mídia
create or replace function public.valida_status_registro()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_tipo public.tipo_midia;
begin
  select tipo into v_tipo from public.midias where id = new.midia_id;

  if (v_tipo = 'jogo' and new.status not in ('jogando', 'na_fila', 'zerado', 'pausado', 'abandonado', 'desejo'))
    or (v_tipo = 'filme' and new.status not in ('assistido', 'quero_ver', 'abandonado'))
    or (v_tipo = 'serie' and new.status not in ('assistindo', 'concluida', 'pausado', 'quero_ver', 'abandonado'))
  then
    raise exception 'Status "%" não vale para %', new.status, v_tipo
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger registros_valida_status before insert or update of status, midia_id on public.registros
  for each row execute function public.valida_status_registro();

-- A peça vinculada a um registro precisa ser do mesmo usuário
create or replace function public.valida_peca_registro()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.peca_id is not null and not exists (
    select 1 from public.pecas where id = new.peca_id and usuario_id = new.usuario_id
  ) then
    raise exception 'Peça não encontrada' using errcode = 'foreign_key_violation';
  end if;
  return new;
end;
$$;

create trigger registros_valida_peca before insert or update of peca_id on public.registros
  for each row execute function public.valida_peca_registro();

-- Cria o perfil quando alguém se cadastra (Google ou e-mail)
create or replace function public.criar_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, nome, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger ao_criar_usuario after insert on auth.users
  for each row execute function public.criar_perfil();

-- ============================================================
-- Segurança por linha (RLS)
-- Regra: o usuário só lê e altera o que é dele.
-- midias e temporadas: leitura para todos, escrita só pelo servidor (chave secreta ignora RLS).
-- ============================================================

alter table public.perfis enable row level security;
alter table public.midias enable row level security;
alter table public.registros enable row level security;
alter table public.temporadas enable row level security;
alter table public.episodios_vistos enable row level security;
alter table public.notas_temporada enable row level security;
alter table public.listas enable row level security;
alter table public.itens_lista enable row level security;
alter table public.pecas enable row level security;
alter table public.fotos_setup enable row level security;
alter table public.metas enable row level security;

-- perfis
create policy "perfil: dono lê" on public.perfis
  for select to authenticated using ((select auth.uid()) = id);
create policy "perfil: dono altera" on public.perfis
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- midias e temporadas: só leitura pelo app
create policy "midias: todos leem" on public.midias
  for select to anon, authenticated using (true);
create policy "temporadas: todos leem" on public.temporadas
  for select to anon, authenticated using (true);

-- Tabelas com usuario_id: o mesmo conjunto de políticas
do $$
declare
  t text;
begin
  foreach t in array array['registros', 'episodios_vistos', 'notas_temporada', 'pecas', 'fotos_setup', 'metas']
  loop
    execute format(
      'create policy "%1$s: dono lê" on public.%1$I for select to authenticated using ((select auth.uid()) = usuario_id)', t);
    execute format(
      'create policy "%1$s: dono cria" on public.%1$I for insert to authenticated with check ((select auth.uid()) = usuario_id)', t);
    execute format(
      'create policy "%1$s: dono altera" on public.%1$I for update to authenticated using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id)', t);
    execute format(
      'create policy "%1$s: dono apaga" on public.%1$I for delete to authenticated using ((select auth.uid()) = usuario_id)', t);
  end loop;
end;
$$;

-- listas: dono faz tudo; listas públicas podem ser lidas por qualquer um
create policy "listas: dono ou pública lê" on public.listas
  for select to anon, authenticated using (publica or (select auth.uid()) = usuario_id);
create policy "listas: dono cria" on public.listas
  for insert to authenticated with check ((select auth.uid()) = usuario_id);
create policy "listas: dono altera" on public.listas
  for update to authenticated using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);
create policy "listas: dono apaga" on public.listas
  for delete to authenticated using ((select auth.uid()) = usuario_id);

-- itens_lista: segue o dono da lista
create policy "itens_lista: lê se pode ler a lista" on public.itens_lista
  for select to anon, authenticated using (
    exists (
      select 1 from public.listas l
      where l.id = lista_id and (l.publica or l.usuario_id = (select auth.uid()))
    )
  );
create policy "itens_lista: dono cria" on public.itens_lista
  for insert to authenticated with check (
    exists (select 1 from public.listas l where l.id = lista_id and l.usuario_id = (select auth.uid()))
  );
create policy "itens_lista: dono altera" on public.itens_lista
  for update to authenticated
  using (exists (select 1 from public.listas l where l.id = lista_id and l.usuario_id = (select auth.uid())))
  with check (exists (select 1 from public.listas l where l.id = lista_id and l.usuario_id = (select auth.uid())));
create policy "itens_lista: dono apaga" on public.itens_lista
  for delete to authenticated using (
    exists (select 1 from public.listas l where l.id = lista_id and l.usuario_id = (select auth.uid()))
  );

-- Permissões de acesso pela API (o RLS acima filtra as linhas)
grant usage on schema public to anon, authenticated;
grant select on public.midias, public.temporadas, public.listas, public.itens_lista to anon;
grant select, update on public.perfis to authenticated;
grant select on public.midias, public.temporadas to authenticated;
grant select, insert, update, delete on
  public.registros, public.episodios_vistos, public.notas_temporada,
  public.listas, public.itens_lista, public.pecas, public.fotos_setup, public.metas
  to authenticated;

-- ============================================================
-- Storage: fotos, uma pasta por usuário (<usuario_id>/arquivo.jpg)
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "fotos: dono envia" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'fotos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "fotos: dono altera" on storage.objects
  for update to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "fotos: dono apaga" on storage.objects
  for delete to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = (select auth.uid())::text);
