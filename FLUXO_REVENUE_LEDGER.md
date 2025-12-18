# 📊 Fluxo de Geração de Lançamentos no Revenue Ledger

Este documento descreve o fluxo completo de como os lançamentos contábeis são gerados e exibidos nas páginas **Revenue Ledger** e **Accounting Reconciliation**.

---

## 🔄 Fluxo Completo (Após Correções)

### 1. **Criação do Contrato**
```
Usuário cria contrato → Contract document criado no Firestore
                      → Versão inicial criada automaticamente
                      → Billing schedules gerados (se configurado)
```

### 2. **Execução do Motor IFRS 15**

Pode ser acionado de 3 formas:
- ✅ Botão "Calculate IFRS 15" na página Revenue Ledger
- ✅ Botão "Calcular IFRS 15 (Gerar Ledger)" na página Accounting Reconciliation
- ✅ Chamada direta à função `runIFRS15Engine` via API

**O que o Engine faz:**

```typescript
// 1. Busca contrato e versão atual
const contract = await getContract(contractId);
const version = await getVersion(contract.currentVersionId);

// 2. Busca line items e performance obligations
const lineItems = await getLineItems(versionId);
const pos = await getPerformanceObligations(versionId);

// 3. Calcula transaction price e alocações
const result = {
  transactionPrice: calculateTransactionPrice(lineItems),
  allocations: allocatePrice(lineItems, pos),
  totalRecognizedRevenue: calculateRecognized(pos),
  totalDeferredRevenue: transactionPrice - totalRecognizedRevenue,
};

// 4. Gera entries no Revenue Ledger
await generateRevenueLedgerV2ForContract({ contractId, upTo: now });

// 5. NOVO: Gera entries iniciais de deferred revenue
await generateInitialDeferredRevenueEntries({
  contractId,
  ifrs15Result: result,
  // ...
});
```

### 3. **Geração de Lançamentos (Revenue Ledger Entries)**

Existem **3 geradores** de lançamentos:

#### 3.1. **Initial Ledger Entries** (NOVO - Sempre Executa)
📁 `functions/src/ifrs15/initial-ledger-entries.ts`

```typescript
// Cria entry de deferred revenue SEMPRE que transactionPrice > 0
// INDEPENDENTE de billing ou payment

Entry criado:
  Dr 1300 - Contract Asset
  Cr 2500 - Deferred Revenue
  Valor: transactionPrice
  Ref: V2-INITIAL-DEF-{contractId}-{timestamp}
```

**Quando executa:** Após `runIFRS15Engine` calcular o result

**Vantagem:** Garante que sempre haverá entries, mesmo sem faturamento

#### 3.2. **Ledger V2 (Event-Based)**
📁 `functions/src/ifrs15/ledger-v2.ts`

Cria entries baseados em **eventos**:

```typescript
// Eventos de Billing
- Billing marcado como "invoiced" → Dr AR / Cr Contract Liability
- Billing marcado como "paid" → Dr Cash / Cr AR

// Eventos de Revenue Recognition
- PO satisfied (point_in_time) → Dr Deferred Rev / Cr Revenue
- Revenue schedule (over_time) → Dr Deferred Rev / Cr Revenue (mensal)
```

**Quando executa:**
- Através de triggers (onBillingInvoiced, onBillingPaid, onPOSatisfied)
- Chamado por `generateRevenueLedgerV2ForContract`

**Limitação:** Se não houver billing com status "invoiced" ou "paid", não cria entries

#### 3.3. **Triggers de Firestore**
📁 `functions/src/ifrs15/revenue-ledger-triggers.ts`

Escuta mudanças em:
- `billingSchedules` → onBillingInvoiced, onBillingPaid
- `performanceObligations` → onPOSatisfied

**Quando dispara:**
- Status do billing muda para "invoiced" ou "paid"
- PO.isSatisfied muda para `true`

---

## 🎯 Estrutura do Ledger Entry

Todos os entries criados seguem este formato:

```typescript
{
  // Identificação
  tenantId: string,
  contractId: string,
  performanceObligationId?: string,
  billingScheduleId?: string,

  // Versioning (CRÍTICO!)
  ledgerVersion: 2,  // ← OBRIGATÓRIO para aparecer nas páginas
  source: "ifrs15-initial-deferred" | "ifrs15-ledger-v2" | "ifrs15-revenue-recognition",

  // Datas
  entryDate: Timestamp,
  periodStart: Timestamp,
  periodEnd: Timestamp,

  // Contabilidade
  entryType: "revenue" | "deferred_revenue" | "contract_asset" | "contract_liability" | "receivable" | "cash",
  debitAccount: string,  // Ex: "1300 - Contract Asset"
  creditAccount: string, // Ex: "2500 - Deferred Revenue"
  amount: number,
  currency: string,
  exchangeRate: number,

  // Metadata
  description: string,
  referenceNumber: string,  // ← Deve começar com "V2-" para aparecer nas páginas (se filtro ativo)

  // Status
  isPosted: boolean,
  isReversed: boolean,

  // Timestamps
  createdAt: Timestamp,
}
```

---

## 📺 Exibição nas Páginas

### Revenue Ledger
📁 `client/src/pages/revenue-ledger.tsx`

**Query:**
```typescript
const entries = await revenueLedgerService.getAll(tenantId);
// Agora retorna TODOS os entries (filtro V2 removido)
```

**Filtros disponíveis:**
- ✅ Toggle "Mostrar todas as versões" (checkbox)
- Por tipo de entry (revenue, deferred_revenue, etc)
- Por status (posted, unposted)
- Por contrato
- Por texto (search)

**Botões de ação:**
- "Calculate IFRS 15" → Executa `calculateIFRS15All()` para todos os contratos
- "Post All" → Marca todos os entries como posted
- "Post" (individual) → Marca um entry como posted

### Accounting Reconciliation
📁 `client/src/pages/accounting-reconciliation.tsx`

**Query:**
```typescript
const entries = await revenueLedgerService.getAll(tenantId);
// Retorna TODOS os entries
```

**Cálculos:**
- Saldo de abertura por conta
- Débitos e créditos no período
- Saldo de encerramento
- Quebra por contrato

**Botões de ação:**
- "Calcular IFRS 15 (Gerar Ledger)" → Executa cálculo para todos os contratos

---

## 🔧 Como Usar

### Para gerar lançamentos pela primeira vez:

1. **Crie um contrato** com line items e performance obligations
   - Line items devem ter `isDistinct: true` e `distinctWithinContext: true`
   - Ou crie POs manualmente

2. **Execute o Calculate IFRS 15**
   - Na página Revenue Ledger, clique em "Calculate IFRS 15"
   - OU na página Accounting Reconciliation, clique em "Calcular IFRS 15"

3. **Verifique os lançamentos**
   - Revenue Ledger mostrará os entries criados
   - Accounting Reconciliation mostrará os saldos consolidados

### Para reconhecer receita:

**Método 1: Point-in-Time (Reconhecimento Único)**
1. Marque a PO como satisfied: `isSatisfied: true`
2. Trigger `onPOSatisfied` cria entry de receita automaticamente

**Método 2: Over-Time (Reconhecimento Mensal)**
1. Configure PO com `recognitionMethod: "over_time"`
2. Crie revenue schedules na subcoleção da PO
3. Função agendada `monthlyRevenueRecognition` reconhece mensalmente

**Método 3: Baseado em Billing**
1. Marque billing schedule como "invoiced" → Cria AR entry
2. Marque billing schedule como "paid" → Cria Cash entry
3. Se PO estiver satisfied, reconhece receita proporcional

---

## 🚨 Troubleshooting

### Problema: Nenhum entry aparece na página

**Possíveis causas:**
1. ✅ **RESOLVIDO**: Filtro V2 bloqueava entries - agora desabilitado
2. Contrato sem `currentVersionId` - Execute `fixContractVersions`
3. Versão sem line items - Adicione line items
4. Line items sem flags corretos - Marque `isDistinct` e `distinctWithinContext`
5. Motor IFRS 15 não foi executado - Clique em "Calculate IFRS 15"

**Como diagnosticar:**
1. Abra console do navegador (F12)
2. Procure por logs `[revenue-ledger]`
3. Verifique: `Total entries: X, V2: Y`
4. Se `Total entries: 0` → Execute Calculate
5. Se `Total > 0` mas entries não aparecem → Problema de filtro (já corrigido)

### Problema: Entries criados mas valores errados

**Verificar:**
1. Transaction price calculado corretamente? Ver logs do Engine
2. Allocations corretas? Ver `result.allocations`
3. Line items com standalone selling prices corretos?
4. Performance obligations com valores alocados corretos?

### Problema: Duplicate entries

**Causa:** `generateInitialDeferredRevenueEntries` sendo chamado múltiplas vezes

**Proteção:** A função já verifica se entry existe antes de criar

**Se ocorrer:** Deletar entries duplicados manualmente no Firestore Console

---

## 📝 Logs Importantes

### No Backend (Functions Logs):
```
[runIFRS15Engine] Starting IFRS 15 calculation...
[runIFRS15Engine] Transaction price: X
[runIFRS15Engine] Gerando entries iniciais de deferred revenue...
[generateInitialDeferredRevenueEntries] Entry criado: {id}
[generateRevenueLedgerV2ForContract] Processing contract...
```

### No Frontend (Browser Console):
```
[revenue-ledger] Buscando ledger entries para tenant: {tenantId}
[revenue-ledger] Total entries retornados: X
[revenue-ledger] Entries V2: Y, Total: X
[accounting-reconciliation] Total entries: X, V2: Y
```

---

## 🎓 Conceitos IFRS 15

### Transaction Price
Valor total do contrato, ajustado por:
- Variable consideration (descontos, rebates)
- Significant financing component
- Non-cash consideration

### Allocation
Distribuição do transaction price entre as performance obligations baseado em standalone selling prices

### Recognition
Conversão de deferred revenue em revenue reconhecida:
- **Over time**: Baseado em progresso (input ou output method)
- **Point in time**: Quando controle é transferido (PO satisfied)

### Contract Balances
- **Contract Asset (1300)**: Receita reconhecida > Faturamento
- **Contract Liability (2500)**: Faturamento > Receita reconhecida
- **Accounts Receivable (1200)**: Faturado mas não recebido

---

## 🔗 Arquivos Relacionados

### Backend:
- `functions/src/ifrs15/engine.ts` - Motor principal IFRS 15
- `functions/src/ifrs15/ledger-v2.ts` - Gerador de entries baseado em eventos
- `functions/src/ifrs15/initial-ledger-entries.ts` - Gerador de entries iniciais (NOVO)
- `functions/src/ifrs15/revenue-ledger-triggers.ts` - Triggers de Firestore
- `functions/src/maintenance/calculate-ifrs15-all.ts` - Função de cálculo em massa (NOVO)

### Frontend:
- `client/src/pages/revenue-ledger.tsx` - Página Revenue Ledger
- `client/src/pages/accounting-reconciliation.tsx` - Página Accounting Reconciliation
- `client/src/lib/firestore-service.ts` - Serviços de API

### Shared:
- `shared/firestore-types.ts` - Tipos e schemas

---

## ✅ Checklist de Implementação Completa

- [x] Remover filtro V2 das páginas (agora opcional via toggle)
- [x] Corrigir `forceCreateLedgerEntry` para criar entries V2
- [x] Criar função `calculateIFRS15All` para processar todos os contratos
- [x] Criar função `generateInitialDeferredRevenueEntries`
- [x] Integrar gerador de entries iniciais no Engine
- [x] Modificar botão Calculate para chamar Engine de verdade
- [x] Adicionar logs detalhados em todas as etapas
- [x] Documentar fluxo completo

---

**Última atualização:** 2025-12-17
**Versão:** 2.0 (Pós-correção)
