# MyGravityDroid

Assistente de programação Android, editável pelo GitHub no telemóvel e compilado pelo GitHub Actions.

## v0.6.0 — Auto Router mais rápido

- Três perfis locais: Rápido/Geral, Programador e Auto Router/Planeador.
- **Rápido** chama diretamente o modelo geral.
- **Auto** pede ao Router classificação e plano numa única chamada; depois chama apenas o modelo final.
- **Programar** pede um plano e depois chama o modelo programador.
- Seleciona uma pasta e até 40 ficheiros (máximo combinado de 256 KB).
- A app não altera ficheiros nem executa comandos. Os modelos não estão incluídos no APK.

### Router local com llama.cpp

Usa uma versão atual do llama.cpp com modo router. Inicia llama-server sem -m nem -hf, configura a pasta de modelos e limita os carregados em simultâneo. Exemplo para começar no telemóvel:

    llama-server --models-dir ~/models --models-max 2 --host 127.0.0.1 --port 8080

Em Definições → Modelos locais, usa http://127.0.0.1:8080/v1 nos perfis e define em cada um o nome exato que o router apresenta em /models. O modo router carrega modelos a pedido. A primeira utilização de um modelo pode demorar enquanto carrega; manter mais modelos na RAM pode tornar as trocas seguintes mais rápidas, mas usa mais memória. No Redmi com 8 GB, começa com --models-max 2 e aumenta só se continuar estável.

O llama-server e os modelos têm de estar a correr no próprio telemóvel para 127.0.0.1 funcionar. Para um servidor no PC, usa o IP local do PC em vez de 127.0.0.1.

## Projeto e privacidade

Só os ficheiros que selecionares são lidos e enviados ao modelo. A chave da API fica em memória durante a sessão. Para modelos locais não é necessária uma chave. Revê as sugestões antes de as aplicar.

## Editar e compilar pelo Android

1. Abre este repositório no GitHub e edita os ficheiros ou usa github.dev.
2. Faz commit para main.
3. Em Actions, abre Build Android APK.
4. Descarrega o artefacto MyGravityDroid-debug da compilação bem-sucedida.
