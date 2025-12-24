# 📱 Deploy via Celular - Soluções Alternativas

## 🎯 Situação Atual

Você está no celular e precisa fazer deploy sem acesso ao computador. Aqui estão as opções:

## ✅ Opção 1: GitHub Actions (Recomendado - Automático)

Crie um arquivo `.github/workflows/deploy.yml` no repositório:

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main
  workflow_dispatch:  # Permite executar manualmente

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

**Como usar:**
1. Adicione o arquivo via GitHub mobile app ou web
2. Configure o secret `FIREBASE_SERVICE_ACCOUNT` no GitHub
3. Faça um commit - o deploy será automático!

## ✅ Opção 2: Usar Terminal no Celular

Se você tem um app de terminal no celular (como Termux no Android):

```bash
# 1. Clone o repositório
git clone https://github.com/fernandoxavier02/Project-Pathfinder.git
cd Project-Pathfinder

# 2. Instale Node.js (se necessário)
# No Termux: pkg install nodejs

# 3. Instale dependências
cd client && npm install && cd ..

# 4. Faça build
cd client && npm run build && cd ..

# 5. Se você tiver um token Firebase:
export FIREBASE_TOKEN="seu-token"
npx firebase-tools deploy --only hosting --token $FIREBASE_TOKEN
```

## ✅ Opção 3: Gerar Token no Computador Depois

Quando tiver acesso ao computador:

1. **Gere um token** (válido por 1 hora):
   ```bash
   npx firebase-tools login:ci
   ```

2. **Salve o token** e use depois:
   ```bash
   export FIREBASE_TOKEN="token-gerado"
   npx firebase-tools deploy --only hosting --token $FIREBASE_TOKEN
   ```

## ✅ Opção 4: Usar Replit ou CodeSandbox

1. Abra o projeto no Replit/CodeSandbox
2. Execute os comandos de deploy lá
3. Funciona direto no navegador!

## 🚀 Solução Mais Rápida Agora

**Criar GitHub Actions** - Funciona direto do celular:

1. No GitHub mobile app ou navegador:
   - Vá para o repositório
   - Crie a pasta `.github/workflows/`
   - Adicione o arquivo `deploy.yml` (código acima)

2. Configure o secret:
   - Vá em Settings > Secrets and variables > Actions
   - Adicione `FIREBASE_SERVICE_ACCOUNT` com o JSON da service account

3. Faça um commit - deploy automático!

## 📋 Status Atual

- ✅ Build pronto em `client/dist/`
- ✅ Configuração Firebase pronta
- ✅ Código commitado na `main`
- ⏳ Aguardando deploy

## 💡 Recomendação

**Use GitHub Actions** - É a forma mais fácil de fazer deploy do celular e automatiza tudo!
