#!/bin/bash

# Script para fazer deploy no Firebase usando API
# Este script usa a API REST do Firebase Hosting

PROJECT_ID="ifrs15-revenue-manager"
DIST_DIR="client/dist"

echo "🔥 Iniciando deploy no Firebase Hosting via API..."
echo ""

# Verificar se o diretório dist existe
if [ ! -d "$DIST_DIR" ]; then
    echo "❌ Erro: Diretório de build não encontrado: $DIST_DIR"
    exit 1
fi

echo "📁 Diretório de build: $DIST_DIR"
echo "📦 Arquivos prontos para deploy:"
ls -lh "$DIST_DIR" | tail -n +2
echo ""

# Verificar se Firebase CLI está disponível
if ! command -v firebase &> /dev/null && ! command -v npx &> /dev/null; then
    echo "❌ Erro: Firebase CLI não encontrado"
    echo "💡 Instale com: npm install -g firebase-tools"
    exit 1
fi

# Tentar usar token se disponível
if [ -n "$FIREBASE_TOKEN" ]; then
    echo "✅ Usando FIREBASE_TOKEN para autenticação"
    echo ""
    npx firebase-tools deploy --only hosting --token "$FIREBASE_TOKEN" --non-interactive --project "$PROJECT_ID"
else
    echo "⚠️  FIREBASE_TOKEN não encontrado"
    echo "📝 Tentando deploy com autenticação..."
    echo ""
    echo "💡 Para usar token, configure:"
    echo "   export FIREBASE_TOKEN=\"seu-token\""
    echo ""
    
    # Tentar fazer deploy (pode pedir autenticação)
    npx firebase-tools deploy --only hosting --project "$PROJECT_ID"
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deploy concluído com sucesso!"
    echo "🌐 Acesse: https://${PROJECT_ID}.web.app"
    echo "🌐 Ou: https://${PROJECT_ID}.firebaseapp.com"
else
    echo ""
    echo "❌ Erro no deploy"
    echo ""
    echo "📋 Para fazer deploy manualmente:"
    echo "   1. Autenticar: npx firebase-tools login"
    echo "   2. Deploy: npx firebase-tools deploy --only hosting"
    exit 1
fi
