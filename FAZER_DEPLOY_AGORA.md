# 🚀 Como Fazer o Deploy Agora - Passo a Passo

## ⚠️ Ambiente Não-Interativo Detectado

Como estamos em um ambiente que não permite autenticação interativa, você precisa executar o deploy **no seu computador local** ou configurar um token.

## 📋 Opções Disponíveis

### ✅ Opção A: Deploy no Seu Computador Local (Recomendado)

1. **Clone ou atualize o repositório**:
   ```bash
   git pull origin main
   ```

2. **Instale as dependências** (se ainda não fez):
   ```bash
   cd client
   npm install
   ```

3. **Faça o build** (se ainda não fez):
   ```bash
   npm run build
   ```

4. **Autentique no Firebase**:
   ```bash
   cd ..
   npx firebase-tools login
   ```
   Isso abrirá seu navegador para autenticação.

5. **Faça o deploy**:
   ```bash
   npx firebase-tools deploy --only hosting
   ```

### ✅ Opção B: Usar Token CI (Para Automação)

1. **No seu computador local, gere um token**:
   ```bash
   npx firebase-tools login:ci
   ```
   Isso retornará um token como: `1//0abc123...`

2. **Configure o token como variável de ambiente**:
   ```bash
   export FIREBASE_TOKEN="token-gerado-acima"
   ```

3. **Execute o deploy**:
   ```bash
   cd /workspace
   node deploy-firebase-rest-api.js
   ```

### ✅ Opção C: Deploy via GitHub Actions (Automatizado)

Crie um arquivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd client && npm install
      
      - name: Build
        run: cd client && npm run build
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: ifrs15-revenue-manager
```

## 📊 Status Atual

- ✅ Build concluído e commitado
- ✅ Configuração Firebase pronta
- ✅ Scripts de deploy criados
- ⏳ Aguardando autenticação para deploy

## 🎯 Comando Mais Simples

Se você tem acesso ao projeto Firebase, execute no seu terminal local:

```bash
# 1. Clone o repositório
git clone https://github.com/fernandoxavier02/Project-Pathfinder.git
cd Project-Pathfinder

# 2. Instale dependências e faça build
cd client && npm install && npm run build && cd ..

# 3. Login e deploy
npx firebase-tools login
npx firebase-tools deploy --only hosting
```

## 🌐 Após o Deploy

A aplicação estará disponível em:
- **https://ifrs15-revenue-manager.web.app**
- **https://ifrs15-revenue-manager.firebaseapp.com**

## 📝 Verificação

Após o deploy, você verá:
- ✅ Relógio em tempo real no topo
- ✅ Data formatada em português brasileiro
- ✅ Timezone detectado automaticamente

## ⚠️ Importante

O deploy **deve ser feito de um ambiente que permita autenticação interativa** ou com um token válido configurado.
