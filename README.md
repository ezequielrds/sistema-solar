# Órbita · Sistema Solar 3D

Um jogo educativo em português para pequenos exploradores. Visite o Sol, os oito planetas e 14 luas; brinque com o tempo; aprenda os nomes dos astros e colecione carimbos no passaporte espacial.

**Jogar:** https://ezequielrds.github.io/sistema-solar/

**Código:** https://github.com/ezequielrds/sistema-solar

## Desenvolvimento

Requer Node.js 22 e npm. Os ativos otimizados já estão versionados: não é necessário baixar texturas nem instalar um conversor para executar o jogo ou publicar.

```sh
npm ci
npm run dev
npm test
npm run lint
npm run build
npm run preview
```

O endereço local é `http://127.0.0.1:5173/sistema-solar/`. A base `/sistema-solar/` é configurada em `vite.config.ts`. Ao mudar o nome do repositório, atualize essa base.

## Como jogar

- Arraste com um dedo ou o mouse para orbitar a câmera. Use pinça ou roda para aproximar. Dois dedos ou botão direito movem o centro.
- O botão **mãozinha** permite mover o mapa com o botão esquerdo ou um dedo, sem selecionar astros por acidente. O botão **Girar** restaura a rotação. A roda aproxima na direção do cursor; os botões +/− aproximam do centro escolhido após o pan. **Centralizar** volta ao astro selecionado. Navegar manualmente interrompe o acompanhamento automático do astro.
- Toque nos planetas ou use os atalhos do menu. “Visitar de perto” abre a escala local. Em “Luas”, escolha uma companheira para visitar.
- As 14 luas também orbitam seus planetas no mapa completo. Marcadores indicam suas posições de longe; aproxime a câmera para revelar os nomes ou toque em um marcador para visitar a lua. “Nomes” controla os marcadores e “Órbitas” controla os trajetos.
- Abra “Missões” para ver oito objetivos. Os desafios têm pistas, tentativas ilimitadas e leitura em voz alta quando suportada pelo aparelho.
- Visitas valem 10 estrelas; cada nome aprendido vale 15; missões têm bônus. Cada recompensa é concedida uma única vez.
- “Meu passaporte” guarda planetas e luas visitados, nomes aprendidos e medalhas.
- Espaço pausa; 1–5 selecionam velocidade; Home volta ao sistema; +/− controlam o zoom. Atalhos não interceptam os controles de formulário.

## Astronomia e escalas

Não existe uma escala física global. O modelo mantém **tamanhos e distâncias educativas independentes**, explicitamente identificadas na interface:

| Visão | Tamanhos | Distâncias |
| --- | --- | --- |
| Sistema | Planetas e 14 luas com raios educativos independentes | Órbitas planetárias comprimidas e pequenas órbitas lunares centradas nos planetas, com folga para os anéis de Saturno |
| Planeta e luas | Planeta ampliado e luas com raios próprios | Órbitas lunares separadas para facilitar a exploração |
| Visita à lua | Lua ampliada no centro da cena | A câmera permite observar sua superfície |

O relógio avança em dias terrestres. A equação de Kepler é resolvida por Newton-Raphson. Os períodos reais, a excentricidade, inclinação, nodo e argumento do periastro determinam as órbitas planetárias. A rotação usa períodos siderais e respeita Vênus retrógrado, o eixo muito inclinado de Urano e a órbita retrógrada de Tritão.

| Nível | Nome | Tempo simulado por segundo real | Uso sugerido |
| --- | --- | --- | --- |
| 1 | Observar | 0,01 dia (14,4 minutos) | Observar devagar |
| 2 | Girar | 0,25 dia (6 horas) | Rotação e alternância da superfície iluminada |
| 3 | Viajar | 2 dias | Órbitas das luas |
| 4 | Acelerar | 30 dias | Translação dos planetas próximos |
| 5 | Disparar | 365,256 dias | Comparar anos dos planetas distantes |

### Limites científicos

Trata-se de uma aproximação educativa de dois corpos, **não uma efeméride do céu atual nem uma integração gravitacional de N corpos**. Os elementos planetários J2000 ficam constantes, sem deriva secular ou perturbações. O início da simulação usa fases J2000 e não uma data atual. O contador mostra o tempo transcorrido desde esse início.

Os períodos e excentricidades lunares são aproximados; suas fases iniciais e vários planos orbitais são ilustrativos. As luas não representam a contagem completa de satélites. Em visão local, a direção da luz fica fixa para evidenciar a superfície; fases lunares e eclipses não são calculados. Rotação rápida pode sofrer aliasing temporal: diminua o nível para perceber seu sentido. Fobos e Deimos, irregulares na realidade, usam esferas educativas. Luas além da nossa Lua têm cores ilustrativas, informadas no cartão.

Fontes: [NASA/JPL, elementos orbitais](https://ssd.jpl.nasa.gov/planets/approx_pos.html), [NASA Science](https://science.nasa.gov/solar-system/), [JPL, elementos dos satélites](https://ssd.jpl.nasa.gov/sats/elem/).

Os anéis usam a textura licenciada com bandas e transparência radial, geometria de 128/256 segmentos e iluminação uniforme educativa para permanecerem legíveis dos dois lados. Não reproduzem a sombra física de Saturno sobre os anéis.

## Arquitetura

React 19 + TypeScript + Vite. A interface usa React, Tailwind 4 e CSS responsivo. A cena permanece em componentes React Three Fiber e Drei. Zustand guarda preferências e progresso; o relógio de animação não dispara renders React nem grava no armazenamento a cada quadro.

```text
src/
  scene/               Canvas isolado, iluminação, estrelas, posições
  camera/              Controles orbitais, foco suave e acompanhamento
  celestial-bodies/    Esferas reutilizáveis, anéis, texturas progressivas
  orbits/              Kepler, rotação, caminhos orbitais e testes
  asteroid-belt/       InstancedMesh + GLB comprimido com Meshopt
  missions/            Regras puras, testes, desafios, passaporte
  ui/                  Navegação, cartões, tempo, diálogos e PWA
  audio/               Sons sintetizados e leitura via Web Speech
  content/             Catálogo de astros e banco de perguntas local
  performance/         Detecção e ajuste de qualidade
  state.ts             Zustand persistido + relógio de simulação
```

### Gráficos e desempenho

WebGL 2 é o padrão. WebGPU pode ser ativado nas configurações; é carregado separadamente e volta a WebGL se a inicialização não for possível. O backend efetivo aparece no rodapé e nas configurações. WebGPU é experimental e não é requisito para jogar.

| Qualidade | DPR máximo | Segmentos da esfera | Asteroides | Estrelas |
| --- | --- | --- | --- | --- |
| Econômica | 1 | 24 | 350 | 650 |
| Equilibrada | 1,35 | 40 | 850 | 1.400 |
| Caprichada | 1,75 | 64 | 1.600 | 2.400 |

A seleção automática considera memória, núcleos e ponteiro de toque. Após aquecimento, duas amostras lentas consecutivas reduzem a qualidade. O cinturão usa GPU instancing: uma geometria e uma chamada de desenho para todas as rochas, com atualização das matrizes. Não há pós-processamento pesado ou sombras dinâmicas. Ao ocultar a aba, abrir uma coleção ou um diálogo, a cena para de renderizar e o tempo para; não há avanço artificial ao retornar. O delta do relógio é limitado a 100 ms em quadros muito lentos para evitar saltos grandes.

Esferas coloridas aparecem antes das texturas. Modo econômico usa WebP de 512 px; outros níveis tentam KTX2/Basis de 1024 px com mipmaps e caem para WebP local se necessário. Todas as dependências de transcodificação são locais. O GLB original de asteroide usa Meshopt; Draco não é necessário para esta geometria pequena. Não existe importação de modelos arbitrários enviados por visitantes.

## PWA, privacidade e offline

Manifesto instalável com ícones normais e maskable, `start_url` e `scope` compatíveis com GitHub Pages. O service worker armazena a aplicação, modelos, decodificador e texturas. O primeiro carregamento online completo é necessário; a configuração mostra quando o conteúdo está pronto. Atualizações pedem um toque no aviso de nova versão para não interromper uma missão.

Android/Chrome: menu → Instalar aplicativo. iPad/iPhone: Compartilhar → Adicionar à Tela de Início. A disponibilidade de instalação e de vozes offline depende do sistema. A aplicação não depende de voz para jogar.

Não há contas, banco de dados, analytics, anúncios nem API de progresso. Zustand persiste apenas preferências e conquistas em `localStorage`, chave `orbita-explorador-v1`. O carregamento valida IDs e remove duplicações. Bloqueio de armazenamento mantém a sessão jogável e exibe aviso; limpar dados do site remove o progresso. O armazenamento é específico do navegador/origem e não sincroniza aparelhos.

## Ativos e licenças

[Solar System Scope / INOVE](https://edu.solarsystemscope.com/textures/) fornece os mapas do Sol, planetas, Lua e anéis sob [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), baseados em dados e imagens NASA, com ajustes de cor e regiões reconstruídas. A adaptação neste projeto consiste em redimensionamento e compressão WebP/KTX2. Não são fotos diretas e inalteradas da NASA. A atribuição está disponível no aplicativo e em `public/ASSET-LICENSES.md`.

O asteroide é uma geometria original gerada por `scripts/prepare-assets.mjs`, exportada em glTF/GLB com Meshopt. Ícones Lucide: ISC. Código e arte original do projeto: MIT. As licenças de terceiros continuam aplicáveis.

Para reconstruir ativos (requer internet e executável Basis da dependência de desenvolvimento):

```sh
npm run assets
```

O script baixa somente os mapas identificados, guarda originais em `.asset-cache` (ignorado pelo Git), produz variantes WebP/KTX2, gera o GLB e os ícones PWA, e copia o decodificador Basis da distribuição Three.js. Os arquivos finais em `public` estão versionados para builds reprodutíveis sem novos downloads.

## Testes e publicação

Vitest cobre convergência de Kepler, periélio/afélio, velocidade variável em elipses, transformações 3D, períodos de todos os astros, fechamento de órbitas, rotação, dados inválidos, integridade das perguntas, conclusão de missões, recompensas únicas e recuperação de progresso inválido.

O workflow `.github/workflows/deploy.yml` instala com `npm ci`, executa lint, testes e build e publica `dist` em GitHub Pages usando OIDC. Configure **Settings → Pages → Source → GitHub Actions**. Cada push em `main` executa todas as verificações antes da publicação.

Testes de tamanhos de tela no navegador não substituem medições em tablets físicos. Qualidade automática e controle manual ficam disponíveis para adaptar o jogo ao hardware real.
