# MyGravityDroid

Assistente Android para conversar e programar com modelos locais compatíveis com a API OpenAI. O projeto é desenvolvido no GitHub e o APK debug é compilado pelo GitHub Actions.

## Versão 0.10.0
- Pesquisa ficheiros do projeto por nome ou extensão.
- Seleciona todos os resultados visíveis ou limpa a seleção.
- Mostra quantos bytes de ficheiros entraram no último contexto enviado.
- Contexto de projeto até 8 MB, até 200 ficheiros; anexos e propostas até 2 MB por ficheiro.
- As propostas continuam a ser mostradas em diff e exigem aprovação individual antes de gravar.

## Modelos locais
Configura o endpoint e o nome de cada modelo em Definições. A app liga-se a um servidor compatível com OpenAI executado no telemóvel ou na rede local; não descarrega os modelos.

O limite de 8 MB é o máximo de dados de ficheiro que a app pode ler por pedido. A janela de contexto efetiva depende do modelo e do servidor local. Seleciona os ficheiros relevantes para evitar exceder a capacidade do modelo.

## APK
Cada versão incrementa versionCode e versionName. O workflow Android CI compila o APK debug quando há alterações na branch principal. Descarrega-o em Actions, na execução concluída, em Artifacts.
