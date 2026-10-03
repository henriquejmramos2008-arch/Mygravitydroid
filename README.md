# MyGravityDroid

Assistente Android para conversar e programar. O projeto é desenvolvido no GitHub e o APK debug é compilado pelo GitHub Actions.

## Versão 0.11.0
- Gestor de modelos GGUF com três perfis: rápido/geral, programação e Auto Router.
- Downloads com progresso, cancelamento, nova tentativa e remoção.
- Os modelos ficam no armazenamento privado da app; por defeito, os downloads usam apenas Wi-Fi.
- Contexto de projeto até 8 MB e 200 ficheiros; anexos e propostas até 2 MB por ficheiro.

## Instalar modelos
Abre **Modelos** no cabeçalho e descarrega cada perfil. Os ficheiros são grandes; liga-te a Wi-Fi e deixa espaço livre. Os downloads são guardados separadamente dos modelos que já estejam noutra app, como Termux.

Nesta versão, o gestor instala os ficheiros GGUF. A geração de respostas continua a usar um servidor compatível com OpenAI configurado em **Definições**. A ligação do motor de inferência incorporado e o arranque automático dos modelos são o passo seguinte.

O limite de 8 MB é a quantidade máxima de ficheiros que a app pode ler por pedido; a janela efetiva depende do modelo e do servidor.

## APK
Cada avanço incrementa versionCode e versionName. O workflow Android compila o APK debug na branch principal. Descarrega-o em Actions, na execução concluída, em Artifacts.
