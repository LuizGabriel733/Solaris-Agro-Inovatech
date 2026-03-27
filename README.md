🚀 Tutorial: Configuração do App UVision (Bluetooth Low Energy)
Este guia orienta desde a preparação das máquinas até a execução do app em dispositivos físicos usando Expo Development Builds.
1. Preparação do Ambiente (Todos os Integrantes)
Antes de começar, todos devem garantir que as ferramentas base estejam instaladas.
Instalações Necessárias:
Node.js (LTS): Motor para rodar o Javascript.
VS Code: Editor de código oficial.
Git: Para controle de versão e compartilhamento.
Instalação da CLI do Expo:
Abra o terminal do VS Code e execute:
bash
npm install -g eas-cli
Use o código com cuidado.

2. Configuração do Projeto (Apenas um Integrante)
Apenas um membro cria a estrutura base e sobe para o GitHub.
A. Instalação de Dependências
Dentro da pasta do projeto (uvision-app), execute:
bash
npx expo install react-native-ble-plx expo-dev-client
Use o código com cuidado.

B. Configuração do Bluetooth (app.json)
Abra o arquivo app.json e adicione os plugins necessários dentro da chave "expo":
json
"plugins": [
  [
    "react-native-ble-plx",
    {
      "isBackgroundEnabled": false,
      "modes": ["peripheral", "central"],
      "bluetoothAlwaysPermission": "O app precisa de Bluetooth para ler o sensor UV."
    }
  ],
  "expo-dev-client"
]
Use o código com cuidado.

C. Implementação do Código
Substitua o conteúdo do seu App.js pelo código de lógica de busca (Scan) de dispositivos Bluetooth que foi desenvolvido.
3. Gerando o App de Teste (Development Build)
Como o Bluetooth exige permissões nativas, não funciona no Expo Go comum. Precisamos criar um instalador próprio.
Criar conta: Cadastre-se em expo.dev.
Login no Terminal:
bash
npx eas login
Use o código com cuidado.

Gerar o APK de Desenvolvimento:
bash
npx eas build --profile development --platform android
Use o código com cuidado.

Nota: Aceite as sugestões de "Android Package Name" (ex: com.uvision.app).
Distribuição: Ao final (aprox. 10 min), o terminal exibirá um Link de Download.
Envie este link para todos os membros da equipe.
Todos devem baixar e instalar o APK em seus celulares Android físicos.
4. Fluxo de Trabalho em Equipe (Dia a Dia)
Com o "App de Teste" já instalado nos celulares, o desenvolvimento segue este fluxo:
Sincronização:
O responsável sobe o código para o GitHub.
O colega baixa o código, abre no VS Code e roda npm install para instalar as bibliotecas.
Execução:
Para testar as alterações, o desenvolvedor digita:
bash
npx expo start --dev-client
Use o código com cuidado.

Conexão Magicamente:
Abra o App de Teste (aquele instalado via APK) no celular.
Escaneie o QR Code que apareceu no terminal.
Resultado: Qualquer alteração feita no código do PC atualizará instantaneamente no celular, com acesso total ao Bluetooth!

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

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
