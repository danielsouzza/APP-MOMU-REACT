# Como Replicar o Projeto do Aplicativo MOMU

Este guia fornece um passo a passo para replicar o projeto do aplicativo MOMU, que foi desenvolvido utilizando React Native, TypeScript e Expo. Siga as instruções abaixo para configurar o ambiente de desenvolvimento e criar uma aplicação semelhante.

## 1. Pré-requisitos

Antes de começar, certifique-se de ter os seguintes pré-requisitos instalados em sua máquina:

### Node.js
- A versão mais recente do Node.js deve estar instalada. Você pode baixá-la em [nodejs.org](https://nodejs.org/).

### Expo CLI
- Instale o Expo CLI globalmente usando o seguinte comando:
  ```sh
  npm install -g expo-cli
  ```

### Git
- Para clonar o repositório, você precisará do Git instalado. Você pode baixá-lo em [git-scm.com](https://git-scm.com/).

---

## 2. Clonando o Repositório

Clone o repositório do projeto MOMU usando o Git. Abra o terminal e execute o seguinte comando:

```sh
git clone https://github.com/danielsouzza/APP-MOMU-REACT.git
```

- Substitua `seu-usuario` pelo seu nome de usuário do GitHub.

---

## 3. Instalando Dependências

Navegue até o diretório do projeto e instale as dependências necessárias:

```sh
cd momu-app
npm install
```

---

## 4. Configurando o Ambiente

### 4.1. Configuração do TypeScript

O projeto já está configurado para usar TypeScript. Certifique-se de que o arquivo `tsconfig.json` está presente na raiz do projeto. Ele deve conter as configurações necessárias para o TypeScript.

### 4.2. Configuração do Expo

O projeto utiliza o Expo para facilitar o desenvolvimento. Para iniciar o projeto, execute o seguinte comando:

```sh
npx expo start
```

Isso abrirá uma nova aba no seu navegador com o painel do Expo, onde você pode visualizar o QR code para abrir o aplicativo em seu dispositivo móvel.

## 5. Apresentação do Projeto
[Apresentação em video](https://drive.google.com/file/d/1UrSoYDTzNLnwWMqXBAnOMu4iP1oqD3B5/view?usp=sharing).