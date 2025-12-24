#!/usr/bin/env node

/**
 * Script para fazer deploy no Firebase Hosting usando Firebase CLI com autenticação
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'ifrs15-revenue-manager';
const DIST_DIR = path.join(__dirname, 'client', 'dist');

async function deploy() {
  try {
    console.log('🔥 Iniciando deploy no Firebase Hosting...\n');
    
    // Verificar se o diretório dist existe
    if (!fs.existsSync(DIST_DIR)) {
      throw new Error(`Diretório de build não encontrado: ${DIST_DIR}`);
    }
    
    console.log(`📁 Diretório de build: ${DIST_DIR}`);
    console.log('📦 Arquivos prontos para deploy:\n');
    
    // Listar arquivos
    const files = fs.readdirSync(DIST_DIR, { recursive: true });
    files.forEach(file => {
      const filePath = path.join(DIST_DIR, file);
      if (fs.statSync(filePath).isFile()) {
        const size = (fs.statSync(filePath).size / 1024).toFixed(2);
        console.log(`   ✓ ${file} (${size} kB)`);
      }
    });
    
    console.log('\n🚀 Tentando deploy via Firebase CLI...\n');
    
    // Tentar usar token se disponível
    const token = process.env.FIREBASE_TOKEN;
    let deployCommand;
    
    if (token) {
      console.log('✅ Usando FIREBASE_TOKEN para autenticação\n');
      deployCommand = `npx firebase-tools deploy --only hosting --token "${token}" --non-interactive --project ${PROJECT_ID}`;
    } else {
      console.log('⚠️  FIREBASE_TOKEN não encontrado');
      console.log('📝 Tentando deploy com autenticação interativa...\n');
      console.log('💡 Para usar token, configure: export FIREBASE_TOKEN="seu-token"\n');
      
      // Tentar fazer login e deploy
      deployCommand = `npx firebase-tools deploy --only hosting --project ${PROJECT_ID}`;
    }
    
    console.log(`Executando: ${deployCommand.replace(token ? token : '', '[TOKEN]')}\n`);
    
    try {
      execSync(deployCommand, { 
        cwd: __dirname,
        stdio: 'inherit',
        env: { ...process.env }
      });
      
      console.log('\n✅ Deploy concluído com sucesso!');
      console.log(`🌐 Acesse: https://${PROJECT_ID}.web.app`);
      console.log(`🌐 Ou: https://${PROJECT_ID}.firebaseapp.com\n`);
      
    } catch (error) {
      if (error.message.includes('Failed to authenticate')) {
        console.error('\n❌ Erro de autenticação');
        console.error('\n📋 Para fazer deploy, você precisa:');
        console.error('   1. Autenticar no Firebase:');
        console.error('      npx firebase-tools login');
        console.error('\n   2. Ou configurar FIREBASE_TOKEN:');
        console.error('      export FIREBASE_TOKEN="seu-token"');
        console.error('      node deploy-firebase-direct.js\n');
        throw error;
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    console.error('\n❌ Erro no deploy:', error.message);
    
    // Criar instruções alternativas
    console.error('\n📝 Instruções alternativas:\n');
    console.error('1. Autenticar manualmente:');
    console.error('   npx firebase-tools login');
    console.error('   npx firebase-tools deploy --only hosting\n');
    
    console.error('2. Ou usar token CI/CD:');
    console.error('   export FIREBASE_TOKEN="seu-token"');
    console.error('   npx firebase-tools deploy --only hosting --token $FIREBASE_TOKEN\n');
    
    process.exit(1);
  }
}

deploy();
