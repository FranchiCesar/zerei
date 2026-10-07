-- Categorias que faltavam para o setup real: coolers/ventoinhas e acessórios (hub, suportes, bases).
-- Rodar sozinho, antes de usar os valores novos (o Postgres exige um commit entre os dois).
alter type public.categoria_peca add value if not exists 'refrigeracao' after 'gabinete';
alter type public.categoria_peca add value if not exists 'acessorio';
