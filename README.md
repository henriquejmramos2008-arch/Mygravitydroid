# MyGravityDroid

Assistente Android para conversar e programar com modelos locais. O APK debug é compilado pelo GitHub Actions.

## Versão 0.12.0 — Arranque automático com Termux
- Ao abrir a app, verifica o servidor em `127.0.0.1:8080`; se não estiver ativo, pede ao Termux para arrancar o Qwen3 1.7B local.
- Não inicia uma segunda cópia se já existir um servidor a responder.
- Lê o identificador do modelo servido e configura os três perfis para o modelo atualmente ativo.
- Mantém o gestor de modelos GGUF e as funcionalidades de projetos até 8 MB / 200 ficheiros.

## Configuração inicial do Termux
Na primeira abertura, segue as instruções mostradas na app:
1. Ativa `allow-external-apps = true` no Termux usando o comando que a app copia.
2. Nas permissões do Android, concede ao MyGravityDroid **Executar comandos no Termux**.
3. Toca em **Ativar e iniciar**.

Esta permissão é poderosa: permite executar comandos no ambiente do Termux. A integração do MyGravityDroid chama apenas um comando fixo para iniciar o `llama-server`. O Termux precisa de estar instalado e a build tem de existir em `~/llama.cpp/build-gpu`. No Redmi, a app inicia Qwen3 1.7B Q4_K_M no porto 8080. O servidor mantém-se em execução até o Termux ou o Android o terminar.

## Perfis
Até instalares/configurares outros servidores, os perfis Rápido, Programar e Auto usam o modelo que estiver ativo no servidor Termux. O nome é obtido de `/v1/models`.

## Modelos GGUF
O gestor **Modelos** descarrega modelos para o armazenamento privado da app. Esses ficheiros são separados do cache do Termux; a integração atual arranca o modelo já disponível em `~/llama.cpp`.

## Projetos
A app pode ler até 8 MB de ficheiros e 200 ficheiros por projeto; anexos e propostas têm limite de 2 MB por ficheiro. O tamanho efetivo de contexto depende do modelo.

## APK
Cada avanço incrementa versionCode/versionName. Descarrega o APK debug em Artifacts da execução do workflow Android Actions.
