# MyGravityDroid

Assistente Android para conversar e programar com modelos locais compatíveis com a API OpenAI. O projeto é desenvolvido no GitHub e o APK debug é compilado pelo GitHub Actions.

## Versão 0.8.0

- Perfis locais Rápido, Programar e Auto.
- O Auto Router classifica e planeia o pedido antes de o encaminhar.
- Seleciona ficheiros de projeto para usar como contexto.
- Prepara propostas de código e mostra um diff linha a linha com linhas adicionadas e removidas realçadas.
- Cada ficheiro é aprovado individualmente; a app verifica se o conteúdo mudou antes da escrita e confirma a gravação.
- Limites: 64 KiB por ficheiro editado; contexto 256 KiB e até 40 ficheiros.
- Anexos são apenas contexto de leitura.

## Modelos locais

Em Definições configura o endpoint e o nome do modelo para cada perfil. A app liga-se a um servidor compatível com OpenAI executado no telemóvel ou na rede local; não descarrega nem inclui os modelos. Os três perfis podem apontar ao mesmo servidor, usando nomes de modelo distintos se este suportar a troca.

## APK

Cada versão incrementa versionCode e versionName. O workflow Android CI compila o APK debug quando há alterações na branch principal. Descarrega-o em Actions, na execução concluída, em Artifacts.
