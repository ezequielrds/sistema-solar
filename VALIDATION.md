# Validação da entrega

Última atualização: 6 de setembro de 2026.

## Verificações automatizadas

- `npm run lint`: aprovado, sem erros ou avisos no código do projeto.
- `npm test`: 97 testes aprovados em cinco suítes (48 de órbitas/rotação, 17 de missões/conteúdo, 24 de escalas/hierarquia das luas, 5 de navegação e 3 da geometria dos anéis).
- `npm run build`: TypeScript, Vite e geração do service worker aprovados.
- `scripts/verify-build.mjs`: 52 URLs únicas no precache; todos os arquivos existem; o GLB sem hash tem revisão de conteúdo; fallback de navegação e controle de clientes estão presentes; manifesto, Meshopt, quantização e cabeçalho KTX2 válidos.
- `npm audit`: sem vulnerabilidades conhecidas na instalação validada. A versão corrigida de Sharp é utilizada.

## Verificações no Chrome

- Visual inspecionado em 1440×900 (desktop), 768×1024 (tablet) e 390×844 (celular).
- Visita à Terra concedeu um carimbo e o bônus da primeira missão.
- Resposta errada ofereceu incentivo e pista; resposta correta marcou o nome aprendido.
- Visitas a Saturno e Titã, lista de luas, retorno e mudança entre escalas verificados.
- Cinco velocidades selecionadas e conquista “Piloto do tempo” concedida; botão de pausa verificado.
- Passaporte exibiu o carimbo da Terra com “Nome aprendido”.
- Preferências e descobertas sobreviveram às recargas usadas na sessão de testes.
- WebGPU ativado e cena renderizada; amostra próxima de 60 FPS no computador de teste. WebGL continua sendo o padrão. Esse valor não é uma garantia para outros aparelhos.
- Troca de renderizador deixou de disparar o aviso incorreto de contexto perdido; recursos do renderizador anterior são liberados.
- Carregamento progressivo das texturas recompila os materiais quando o mapa fica pronto.
- Nenhum erro de execução da cena foi registrado na rodada final consultada. Há um aviso de depreciação do Clock, usado internamente pela versão atual do React Three Fiber.

## Atualização: luas no mapa completo

- As 14 luas selecionadas foram verificadas como marcadores na visão “Sistema Solar + luas”.
- Aproximar Júpiter no mapa revelou Io, Europa, Ganimedes e Calisto, mantendo os demais planetas na cena.
- Clicar no marcador de Io abriu “Visita à lua”; retornar a Júpiter abriu “Planeta e luas”; voltar ao mapa restaurou as 14 luas.
- Desligar e religar “Nomes” removeu e restaurou os 14 marcadores.
- Inspeção visual da compilação em 1280×720 e da versão de desenvolvimento em quadros de 390×844 e 768×1024, no Chrome. O aviso das luas e os controles permaneceram legíveis. Esses quadros verificam o layout responsivo, não o desempenho ou gestos de um dispositivo físico.
- Consulta aos erros do navegador após a navegação de Júpiter: nenhum erro registrado.
- Os novos testes cobrem todas as luas, folga dos anéis, separação das órbitas, posições mundiais acompanhando o planeta e preservação dos períodos lunares.

## Atualização: mãozinha e anéis de Saturno

- Mãozinha ativa indicada visualmente, com cursor de agarrar e instrução de arrastar. O arrasto lateral no mapa moveu a posição projetada do Sol sem selecionar outro astro.
- Zoom pelo botão + após deslocamento preservou o centro escolhido, sem voltar ao Sol. Modo Girar e navegação pelo menu continuaram funcionando.
- Anéis inspecionados antes/depois em Saturno: bandas e bordas agora legíveis, transparência preservada, iluminação uniforme educativa e contorno com mais segmentos.
- Novos testes verificam bindings de mouse/toque, zoom no centro deslocado e seus limites, UVs radiais, fechamento do anel e orçamento da geometria econômica.
- Lint e build aprovados; nenhum erro de execução na consulta ao navegador após os testes de navegação e Saturno.
- As correções visuais e de pan desta rodada foram validadas em WebGL. Na verificação adicional, WebGPU apresentou cena vazia neste ambiente mesmo sem erro no console; essa modalidade experimental não está validada nesta atualização. Use WebGL, que permanece o padrão. Não foi determinada a causa desse comportamento.

## Teste offline real

1. Servida a compilação de produção em `127.0.0.1:4180/sistema-solar/`.
2. Confirmado “Conteúdo pronto para jogar offline” após o service worker assumir o controle.
3. Encerrado o servidor de preview. Confirmado que a porta deixou de escutar.
4. Aberto o endereço em uma nova aba, sem servidor disponível.
5. Carregada a cena, visitada a Terra, respondido o desafio e usadas as cinco velocidades.
6. Verificado o passaporte com o nome da Terra aprendido e a missão de velocidades concluída.

O teste usa navegação normal. Uma recarga forçada que ignora o service worker pode exigir rede, como ocorre com qualquer PWA. A instalação deve ser feita após o primeiro carregamento online completo.

## Limites da validação

Os tamanhos de tablet/celular foram simulados no navegador. Não houve teste em tablet físico nem garantia de voz disponível offline; vozes e instalação variam com o sistema operacional. A simulação astronômica é educativa, com as aproximações descritas no README e nos créditos do jogo.
