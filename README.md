# MyGravityDroid

Assistente Android de IA local para conversar e programar. A app liga-se ao `llama-server` no Termux F-Droid. O APK debug é compilado pelo GitHub Actions.

## Versão 0.15.0 — Três modelos locais

| Perfil | Modelo GGUF | Utilização |
| --- | --- | --- |
| Rápido / geral | Qwen3 1.7B Q4_K_M | Perguntas e respostas |
| Programar | Qwen2.5 Coder 1.5B Q4_K_M | Programação e propostas de alterações |
| Auto Router / planeador | Qwen3 0.6B Q4_0 | Decide o destino e apoia o programador |

A app inicia o `llama-server` em modo router na porta 8080, com até dois modelos carregados simultaneamente para controlar o uso de RAM no Redmi de 8 GB. O modelo geral é carregado no arranque. Os outros são descarregados para o cache do Termux no primeiro carregamento, a partir do gestor **Modelos** ou de um pedido que os utilize. A primeira utilização pode demorar e requer internet; depois os modelos funcionam localmente. Se o servidor antigo de um único modelo ainda ocupar a porta 8080, termina-o no Termux e reabre a app.

## Configuração inicial

1. Instala o Termux F-Droid e compila o `llama-server` em `~/llama.cpp/build-gpu/bin` com Vulkan.
2. Ativa `allow-external-apps = true` em `~/.termux/termux.properties`.
3. Concede ao MyGravityDroid a permissão Android **Run commands in Termux environment**.
4. Abre a app e usa **Modelos** para ver o estado de cada perfil e preparar os outros modelos.

A permissão permite executar comandos dentro do Termux. A app inicia um comando fixo para o router local. O servidor mantém-se em execução até o Termux ou o Android o terminar.

## Projetos

A app pode ler até 8 MB de contexto e 200 ficheiros por projeto; anexos e propostas de edição têm limite de 2 MB por ficheiro. O contexto do servidor é 1024 tokens por modelo na configuração atual; projetos grandes exigem seleção criteriosa dos ficheiros. As edições são apresentadas para aprovação antes de serem gravadas.

## APK

Cada avanço incrementa versionCode e versionName. Descarrega o APK debug em **Actions → Build Android APK → Artifacts**.
