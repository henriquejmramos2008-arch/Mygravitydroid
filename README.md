# MyGravityDroid

Assistente Android para conversar e programar com modelos locais compatíveis com a API OpenAI. O projeto é desenvolvido no GitHub e o APK debug é compilado pelo GitHub Actions.

## Versão 0.9.1
- Layout renovado, seletor rápido Auto/Rápido/Programar e novo ícone adaptativo.
- Contexto de projeto até 8 MB e 200 ficheiros.
- Anexos individuais e propostas de edição até 2 MB por ficheiro.
- As propostas continuam a exigir revisão linha a linha e aprovação individual.

## Modelos locais
Configura o endpoint e o nome de cada modelo em Definições. A app liga-se a um servidor compatível com OpenAI executado no telemóvel ou na rede local; não descarrega os modelos.

O limite de 8 MB é o máximo de dados de projeto que a app pode ler. O limite efetivo num pedido depende da janela de contexto, memória e limites do modelo/servidor. Selecionar muitos ficheiros pode fazer o servidor local rejeitar ou truncar o pedido; escolhe apenas os ficheiros relevantes para a tarefa.

## APK
Cada versão incrementa versionCode e versionName. O workflow Android CI compila o APK debug quando há alterações na branch principal. Descarrega-o em Actions, na execução concluída, em Artifacts.
