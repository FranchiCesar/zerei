@AGENTS.md

# Zerei — documento do projeto

PWA para registrar tudo o que você jogou, assistiu e montou: jogos, filmes, séries e o seu setup, em um só lugar.
Slogan: **Tudo que você zerou, assistiu e montou.**

Público: jogadores de 18 a 40 anos que consomem jogos e streaming, gostam de organizar listas e mostrar o próprio setup.

## Proposta de valor
- Um único histórico para jogos, filmes e séries, com status, nota e resumo
- O setup ligado aos jogos: em qual máquina cada jogo foi zerado
- Visual forte e compartilhável: retrospectiva anual e cartões para redes sociais
- Instalável no celular, sem loja, com uso offline da biblioteca

## Escopo do lançamento
| Entra no lançamento | Fica para depois |
|---|---|
| Jogos com busca pela IGDB | Importar biblioteca da Steam |
| Filmes e séries com busca pela TMDB | Importar da PSN e do Xbox |
| Progresso de séries por temporada e episódio | Notificações de novos episódios |
| Setup com peças, fotos e valor total | Compatibilidade do jogo com o setup |
| Listas mistas e meta anual | Preços e promoções da lista de desejos |
| Perfil, gráficos e retrospectiva anual | Amigos, recomendações e desafios |
| Cartão compartilhável em imagem | Alertas de garantia das peças |
| Instalação como PWA e biblioteca offline | Perfil público |

## Funcionalidades

### Comum a toda mídia
- Busca por API e cadastro manual quando não encontrar
- Nota geral de 0 a 10 e resumo pessoal com tags (emocionante, cansativo, joga de novo)
- Datas de início e fim, e onde jogou ou assistiu
- Favoritar e adicionar a uma ou mais listas

### Jogos
- Status: Jogando, Na fila, Zerado, Pausado, Abandonado, Desejo
- Plataforma, horas jogadas e porcentagem de conclusão (história, 100%, platina)
- Notas por critério: gráficos, história, jogabilidade, trilha sonora, diversão
- Vínculo com a máquina do setup em que foi jogado
- Tempo médio para zerar, vindo da IGDB

### Filmes
- Status: Assistido, Quero ver, Abandonado
- Onde assistiu (cinema, Netflix, Prime e outros) e marcação de revisto

### Séries
- Status: Assistindo, Concluída, Pausada, Quero ver, Abandonada
- Marcação de episódios assistidos, barra por temporada e próximo episódio
- Nota por temporada além da nota geral

### Setup
- Categorias: PC (processador, placa de vídeo, memória, placa-mãe, armazenamento, fonte, gabinete, refrigeração), console, monitor, periféricos, áudio, móveis, acessórios
- Ficha da peça: foto, marca, modelo, preço pago, data e loja da compra, garantia
- Status com você: Em uso, Guardado, Emprestado, Em conserto, Quebrado (quebrada fica na lista, mas sai do valor)
- Status de saída: Vendido, Trocado, Doado, Descartado — saem do setup atual, vão para a aba "Vendidos e saídas" e deixam de contar no valor
- Cada mudança guarda data (`status_desde`), valor da venda/troca (`valor_saida_centavos`), com quem (`status_com`), onde (`status_onde`) e detalhes (`status_detalhes`); a venda mostra lucro ou prejuízo sobre o preço pago
- O status muda pelo botão "Mudar status" na ficha da peça (o formulário de edição não mexe no status)
- Valor total investido, com divisão por categoria, e galeria de fotos do setup

### Organização e motivação
- Listas personalizadas e mistas, reordenáveis
- Meta anual por tipo (ex.: 20 jogos e 50 filmes)
- Sugestão do próximo da fila por tempo disponível
- Retrospectiva anual em formato de stories e cartão em imagem
- Linha do tempo única de tudo o que foi concluído e das peças adquiridas

## Telas
Navegação inferior de 5 itens: Início, Biblioteca, Adicionar (botão central), Listas e Perfil. O Setup fica acessível pelo Perfil e por um atalho na Início.

| # | Tela | O que tem |
|---|---|---|
| 1 | Boas-vindas e login | Entrar com e-mail (código de 6 dígitos); dica guiada de instalação do PWA |
| 2 | Início | Jogando agora e Assistindo agora em destaque, meta anual, próximos da fila, últimos concluídos, atalho do setup |
| 3 | Adicionar | Busca única com filtro Jogo, Filme, Série; resultados com capa e ano; adicionar rápido com status |
| 4 | Ficha da mídia | Capa, dados da API, seu status, nota, resumo, datas, listas; blocos extras por tipo |
| 5 | Editar registro | Painel inferior com status, plataforma ou serviço, datas, horas, notas e resumo |
| 6 | Temporadas da série | Temporadas e episódios com marcação, nota por temporada, próximo episódio |
| 7 | Biblioteca | Filtro de tipo no topo, abas por status, filtros, ordenação, grade ou lista |
| 8 | Listas | Mosaico das listas e botão de nova lista |
| 9 | Detalhe da lista | Nome, descrição, itens reordenáveis, compartilhar como imagem |
| 10 | Meu setup | Valor total, categorias, galeria de fotos, botão de adicionar peça |
| 11 | Ficha da peça | Foto, marca, modelo, preço, compra, garantia, status, jogos jogados nela |
| 12 | Editar peça | Formulário com foto pela câmera |
| 13 | Perfil | Totais, gráficos por gênero e plataforma, linha do tempo, conquistas, metas |
| 14 | Retrospectiva | Sequência em stories do ano e imagem para compartilhar |
| 15 | Configurações | Conta, tema, metas, exportar dados, sair |

## Identidade visual
Inspirada no mascote (fantasminha): fundo claro com linhas de relevo, petróleo profundo, roxo elétrico e verde de conquista, com o degradê roxo → verde como assinatura.

### Cores (modo claro) — definidas como variáveis CSS em `app/globals.css`
| Token | Hex | Uso |
|---|---|---|
| marca | #7C4DFF | Cor principal: cartão em destaque, botão central, botões primários |
| marca-escuro | #5B2EE0 | Estado pressionado |
| marca-claro | #ECE5FF | Fundos de chips, seleção e barras vazias |
| marca-texto | #5B2EE0 | Texto roxo sobre fundo claro |
| tinta | #00262B | Texto, navegação inferior, contorno do mascote |
| papel | #F4F4F4 | Fundo das telas, com linhas de relevo a 5% de opacidade |
| cartao | #FFFFFF | Cartões e botões em pílula |
| texto-suave | #4C6366 | Legendas e informações secundárias |
| conquista | #5CE481 | Zerado, metas batidas, retrospectiva e destaque sobre fundo tinta (ícone ativo da navegação) |
| gradiente | #9E75FE → #AD6FFF → #5CE481 | Halo do mascote e anel da foto de perfil (`bg-gradiente`) |

Texto branco sobre marca tem contraste 4,8:1.
Modo escuro: papel → #08181B, cartao → #112529, marca → #8457FF.

### Cores de status
| Status | Hex |
|---|---|
| Jogando ou Assistindo | #7C4DFF |
| Na fila ou Quero ver | #F2A93B |
| Zerado ou Concluído | #5CE481 com texto tinta |
| Pausado | #9AA3B5 |
| Abandonado | #2B3F42 com texto branco |

### Tipografia
- Títulos: Bricolage Grotesque, peso 800, entrelinha 0,95 e espaçamento negativo
- Texto e interface: DM Sans, pesos 400, 500 e 700
- Escala: 46 (título de tela), 34 (destaque), 22, 20, 15 (corpo), 13, 12 e 11 (legendas)

### Formas e componentes
- Raios: 28 nos cartões grandes, 20 a 24 nos médios, pílula (999) em botões e chips
- Botões redondos de 48 px no topo; alvo de toque mínimo de 44 px
- Navegação inferior flutuante em tinta, com botão central roxo de 56 px elevado
- Sombra única e suave nos cartões em destaque; o resto é plano
- Ícones em traço de 2,2 px, cantos arredondados (Lucide)

### Logo, ícone e mascote
- Marca: "Zerei" em Bricolage Grotesque 800, cor tinta
- Ícone: o mascote sobre quadrado tinta (#00262B) com cantos arredondados (`npm run icones` gera a partir de `components/ui/mascote.tsx`)
- Mascote: fantasminha de corpo claro (#F4F4F4), base em zigue-zague, contorno tinta, halo em degradê roxo → verde e olhos em barra. Detalhes que ficam fora do corpo (brilhos, "z", "?", pontinhos) ficam no canto de cima, fora do halo
- Expressões (`<Mascote expressao animacao>`, animação "flutuar" ou "pular"): neutro; feliz (avisos de sucesso, jogando agora); comemorando (zerou, meta batida, backlog limpo); deslumbrado (platinou, abertura da retrospectiva); piscando (login, venda, emprestado, desejo); dormindo (nada rolando, sem internet, vazio, pausado, guardado); procurando (busca, filtros vazios); confuso (sem resultado, 404, não encontrado); pensando (carregando, na fila, em conserto); surpreso (garantia vencendo); triste (sem acesso, abandonado, descartado); tonto (erros, peça quebrada). Mapas em `lib/status.ts` (`expressaoDoRegistro`, `EXPRESSAO_STATUS_PECA`)
- Topo da Início: à esquerda, foto e primeiro nome (leva ao Perfil); à direita, a contagem de zerados. Foto e nome se editam tocando na foto do Perfil ou em Configurações → Conta (foto vai para `fotos/{uid}/perfil/`)

### Tom de voz
Direto, bem-humorado e gamer, em português do Brasil e sem gírias forçadas.
- Ao zerar: "Zerado! Qual vai ser o próximo?"
- Fila vazia: "Backlog limpo. Que lenda."
- Busca sem resultado: "Esse não encontramos. Quer cadastrar manualmente?"
- Setup vazio: "Seu setup está sem peças. Comece pela principal."

## Stack e APIs
Next.js na Vercel com Supabase. As APIs de conteúdo são chamadas **sempre pelo servidor**, nunca pelo navegador.

| Camada | Escolha | Observação |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Rotas de API intermediam IGDB e TMDB |
| Estilo | Tailwind CSS com os tokens da marca | Tokens viram variáveis CSS |
| Componentes | shadcn/ui como base, restilizado | Painel inferior, abas, diálogos acessíveis |
| Banco, login e fotos | Supabase (Postgres, Auth, Storage) | Plano gratuito; RLS |
| PWA | Serwist | Manifesto, service worker e cache |
| Offline | Dexie (IndexedDB) | Cópia local da biblioteca e das listas |
| Dados no cliente | TanStack Query | Cache e sincronização |
| Formulários | React Hook Form + Zod | Validação igual no cliente e no servidor |
| Gráficos | Recharts | Perfil e retrospectiva |
| Imagem compartilhável | @vercel/og | Cartão em PNG no servidor |
| Hospedagem | Vercel | Plano gratuito |

| API | Para quê | Acesso |
|---|---|---|
| IGDB | Jogos: capas, gêneros, plataformas, tempo para zerar | Conta Twitch (Client ID e Secret); 4 req/s |
| TMDB | Filmes e séries: capas, elenco, temporadas, episódios | Chave gratuita; exige crédito à TMDB no app |
| Setup | Sem API | Cadastro manual, catálogo próprio de marcas e modelos |

**Regra de ouro:** o app salva uma cópia dos dados da mídia no Supabase na primeira vez que ela é adicionada.

## Modelo de dados
Uma tabela `midias` guarda jogos, filmes e séries; `registros` liga cada usuário a cada mídia.

| Tabela | Campos principais | Observação |
|---|---|---|
| perfis | id (do Auth), nome, usuario, avatar_url, criado_em | Um por usuário |
| midias | id, tipo (jogo, filme, serie), fonte (igdb, tmdb, manual), id_externo, titulo, capa_url, ano, generos, plataformas, duracao_min, tempo_zerar_h, dados_extra (json) | Cache da API; única por fonte + id_externo |
| registros | id, usuario_id, midia_id, status, nota, notas_criterio (json), resumo, tags, inicio, fim, horas, conclusao_pct, plataforma, servico, peca_id, favorito, revisto | Um por usuário e mídia |
| temporadas | id, midia_id, numero, total_episodios | Só para séries |
| episodios_vistos | usuario_id, midia_id, temporada, episodio, visto_em | Progresso da série |
| notas_temporada | usuario_id, midia_id, temporada, nota | Opcional |
| listas | id, usuario_id, nome, descricao, capa_url, publica, criada_em | Listas mistas |
| itens_lista | lista_id, midia_id, posicao, adicionado_em | Ordem pela posição |
| pecas | id, usuario_id, categoria, marca, modelo, foto_url, preco_centavos, comprado_em, loja, garantia_ate, status, observacoes | Setup |
| fotos_setup | id, usuario_id, foto_url, legenda, tirada_em | Galeria e evolução |
| metas | usuario_id, ano, tipo, alvo | Meta anual por tipo |

Regras:
- RLS em todas as tabelas: "usuário só lê e altera o que é dele"; `midias` é leitura para todos e escrita só pelo servidor
- Status como enum do Postgres, com valores válidos por tipo de mídia
- Preços em centavos (inteiro), nunca decimal
- Fotos no Supabase Storage, uma pasta por usuário
- Chaves em `.env.local`, nunca no Git

## Estrutura de pastas
```
app/
  (auth)/entrar/
  (app)/inicio/  biblioteca/  adicionar/  midia/[id]/  listas/[id]/  setup/[id]/
  (app)/perfil/  retrospectiva/[ano]/  configuracoes/
  api/igdb/  api/tmdb/  api/cartao/
  manifest.ts  sw.ts
components/ ui/  midia/  setup/
lib/ supabase/  igdb.ts  tmdb.ts  offline.ts
supabase/migrations/
public/icons/
```

## Etapas
1. **Base do projeto** — Next.js + TS + Tailwind, tokens de cor, fontes, navegação inferior com 5 itens. ✅
2. **PWA** — Serwist: manifesto "Zerei", ícones, cor de tema tinta, instalação guiada para iPhone. ✅
3. **Supabase e login** — migrações do modelo de dados com RLS, login por e-mail com código. ✅
4. **Busca e ficha** — rotas de API IGDB/TMDB, tela Adicionar com busca única, Ficha da mídia com cache em `midias`.
5. **Biblioteca** — filtro de tipo, abas por status, filtros, ordenação, painel de editar registro.
6. **Séries** — temporadas com marcação de episódios, barra de progresso, próximo episódio.
7. **Listas e Início** — listas mistas reordenáveis; Início com Jogando agora, meta anual e próximos da fila.
8. **Setup** — peças por categoria, foto pela câmera no Storage, valor total, vínculo peça ↔ jogos.
9. **Perfil e retrospectiva** — gráficos, linha do tempo, retrospectiva em stories, cartão com @vercel/og.
10. **Offline e acabamento** — Dexie, estados vazios com mascote, modo escuro, acessibilidade.

## Notas de implementação
- PWA com `@serwist/turbopack`: o service worker vem de `app/sw.ts`, servido em `/serwist/sw.js` por `app/serwist/[path]/route.ts`. Fica **desligado em `npm run dev`**; para testar o PWA use `npm run build` + `npm start`.
- Página offline de reserva: `app/~offline/page.tsx` (pré-cacheada).
- Ícones gerados por `npm run icones` (`scripts/gerar-icones.mjs`, usa sharp).
- Detecção de plataforma e prompt de instalação: `lib/instalacao.ts`; guia em `/instalar`.
- Supabase: clientes em `lib/supabase/` (`client.ts` navegador, `server.ts` servidor, `proxy.ts` renova sessão). `proxy.ts` na raiz manda quem não entrou para `/entrar` (rotas públicas listadas em `lib/supabase/proxy.ts`).
- Login: só e-mail com **código de 6 dígitos** (OTP), não link mágico — link abriria fora do PWA no iPhone. O login com Google foi removido (app de uso pessoal). O template de e-mail do Supabase precisa ter `{{ .Token }}`.
- **Acesso restrito (uso pessoal, sem fins comerciais):** só e-mails da tabela `emails_permitidos` entram. O primeiro usuário é `admin` e libera/remove e-mails em Configurações. Três travas: checagem `email_tem_acesso` antes de mandar o código; gancho do Auth "Before User Created" (`public.antes_de_criar_usuario`, ativado no painel do Supabase); políticas RLS `restrictive` com `tem_acesso()` em todas as tabelas do usuário. As rotas de API também exigem `tem_acesso`.
- Migrações em `supabase/migrations/`, aplicadas colando no SQL Editor do Supabase. Status por tipo de mídia validado pelo gatilho `valida_status_registro`.
- No Windows (PowerShell 5.1), não editar arquivos com `Get-Content`/`Set-Content`: estraga os acentos.

## Riscos
- Escopo grande: etapas curtas, commit a cada etapa, extras só depois do lançamento
- Termos IGDB/TMDB: lançar sem cobrança nem anúncios
- Limite da IGDB: cache em `midias` e busca com debounce
- Chaves expostas: chamadas apenas no servidor; `.env.local` fora do Git
- PWA no iPhone: tela guiada de instalação; notificações depois
