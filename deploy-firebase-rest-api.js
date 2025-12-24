#!/usr/bin/env node

/**
 * Deploy no Firebase Hosting usando API REST
 * Requer: FIREBASE_TOKEN ou GOOGLE_APPLICATION_CREDENTIALS
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ID = 'ifrs15-revenue-manager';
const SITE_ID = PROJECT_ID; // Para Firebase Hosting, site ID geralmente é o mesmo do projeto
const DIST_DIR = path.join(__dirname, 'client', 'dist');

// Obter token de acesso OAuth2
async function getAccessToken() {
  // Método 1: Usar FIREBASE_TOKEN diretamente
  if (process.env.FIREBASE_TOKEN) {
    return process.env.FIREBASE_TOKEN;
  }
  
  // Método 2: Usar service account
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (fs.existsSync(credentialsPath)) {
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      // Obter token usando gcloud ou service account
      try {
        const token = execSync(`gcloud auth print-access-token`, { encoding: 'utf8' }).trim();
        return token;
      } catch (e) {
        console.log('⚠️  gcloud não disponível, tentando outro método...');
      }
    }
  }
  
  throw new Error('Token de acesso não encontrado. Configure FIREBASE_TOKEN ou GOOGLE_APPLICATION_CREDENTIALS');
}

// Upload de arquivos usando Firebase CLI (mais simples)
async function deployViaCLI(token) {
  console.log('🚀 Fazendo deploy via Firebase CLI...\n');
  
  const command = `npx firebase-tools deploy --only hosting --token "${token}" --non-interactive --project ${PROJECT_ID}`;
  
  try {
    execSync(command, {
      cwd: __dirname,
      stdio: 'inherit',
      env: { ...process.env, FIREBASE_TOKEN: token }
    });
    
    console.log('\n✅ Deploy concluído com sucesso!');
    console.log(`🌐 Acesse: https://${PROJECT_ID}.web.app`);
    return true;
  } catch (error) {
    throw new Error(`Erro no deploy: ${error.message}`);
  }
}

// Função principal
async function main() {
  try {
    console.log('🔥 Deploy no Firebase Hosting via API\n');
    console.log(`📁 Projeto: ${PROJECT_ID}`);
    console.log(`📦 Diretório: ${DIST_DIR}\n`);
    
    // Verificar build
    if (!fs.existsSync(DIST_DIR)) {
      throw new Error(`Diretório de build não encontrado: ${DIST_DIR}`);
    }
    
    const files = fs.readdirSync(DIST_DIR, { recursive: true });
    console.log(`✅ ${files.length} arquivos prontos para deploy\n`);
    
    // Obter token
    console.log('🔐 Obtendo token de acesso...');
    const token = await getAccessToken();
    console.log('✅ Token obtido\n');
    
    // Fazer deploy
    await deployViaCLI(token);
    
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.error('\n📋 Opções para autenticação:\n');
    console.error('1. Usar FIREBASE_TOKEN:');
    console.error('   export FIREBASE_TOKEN="seu-token"');
    console.error('   node deploy-firebase-rest-api.js\n');
    
    console.error('2. Autenticar via CLI:');
    console.error('   npx firebase-tools login');
    console.error('   npx firebase-tools deploy --only hosting\n');
    
    console.error('3. Usar service account:');
    console.error('   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"');
    console.error('   node deploy-firebase-rest-api.js\n');
    
    process.exit(1);
  }
}

main();
