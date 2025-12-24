# 🚀 Deploy no Firebase via API REST

## 📋 Status Atual

- ✅ **Build concluído**: Arquivos em `client/dist/`
- ✅ **Configuração pronta**: `firebase.json` e `.firebaserc`
- ⏳ **Deploy pendente**: Requer autenticação

## 🔐 Métodos de Autenticação

### Método 1: Token Firebase (Recomendado para CI/CD)

```bash
# Obter token (válido por 1 hora)
npx firebase-tools login:ci

# Usar o token para deploy
export FIREBASE_TOKEN="seu-token-aqui"
node deploy-firebase-rest-api.js
```

### Método 2: Autenticação Interativa

```bash
# Fazer login uma vez
npx firebase-tools login

# Deploy direto
npx firebase-tools deploy --only hosting
```

### Método 3: Service Account (Para produção/CI)

1. Criar service account no Google Cloud Console
2. Baixar JSON da chave
3. Configurar variável:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
node deploy-firebase-rest-api.js
```

## 📦 Arquivos de Deploy Criados

- `deploy-firebase-rest-api.js` - Script Node.js para deploy via API
- `deploy-firebase-direct.js` - Script alternativo
- `deploy-via-api.sh` - Script bash

## 🎯 Comando Rápido

```bash
# Opção mais simples (requer login uma vez)
cd /workspace
npx firebase-tools login
npx firebase-tools deploy --only hosting
```

## 📊 Informações do Projeto

- **Projeto**: `ifrs15-revenue-manager`
- **Site**: `ifrs15-revenue-manager.web.app`
- **Diretório de build**: `client/dist/`

## ✅ Verificação Pós-Deploy

Após o deploy bem-sucedido, acesse:
- https://ifrs15-revenue-manager.web.app
- https://ifrs15-revenue-manager.firebaseapp.com

## 🔍 Troubleshooting

### Erro: "Failed to authenticate"
**Solução**: Execute `npx firebase-tools login` primeiro

### Erro: "Project not found"
**Solução**: Verifique o projeto em `.firebaserc`

### Erro: "Build directory not found"
**Solução**: Execute `cd client && npm run build` primeiro

## 📝 Notas

- O deploy via API REST requer autenticação OAuth2
- Tokens CI são válidos por 1 hora
- Para produção, use service accounts
- O Firebase CLI é a forma mais simples de fazer deploy
