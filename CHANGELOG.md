# Changelog

## 0.15.0
- Inicia o llama-server em modo router com três modelos GGUF distintos e até dois carregados em simultâneo.
- O gestor Modelos consulta o router do Termux e permite preparar os modelos no respetivo cache.
- Deixa de copiar o ID do único modelo para os três perfis e migra as configurações da versão anterior.
- Corrige a instrução do assistente sobre leitura de ficheiros e documenta o primeiro carregamento.

## 0.12.0
- Inicia o llama-server do Termux ao abrir a app e aguarda o endpoint de saúde.
- Evita iniciar outro servidor quando a porta 8080 já responde.
- Deteta o ID via `/v1/models` e sincroniza os três perfis.
- Acrescenta configuração guiada para a permissão Termux RUN_COMMAND.

## 0.11.0
- Adiciona gestor de modelos GGUF para os perfis geral, programador e Auto Router.
- Mostra progresso e permite cancelar, tentar novamente ou remover downloads.
- Guarda os modelos na pasta privada da app e permite restringir downloads a Wi-Fi.

## 0.10.0
- Pesquisa de ficheiros por nome/extensão na seleção do projeto.
- Selecionar resultados visíveis e limpar seleção rapidamente.
- Mostra o tamanho real do contexto de ficheiros do último pedido.

## 0.9.1
- Layout renovado, ícone adaptativo e limites ampliados para projetos grandes.
- Corrige a compilação e estrutura do painel de composição.

## 0.8.0
- Diff linha a linha com destaque para adições e remoções.
- Resumo para ficheiros grandes.

## 0.7.0
- Propostas de alteração para ficheiros selecionados, revistas e aprovadas individualmente.
