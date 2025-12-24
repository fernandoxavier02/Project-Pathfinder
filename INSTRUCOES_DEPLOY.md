# 📋 Instruções para Deploy no Firebase

## ✅ Status: Build Pronto para Deploy

O build foi concluído com sucesso e está em `client/dist/`

## 🚀 Deploy Rápido (Recomendado)

Execute no terminal:

```bash
cd /workspace
npx firebase-tools login
npx firebase-tools deploy --only hosting
```

## 🔐 Deploy com Token (Para CI/CD)

1. **Obter token**:
   ```bash
   npx firebase-tools login:ci
   ```
   Isso retornará um token que você pode usar.

2. **Fazer deploy com token**:
   ```bash
   export FIREBASE_TOKEN="token-retornado-acima"
   npx firebase-tools deploy --only hosting --token $FIREBASE_TOKEN
   ```

## 📦 Arquivos Criados

Todos os scripts estão prontos em `/workspace`:
- `deploy-firebase-rest-api.js` - Deploy via API Node.js
- `deploy-firebase-direct.js` - Deploy direto
- `deploy-via-api.sh` - Deploy via bash

## 🌐 Após o Deploy

A aplicação estará disponível em:
- https://ifrs15-revenue-manager.web.app
- https://ifrs15-revenue-manager.firebaseapp.com

## ⚠️ Importante

O deploy requer autenticação no Firebase. Se você não tiver acesso, peça ao administrador do projeto para:
1. Adicionar você como colaborador no Firebase Console
2. Ou fornecer um token de deploy

## 📝 Próximos Passos

1. Autenticar no Firebase (`npx firebase-tools login`)
2. Executar deploy (`npx firebase-tools deploy --only hosting`)
3. Verificar aplicação online
