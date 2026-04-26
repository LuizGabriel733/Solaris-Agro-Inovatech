# Solaris Agro

🚀 Tutorial: Configuração do App Solaris Agro (BLE)
Este guia orienta desde a preparação das máquinas até a execução do app em dispositivos físicos usando Expo Development Builds.
1. Preparação do Ambiente (Todos os Integrantes)
Antes de começar, todos devem garantir que as ferramentas base estejam instaladas.
Node.js (LTS): Motor para rodar o Javascript.
VS Code: Editor de código oficial.
Git: Para controle de versão.
Instalação da CLI do Expo: Abra o terminal do VS Code e execute:
bash
npm install -g eas-cli
Use o código com cuidado.

Obs: Se estiver em rede privada, o Firewall pode bloquear o Node.js. Permita o acesso em redes privadas nas configurações de segurança.
2. Configuração do Projeto (Apenas um Integrante)
Instalação de Dependências: Dentro da pasta do projeto, execute:
bash
npx expo install react-native-ble-plx expo-dev-client
Use o código com cuidado.

Configuração do Bluetooth (app.json): Adicione os plugins na chave "expo":
json
"plugins": [
  ["react-native-ble-plx", { "isBackgroundEnabled": false, "modes": ["peripheral", "central"] }],
  "expo-dev-client"
]
Use o código com cuidado.

Implementação: Substitua o App.js pela lógica de busca (Scan) desenvolvida.
3. Gerando o App de Teste (Development Build)
Como o Bluetooth exige permissões nativas, ele não funciona no Expo Go comum.
Criar conta: Cadastre-se em expo.dev.
Login no Terminal: npx eas login
Gerar o APK:
bash
npx eas build --profile development --platform android
Use o código com cuidado.

Distribuição: Ao final, o terminal exibirá um Link de Download. Envie para a equipe instalar o APK nos celulares Android físicos.
4. Execução: QR Code vs. Cabo USB
Após rodar o comando npx expo start --dev-client, um QR Code aparecerá no terminal. Escolha o método de conexão:
A. Em Rede Particular (Wi-Fi de Casa)
Se o PC e o celular estiverem no mesmo Wi-Fi:
Escaneie o QR Code do terminal com a câmera do celular.
O app Solaris Agro (APK instalado) abrirá e sincronizará com o seu PC instantaneamente.
B. Em Rede Pública ou Restrita (Faculdade/Café) - Via Cabo USB
Redes públicas bloqueiam a conexão direta. Use o Cabo USB para "pular" a rede:
Ativar Celular: Vá em Configurações > Sobre o telefone e clique 7 vezes no "Número da Versão". Nas Opções do Desenvolvedor, ative a Depuração USB.
Conectar ao PC: Conecte o cabo e aceite a permissão de confiança no celular.
Criar a Ponte (ADB): No PowerShell do PC, execute o comando para redirecionar a porta:
powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" reverse tcp:8081 tcp:8081
Use o código com cuidado.

Abrir o App: Abra manualmente o app Solaris Agro no celular. Ele buscará o código do PC através do cabo. Se não carregar, selecione "Enter URL manually" no app e digite http://localhost:8081.
Dica Final: Se o comando adb não for reconhecido, adicione a pasta platform-tools do Android SDK às Variáveis de Ambiente (PATH) do Windows para usar apenas adb reverse no futuro.

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

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
