#!/bin/bash

# Script para tentar deploy sem interação
# Tenta várias formas de autenticação

PROJECT_ID="ifrs15-revenue-manager"
echo "🔥 Tentando deploy sem interação..."

# Verificar se há token disponível
if [ -n "$FIREBASE_TOKEN" ]; then
    echo "✅ FIREBASE_TOKEN encontrado!"
    npx firebase-tools deploy --only hosting --token "$FIREBASE_TOKEN" --non-interactive --project "$PROJECT_ID"
    exit $?
fi

# Verificar se há service account
if [ -n "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo "✅ GOOGLE_APPLICATION_CREDENTIALS encontrado!"
    if [ -f "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
        npx firebase-tools deploy --only hosting --non-interactive --project "$PROJECT_ID"
        exit $?
    fi
fi

# Tentar usar gcloud se disponível
if command -v gcloud &> /dev/null; then
    echo "✅ gcloud encontrado, tentando obter token..."
    TOKEN=$(gcloud auth print-access-token 2>/dev/null)
    if [ -n "$TOKEN" ]; then
        export FIREBASE_TOKEN="$TOKEN"
        npx firebase-tools deploy --only hosting --token "$TOKEN" --non-interactive --project "$PROJECT_ID"
        exit $?
    fi
fi

echo "❌ Nenhum método de autenticação disponível"
echo ""
echo "📋 Opções disponíveis:"
echo "1. Configure FIREBASE_TOKEN: export FIREBASE_TOKEN='seu-token'"
echo "2. Use GitHub Actions para deploy automático"
echo "3. Execute no computador quando tiver acesso"
exit 1
