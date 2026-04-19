# UVision - Funcionalidade de Histórico

Este README cobre somente como **testar a funcionalidade de Histórico** implementada no app.

## O que foi implementado

- Tela de Histórico com layout responsivo (mobile, tablet e web).
- Filtros de período: `Hoje`, `7 dias` e `30 dias`.
- Gráfico de linha interativo para `Hoje`.
- Gráfico de barras interativo para `7 dias` e `30 dias`.
- Estatísticas do período (média, pico e quantidade de momentos críticos).
- Destaque de picos críticos (`UV >= 8`) com dica de manejo.
- Estrutura pronta para receber dados reais de BLE/API no futuro.

## Requisitos

- Node.js LTS
- npm
- Expo CLI (opcional, pode usar `npx expo`)

## Como rodar

1. Instale as dependências:

```bash
npm install
```

2. Inicie o app:

```bash
npx expo start
```

3. Abra no ambiente desejado:

- Web: pressione `w` no terminal do Expo.
- Android: pressione `a` (emulador/dispositivo com setup pronto).
- iOS: pressione `i` (somente macOS).

## Como validar o Histórico

1. Abra a tela principal do app.
2. Alterne entre os filtros `Hoje`, `7 dias` e `30 dias`.
3. No gráfico:
- `Hoje`: toque nos pontos da linha para alterar o destaque.
- `7 dias` e `30 dias`: toque nas barras para alterar o destaque.
4. Confira se os cards de estatística atualizam ao trocar o período.
5. Confira se o bloco de dica destaca os momentos críticos.
6. Redimensione a tela (web) para validar responsividade.

## Próximos passos (futuro)

- Conectar os dados mockados com a leitura real do sensor BLE.
- Persistir histórico em backend/local storage.
- Integrar alertas automáticos com base em limites críticos configuráveis.
