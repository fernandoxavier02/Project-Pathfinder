# 🏢 Estrutura no Banco de Dados: Tenant por Empresa

## 📊 Visão Geral

**Modelo:** 1 Tenant = 1 Empresa (usuários da mesma empresa compartilham dados)

O `tenantId` é gerado a partir do **domínio do email** (parte após o `@`).

---

## 🗂️ Estrutura no Firestore

### Exemplo Prático:

#### Empresa 1: "empresa.com.br"
```
tenants/
└── empresa.com.br/                    ← TENANT (organização)
    ├── [documento tenant]
    │   ├── id: "empresa.com.br"
    │   ├── name: "Empresa"
    │   ├── plan: "professional"
    │   └── status: "active"
    │
    ├── users/                          ← USUÁRIOS DA EMPRESA
    │   ├── user1-abc123/              ← joao@empresa.com.br
    │   │   ├── email: "joao@empresa.com.br"
    │   │   ├── fullName: "João Silva"
    │   │   ├── tenantId: "empresa.com.br"
    │   │   └── role: "admin"
    │   │
    │   ├── user2-def456/              ← maria@empresa.com.br
    │   │   ├── email: "maria@empresa.com.br"
    │   │   ├── fullName: "Maria Santos"
    │   │   ├── tenantId: "empresa.com.br"
    │   │   └── role: "finance"
    │   │
    │   └── user3-ghi789/              ← pedro@empresa.com.br
    │       ├── email: "pedro@empresa.com.br"
    │       ├── fullName: "Pedro Costa"
    │       ├── tenantId: "empresa.com.br"
    │       └── role: "operations"
    │
    ├── licenses/                       ← LICENÇAS DA EMPRESA
    │   ├── lic1/
    │   ├── lic2/
    │   └── lic3/
    │
    ├── contracts/                      ← CONTRATOS (todos veem)
    │   ├── contrato-001/
    │   ├── contrato-002/
    │   └── contrato-003/
    │
    ├── customers/                      ← CLIENTES (compartilhados)
    │   ├── cliente-001/
    │   └── cliente-002/
    │
    ├── revenueLedgerEntries/           ← RAZÃO DE RECEITA (compartilhado)
    ├── billingSchedules/               ← CRONOGRAMAS (compartilhados)
    └── auditLogs/                      ← LOGS DE AUDITORIA (compartilhados)
```

#### Empresa 2: "outra-empresa.com"
```
tenants/
└── outra-empresa.com/                 ← TENANT DIFERENTE (isolado)
    ├── [documento tenant]
    │   ├── id: "outra-empresa.com"
    │   ├── name: "Outra Empresa"
    │   └── plan: "starter"
    │
    ├── users/
    │   └── user4-jkl012/              ← ana@outra-empresa.com
    │       ├── email: "ana@outra-empresa.com"
    │       ├── tenantId: "outra-empresa.com"
    │       └── role: "admin"
    │
    ├── contracts/
    │   └── contrato-x/
    │
    └── customers/
        └── cliente-y/
```

---

## 🔄 Collection Raiz (Users)

Além dos usuários dentro de cada tenant, existe uma collection raiz com TODOS os usuários:

```
users/                                  ← COLLECTION RAIZ (todos os usuários)
├── user1-abc123/                      ← joao@empresa.com.br
│   ├── email: "joao@empresa.com.br"
│   ├── tenantId: "empresa.com.br"    ← Link para o tenant
│   └── role: "admin"
│
├── user2-def456/                      ← maria@empresa.com.br
│   ├── email: "maria@empresa.com.br"
│   ├── tenantId: "empresa.com.br"    ← Mesmo tenant!
│   └── role: "finance"
│
├── user3-ghi789/                      ← pedro@empresa.com.br
│   ├── email: "pedro@empresa.com.br"
│   ├── tenantId: "empresa.com.br"    ← Mesmo tenant!
│   └── role: "operations"
│
└── user4-jkl012/                      ← ana@outra-empresa.com
    ├── email: "ana@outra-empresa.com"
    ├── tenantId: "outra-empresa.com" ← Tenant diferente
    └── role: "admin"
```

---

## ✅ Vantagens desta Estrutura

### 1. **Dados Compartilhados por Empresa**
- ✅ Todos os usuários de `empresa.com.br` veem os mesmos contratos
- ✅ Todos veem os mesmos clientes
- ✅ Todos veem o mesmo razão de receita
- ✅ Colaboração entre equipe da empresa

### 2. **Isolamento Entre Empresas**
- ✅ `empresa.com.br` NÃO vê dados de `outra-empresa.com`
- ✅ Cada empresa tem seu próprio tenant isolado
- ✅ Segurança e privacidade garantidas

### 3. **Organização Limpa**
```
tenants/
├── empresa.com.br/          ← Empresa 1 (3 usuários, todos compartilham)
├── outra-empresa.com/       ← Empresa 2 (1 usuário, isolada)
├── startup.io/              ← Empresa 3 (5 usuários, todos compartilham)
└── default/                 ← Tenant padrão (você)
```

---

## 🔍 Como Funciona na Prática

### Cenário 1: Criar Primeiro Usuário da Empresa

**Ação:** Criar usuário `joao@empresa.com.br`

**O que acontece:**
1. Sistema detecta domínio: `empresa.com.br`
2. Verifica se tenant `empresa.com.br` existe → **NÃO EXISTE**
3. **CRIA** novo tenant `empresa.com.br`
4. Cria usuário `joao` vinculado a esse tenant
5. Cria licença para o usuário

**Resultado no banco:**
```
tenants/empresa.com.br/ ✅ CRIADO
tenants/empresa.com.br/users/user-joao/ ✅ CRIADO
users/user-joao/ ✅ CRIADO (com tenantId: "empresa.com.br")
```

### Cenário 2: Criar Segundo Usuário da Mesma Empresa

**Ação:** Criar usuário `maria@empresa.com.br`

**O que acontece:**
1. Sistema detecta domínio: `empresa.com.br`
2. Verifica se tenant `empresa.com.br` existe → **JÁ EXISTE!**
3. **USA** tenant existente (não cria novo)
4. Cria usuário `maria` vinculado ao mesmo tenant
5. Cria licença para o usuário

**Resultado no banco:**
```
tenants/empresa.com.br/ ✅ JÁ EXISTE (reutilizado)
tenants/empresa.com.br/users/user-maria/ ✅ CRIADO
users/user-maria/ ✅ CRIADO (com tenantId: "empresa.com.br")
```

### Cenário 3: Criar Usuário de Outra Empresa

**Ação:** Criar usuário `ana@outra-empresa.com`

**O que acontece:**
1. Sistema detecta domínio: `outra-empresa.com`
2. Verifica se tenant `outra-empresa.com` existe → **NÃO EXISTE**
3. **CRIA** novo tenant `outra-empresa.com`
4. Cria usuário `ana` vinculado a esse tenant

**Resultado no banco:**
```
tenants/outra-empresa.com/ ✅ NOVO TENANT (isolado)
tenants/outra-empresa.com/users/user-ana/ ✅ CRIADO
users/user-ana/ ✅ CRIADO (com tenantId: "outra-empresa.com")
```

---

## 📋 Resumo da Estrutura

| Nível | Localização | Conteúdo | Visibilidade |
|-------|-------------|----------|--------------|
| **Raiz** | `users/{userId}` | Todos os usuários do sistema | Firebase Auth + Claims |
| **Tenant** | `tenants/{tenantId}` | Dados da empresa/organização | Usuários do mesmo tenant |
| **Subcollections** | `tenants/{tenantId}/users` | Usuários da empresa | Todos do tenant |
| **Subcollections** | `tenants/{tenantId}/contracts` | Contratos da empresa | Todos do tenant |
| **Subcollections** | `tenants/{tenantId}/customers` | Clientes da empresa | Todos do tenant |

---

## 🔐 Segurança (Firestore Rules)

As regras garantem que:
- ✅ Usuários só acessam dados do seu próprio tenant
- ✅ `joao@empresa.com.br` NÃO pode ver dados de `outra-empresa.com`
- ✅ `joao` e `maria` (mesma empresa) VEEM os mesmos dados
- ✅ Cada empresa tem isolamento total

---

## 🎯 Resposta Final

**Como fica no banco com tenant por empresa:**

1. **1 Tenant = 1 Domínio de Email = 1 Empresa**
2. **Todos os usuários do mesmo domínio compartilham o mesmo tenant**
3. **Cada tenant tem suas próprias subcollections isoladas**
4. **Dados NÃO se misturam entre empresas diferentes**

**Exemplo Visual:**
```
Firestore
├── tenants/
│   ├── empresa.com.br/          ← Empresa A
│   │   ├── users/ [joao, maria, pedro]
│   │   ├── contracts/ [todos compartilham]
│   │   └── customers/ [todos compartilham]
│   │
│   └── outra-empresa.com/       ← Empresa B (isolada)
│       ├── users/ [ana]
│       ├── contracts/ [isolados]
│       └── customers/ [isolados]
│
└── users/                        ← Raiz (todos)
    ├── joao (tenantId: empresa.com.br)
    ├── maria (tenantId: empresa.com.br)
    └── ana (tenantId: outra-empresa.com)
```
