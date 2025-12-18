# Testes de Validação - Performance Obligations

## Data: 2025-12-17

---

## 📋 Cenários de Teste Implementados

### ✅ 1. Validação de Soma de POs ≤ TotalValue do Contrato

**Cenário**: Tentar criar uma PO que faria a soma exceder o valor total do contrato.

**Passos**:
1. Criar um contrato com `totalValue = 100000`
2. Criar PO1 com `allocatedPrice = 60000` ✅
3. Criar PO2 com `allocatedPrice = 50000` ❌ (deve bloquear - soma = 110000 > 100000)

**Resultado Esperado**:
- Erro: "A soma dos preços alocados (110000.00) excede o valor total do contrato (100000.00). Máximo permitido: 40000.00"
- Submit bloqueado

---

### ✅ 2. Validação Point-in-Time: Exige Due Date

**Cenário**: Tentar criar uma PO point-in-time sem dueDate.

**Passos**:
1. Selecionar `recognitionMethod = "point_in_time"`
2. Preencher todos os campos exceto `dueDate`
3. Tentar submeter

**Resultado Esperado**:
- Erro de validação: "Due date is required for point in time recognition"
- Campo `dueDate` destacado com erro
- Submit bloqueado

---

### ✅ 3. Validação Over-Time: Exige Start Date, End Date e Frequency

**Cenário**: Tentar criar uma PO over-time sem startDate, endDate ou frequency.

**Passos**:
1. Selecionar `recognitionMethod = "over_time"`
2. Preencher todos os campos exceto `startDate` (ou `endDate`, ou `frequency`)
3. Tentar submeter

**Resultado Esperado**:
- Erro de validação: "Start date, end date, and frequency are required for over time recognition"
- Campos faltantes destacados com erro
- Submit bloqueado

---

### ✅ 4. Validação: End Date deve ser após Start Date

**Cenário**: Tentar criar uma PO over-time com endDate anterior a startDate.

**Passos**:
1. Selecionar `recognitionMethod = "over_time"`
2. Preencher `startDate = "2025-12-31"`
3. Preencher `endDate = "2025-01-01"` (anterior a startDate)
4. Tentar submeter

**Resultado Esperado**:
- Erro de validação: "End date must be after start date"
- Campo `endDate` destacado com erro
- Submit bloqueado

---

### ✅ 5. Geração Automática de Billing Schedules: Point-in-Time

**Cenário**: Criar uma PO point-in-time e verificar se billing schedule é gerado automaticamente.

**Passos**:
1. Criar contrato com `totalValue = 100000`
2. Criar PO point-in-time:
   - `description = "Software License"`
   - `allocatedPrice = 50000`
   - `recognitionMethod = "point_in_time"`
   - `dueDate = "2025-12-31"`
3. Salvar PO

**Resultado Esperado**:
- PO criada com sucesso
- **1 billing schedule** gerado automaticamente:
  - `billingDate = dueDate - 7 dias` (2025-12-24)
  - `dueDate = 2025-12-31`
  - `amount = 50000`
  - `frequency = "one_time"`
  - `status = "scheduled"`
  - `performanceObligationId = <PO_ID>`
- UI atualizada mostrando o billing schedule na aba "Billing"

---

### ✅ 6. Geração Automática de Billing Schedules: Over-Time

**Cenário**: Criar uma PO over-time e verificar se billing schedules são gerados automaticamente.

**Passos**:
1. Criar contrato com `totalValue = 100000`
2. Criar PO over-time:
   - `description = "Support Services"`
   - `allocatedPrice = 60000`
   - `recognitionMethod = "over_time"`
   - `startDate = "2025-01-01"`
   - `endDate = "2025-12-31"`
   - `frequency = "monthly"`
3. Salvar PO

**Resultado Esperado**:
- PO criada com sucesso
- **12 billing schedules** gerados automaticamente (1 por mês):
  - Cada schedule com `amount = 5000` (60000 / 12)
  - `billingDate` incrementando mensalmente (jan, fev, mar, ..., dez)
  - `dueDate = billingDate + 30 dias`
  - `frequency = "monthly"`
  - `status = "scheduled"`
  - `performanceObligationId = <PO_ID>`
- UI atualizada mostrando os 12 billing schedules na aba "Billing"

**Cenários Adicionais**:
- **Quarterly**: 4 schedules (60000 / 4 = 15000 cada)
- **Semi-Annual**: 2 schedules (60000 / 2 = 30000 cada)
- **Annual**: 1 schedule (60000)

---

### ✅ 7. Geração Automática de Ledger Entries: Point-in-Time (Billing Invoiced)

**Cenário**: Marcar billing schedule de PO point-in-time como "invoiced" e verificar ledger entry.

**Passos**:
1. Criar PO point-in-time com billing schedule gerado
2. Marcar billing schedule como `status = "invoiced"`

**Resultado Esperado**:
- **1 ledger entry** gerado automaticamente:
  - `entryType = "receivable"`
  - `debitAccount = "1200 - Accounts Receivable (AR)"`
  - `creditAccount = "4000 - Revenue"`
  - `amount = <billing_amount>`
  - `billingScheduleId = <billing_id>`
  - `performanceObligationId = <PO_ID>`
- UI atualizada mostrando a entrada na aba "Ledger"

---

### ✅ 8. Geração Automática de Ledger Entries: Over-Time (Billing Invoiced)

**Cenário**: Marcar billing schedule de PO over-time como "invoiced" e verificar ledger entry.

**Passos**:
1. Criar PO over-time com billing schedules gerados
2. Marcar um billing schedule como `status = "invoiced"`

**Resultado Esperado**:
- **1 ledger entry** gerado automaticamente:
  - `entryType = "receivable"`
  - `debitAccount = "1200 - Accounts Receivable (AR)"`
  - `creditAccount = "2500 - Deferred Revenue"` (diferente de point-in-time!)
  - `amount = <billing_amount>`
  - `billingScheduleId = <billing_id>`
  - `performanceObligationId = <PO_ID>`
- UI atualizada mostrando a entrada na aba "Ledger"

---

### ✅ 9. Geração Automática de Ledger Entries: Over-Time (Monthly Recognition)

**Cenário**: Aguardar reconhecimento mensal de revenue para PO over-time.

**Passos**:
1. Criar PO over-time com billing schedules gerados e faturados
2. Aguardar execução do cron job mensal (dia 1, 2 AM)
3. Verificar ledger entries gerados

**Resultado Esperado**:
- **Ledger entries** gerados automaticamente para períodos passados:
  - `entryType = "revenue"`
  - `debitAccount = "2500 - Deferred Revenue"`
  - `creditAccount = "4000 - Revenue"`
  - `amount = <proporcional ao período>`
  - `performanceObligationId = <PO_ID>`
- Entradas geradas apenas para períodos já decorridos

---

### ✅ 10. Invalidação de Caches React Query

**Cenário**: Verificar se caches são invalidados após salvar PO.

**Passos**:
1. Criar PO
2. Verificar se queries são invalidadas

**Resultado Esperado**:
- Queries invalidadas:
  - `["performance-obligations", tenantId, contractId]`
  - `["contract", tenantId, contractId]`
  - `["contracts", tenantId]`
  - `["billing-schedules", tenantId, contractId]` ✅ NOVO
  - `["ledger-entries", tenantId, contractId]` ✅ NOVO
- UI atualizada automaticamente sem necessidade de refresh manual

---

## 🧪 Como Executar os Testes

### Teste Manual (Recomendado)

1. **Acesse a aplicação**: http://localhost:5173 (ou URL de produção)
2. **Faça login** com credenciais válidas
3. **Siga os passos** de cada cenário acima
4. **Verifique os resultados** esperados

### Teste Automatizado (Futuro)

Criar testes E2E com Playwright seguindo a estrutura existente em `e2e/`:

```typescript
// e2e/po-validation.spec.ts
import { test, expect } from '@playwright/test';

test('PO validation: sum exceeds totalValue', async ({ page }) => {
  // Implementar teste
});

test('PO validation: point-in-time requires dueDate', async ({ page }) => {
  // Implementar teste
});

test('PO validation: over-time requires start/end/frequency', async ({ page }) => {
  // Implementar teste
});

test('Billing schedules: auto-generate for point-in-time', async ({ page }) => {
  // Implementar teste
});

test('Billing schedules: auto-generate for over-time', async ({ page }) => {
  // Implementar teste
});

test('Ledger entries: auto-generate for point-in-time invoiced', async ({ page }) => {
  // Implementar teste
});

test('Ledger entries: auto-generate for over-time invoiced', async ({ page }) => {
  // Implementar teste
});
```

---

## ✅ Checklist de Validação

- [x] Validação de soma ≤ totalValue implementada
- [x] Validação point-in-time exige dueDate implementada
- [x] Validação over-time exige start/end/frequency implementada
- [x] Validação endDate > startDate implementada
- [x] Geração automática de billing schedules (point-in-time) implementada
- [x] Geração automática de billing schedules (over-time) implementada
- [x] Geração automática de ledger entries (point-in-time invoiced) implementada
- [x] Geração automática de ledger entries (over-time invoiced) implementada
- [x] Geração automática de ledger entries (over-time monthly) implementada
- [x] Invalidação de caches React Query implementada
- [ ] Testes E2E automatizados criados
- [ ] Testes executados e validados

---

## 📝 Notas Importantes

1. **Validações no Frontend**: Implementadas usando Zod schema validation
2. **Geração de Billing Schedules**: Implementada no `createPOMutation` após criar a PO
3. **Geração de Ledger Entries**: Implementada via Cloud Functions triggers:
   - `onBillingInvoiced`: Gera receivable entry (diferente para point-in-time vs over-time)
   - `monthlyRevenueRecognition`: Gera revenue entries mensais para over-time POs
4. **Invalidação de Caches**: Implementada no `onSuccess` do `createPOMutation`

---

**Status**: ✅ **IMPLEMENTAÇÃO COMPLETA**

**Próximo Passo**: Executar testes manuais e criar testes E2E automatizados
