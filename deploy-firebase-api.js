#!/usr/bin/env node

/**
 * Script para fazer deploy no Firebase Hosting usando a API REST
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const PROJECT_ID = 'ifrs15-revenue-manager';
const DIST_DIR = path.join(__dirname, 'client', 'dist');

// Função para fazer requisição HTTPS
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: body });
        }
      });
    });
    
    req.on('error', reject);
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

// Obter token de acesso
async function getAccessToken() {
  const token = process.env.FIREBASE_TOKEN;
  if (!token) {
    throw new Error('FIREBASE_TOKEN não encontrado. Configure a variável de ambiente FIREBASE_TOKEN');
  }
  return token;
}

// Criar release no Firebase Hosting
async function createRelease(accessToken) {
  console.log('📦 Criando release no Firebase Hosting...');
  
  const options = {
    hostname: 'firebasehosting.googleapis.com',
    path: `/v1beta1/projects/${PROJECT_ID}/sites/${PROJECT_ID}/releases`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };

  const body = JSON.stringify({
    version: {
      config: {
        headers: [
          {
            glob: '**/*.@(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)',
            headers: {
              'Cache-Control': 'max-age=31536000',
            },
          },
        ],
        rewrites: [
          {
            source: '**',
            destination: '/index.html',
          },
        ],
      },
    },
    message: 'Deploy automático - Sincronização de data e horário',
  });

  try {
    const response = await makeRequest(options, body);
    if (response.status === 200) {
      console.log('✅ Release criada com sucesso!');
      return response.body;
    } else {
      throw new Error(`Erro ao criar release: ${response.status} - ${JSON.stringify(response.body)}`);
    }
  } catch (error) {
    throw new Error(`Erro ao criar release: ${error.message}`);
  }
}

// Upload de arquivos usando Firebase CLI via API
async function deployFiles(accessToken) {
  console.log('🚀 Iniciando deploy dos arquivos...');
  
  // Usar Firebase CLI com token
  try {
    const deployCommand = `npx firebase-tools deploy --only hosting --token ${accessToken} --non-interactive`;
    console.log('Executando:', deployCommand);
    const output = execSync(deployCommand, { 
      cwd: __dirname,
      stdio: 'inherit',
      env: { ...process.env, FIREBASE_TOKEN: accessToken }
    });
    console.log('✅ Deploy concluído com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro no deploy:', error.message);
    throw error;
  }
}

// Função principal
async function main() {
  try {
    console.log('🔥 Iniciando deploy no Firebase Hosting via API...\n');
    
    // Verificar se o diretório dist existe
    if (!fs.existsSync(DIST_DIR)) {
      throw new Error(`Diretório de build não encontrado: ${DIST_DIR}`);
    }
    
    console.log(`📁 Diretório de build: ${DIST_DIR}`);
    
    // Obter token de acesso
    const accessToken = await getAccessToken();
    console.log('✅ Token de acesso obtido\n');
    
    // Fazer deploy
    await deployFiles(accessToken);
    
    console.log('\n🎉 Deploy concluído com sucesso!');
    console.log(`🌐 Acesse: https://${PROJECT_ID}.web.app`);
    
  } catch (error) {
    console.error('\n❌ Erro no deploy:', error.message);
    process.exit(1);
  }
}

main();
