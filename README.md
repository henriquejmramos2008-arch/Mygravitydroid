# MyGravityDroid

Assistente Android para conversar e programar com modelos locais compatíveis com a API OpenAI. O projeto é desenvolvido no GitHub e o APK debug é compilado pelo GitHub Actions.

## Versão 0.7.0

- Três perfis locais: Rápido, Programar e Auto.
- O Auto Router classifica e planeia o pedido antes de o encaminhar.
- Seleciona ficheiros de projeto para usar como contexto.
- Ativa Preparar diff para aprovação para pedir propostas de código. Cada ficheiro é revisto antes/depois e só é gravado ao tocar em Aprovar e guardar.
- Cada ficheiro é aprovado individualmente. A app confirma que o conteúdo não mudou entretanto e verifica a gravação.
- Limites: 64 KiB por ficheiro editado; contexto 256 KiB e até 40 ficheiros.
- Anexos são apenas contexto de leitura.

## Modelos locais

Em Definições configura o endpoint, o nome do modelo para cada perfil e, se necessário, a chave da API. Para execução local podes usar um servidor compatível com OpenAI no próprio telemóvel ou na rede local. A app não descarrega nem inclui modelos; tens de iniciar o servidor e indicar um endereço acessível pelo Android.

Os três perfis podem apontar para o mesmo servidor. O Auto Router e o modelo final são pedidos sequenciais; manter modelos carregados no servidor ajuda a reduzir a demora de troca.

## Criar o APK

Cada versão incrementa versionCode e versionName. O workflow Android CI compila o APK debug quando há alterações na branch principal. Descarrega-o em Actions, na execução concluída, em Artifacts.

## Segurança

A app só propõe alterações aos ficheiros de projeto selecionados. Não executa comandos nem grava sem aprovação explícita. As permissões dependem do fornecedor de documentos/pasta escolhido no Android. Mantém cópias de segurança do projeto.
