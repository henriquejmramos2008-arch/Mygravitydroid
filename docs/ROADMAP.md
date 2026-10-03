# Roadmap

## 0.1 — Base de chat
- [x] Chat Android nativo.
- [x] Endpoint compatível com OpenAI e definições do modelo.
- [x] Build de APK com GitHub Actions.

## 0.2 — Anexos
- [x] Anexar um ficheiro de texto até 16 KB.
- [x] Não alterar o original.

## 0.3–0.4 — Contexto de projeto
- [x] Escolher uma pasta e selecionar ficheiros suportados.
- [x] Limite de 40 ficheiros e 256 KB combinados.

## 0.5 — Três perfis locais
- [x] Perfis geral, programador e Auto Router/planeador.
- [x] Modos Auto, Rápido e Programar.

## 0.6 — Encaminhamento com menos chamadas
- [x] Combinar classificação e plano numa chamada do Router.
- [x] Em Auto, chamar só o modelo final depois do Router.
- [x] Documentar o modo router do llama.cpp e controlo de modelos residentes.
- [x] Bump para 0.6.0 e validar o APK.

## Próximo — Alterações de código com revisão
- Mostrar diff antes/depois criado pelo modelo.
- Permitir aplicar apenas após aprovação explícita.
- Nunca substituir ficheiros silenciosamente.

## Depois — Ferramentas de agente controladas
- Pedir aprovação para cada comando.
- Mostrar diretório, comando, saída e botão de cancelar.
- Manter ferramentas confinadas à pasta escolhida.
