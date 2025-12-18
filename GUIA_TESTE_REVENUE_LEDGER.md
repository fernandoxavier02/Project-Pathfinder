# 🧪 Guia de Teste - Revenue Ledger

**Data:** 2025-12-18
**Status:** Função deployada, aguardando execução

---

## ⚠️ IMPORTANTE

Os logs do console mostram:
```
[revenueLedgerService.getAll] Entries encontrados: 0 []
```

**Nenhum ledger entry existe no Firestore ainda!**

Os entries só são criados quando você **EXECUTA** o Engine IFRS 15. Vamos fazer isso agora.

---

## 📋 Passo a Passo para Gerar Entries

### Opção 1: Via Accounting Reconciliation (RECOMENDADO)

Esta opção executa o **Engine IFRS 15 COMPLETO** com todos os cálculos.

1. **Abra a página Accounting Reconciliation**
   - URL: `/accounting-reconciliation`

2. **Clique no botão "Calcular IFRS 15 (Gerar Ledger)"**
   - Este botão executa:
     - `maintenanceService.fixContractVersions()`
     - `ifrs15Service.runEngine()` para cada contrato

3. **Aguarde a mensagem de sucesso**
   - Deve aparecer um toast: "IFRS 15 calculado com sucesso"

4. **Recarregue a página**
   - Os entries devem aparecer nas tabelas

---

### Opção 2: Via Revenue Ledger (SIMPLIFICADO)

Esta opção cria apenas **entries iniciais** baseados no `contract.totalValue`.

⚠️ **LIMITAÇÃO:** Não executa allocations, schedules ou cálculos completos IFRS 15.

1. **Abra a página Revenue Ledger**
   - URL: `/revenue-ledger`

2. **Clique no botão "Generate Initial Entries"**
   - Este botão chama `calculateIFRS15All()`
   - Cria apenas entry de Deferred Revenue inicial

3. **Aguarde a mensagem de sucesso**
   - Deve aparecer um toast com estatísticas

4. **Recarregue a página**
   - Os entries devem aparecer na tabela

---

### Opção 3: Via Firebase Functions (Manual)

Se os botões não funcionarem, você pode chamar as functions diretamente:

1. **Abra o Firebase Console**
   - https://console.firebase.google.com/project/ifrs15-revenue-manager/functions

2. **Encontre a função `runIFRS15Engine`**

3. **Clique em "TESTER"**

4. **Cole este JSON:**
   ```json
   {
     "contractId": "qxMIMr1AHb7WzAjkSuuL",
     "versionId": "AZALPaKkN0hHcWnm7fyA"
   }
   ```

   Ou para o contrato 25:
   ```json
   {
     "contractId": "2PvrSftASyjqf1BMPUus",
     "versionId": "ucBviISl2SMzZX2om54s"
   }
   ```

5. **Clique em "EXECUTE"**

6. **Veja os logs:**
   - Deve mostrar: "IFRS 15 calculation completed successfully"

7. **Repita para cada contrato:**
   - Contrato 24: `j8v8KnABpvHV1HbNsurs` / `VmorrqQj05kloxkUkAtM`
   - Contrato 25: `2PvrSftASyjqf1BMPUus` / `ucBviISl2SMzZX2om54s`
   - Contrato 26: `qxMIMr1AHb7WzAjkSuuL` / `AZALPaKkN0hHcWnm7fyA`

---

## 🔍 Como Verificar se Funcionou

### 1. Firestore Console

1. **Abra o Firestore:**
   - https://console.firebase.google.com/project/ifrs15-revenue-manager/firestore

2. **Navegue até:**
   - `tenants` → `default` → `revenueLedgerEntries`

3. **Deve ver entries como:**
   ```
   V2-INITIAL-DEF-{contractId}-{timestamp}
   V2-AR-{billingId}
   V2-CASH-{billingId}
   V2-REV-{poId}
   ```

### 2. Frontend - Revenue Ledger

1. **Abra:** `/revenue-ledger`

2. **Deve ver:**
   - Tabela com entries
   - Colunas: Date, Type, Contract, Amount, Status
   - Filtros funcionando

### 3. Frontend - Accounting Reconciliation

1. **Abra:** `/accounting-reconciliation`

2. **Deve ver:**
   - Cards com totais (Contract Assets, Liabilities, etc)
   - Tabela "Reconciliação por conta"
   - Tabela "Razão do mês"

---

## 🐛 Troubleshooting

### Erro: "No tenant ID"

**Causa:** Usuário não autenticado ou sem tenantId no token

**Solução:**
1. Faça logout e login novamente
2. Verifique no console: `firebase.auth().currentUser`
3. Verifique custom claims: `await user.getIdTokenResult()`

---

### Erro: "Contract not found"

**Causa:** contractId ou versionId inválido

**Solução:**
1. Verifique se o contrato existe no Firestore
2. Verifique se `currentVersionId` está preenchido
3. Use a função `fixContractVersions()` se necessário

---

### Erro: "Transaction price is 0"

**Causa:** Contrato sem line items ou sem valor

**Solução:**
1. Adicione line items ao contrato
2. Certifique-se que `totalValue` > 0
3. Marque line items como `isDistinct: true`

---

### Entries não aparecem após executar

**Verificações:**

1. **Console do navegador (F12):**
   ```
   [revenueLedgerService.getAll] Entries encontrados: X
   ```
   - Se X > 0: problema de UI/filtros
   - Se X = 0: entries não foram criados

2. **Firebase Functions Logs:**
   ```bash
   firebase functions:log --only runIFRS15Engine
   ```
   - Procure por: "✅ Entry criado"
   - Procure por erros

3. **Firestore Security Rules:**
   - Verifique se o usuário tem permissão de leitura
   - Path: `tenants/{tenantId}/revenueLedgerEntries`

---

## 📊 Dados de Teste Disponíveis

Você já tem 3 contratos criados:

| ID | Número | Total | Status | Version |
|----|--------|-------|--------|---------|
| `qxMIMr1AHb7WzAjkSuuL` | 26 | R$ 12.000 | active | `AZALPaKkN0hHcWnm7fyA` |
| `2PvrSftASyjqf1BMPUus` | 25 | R$ 15.000 | active | `ucBviISl2SMzZX2om54s` |
| `j8v8KnABpvHV1HbNsurs` | 24 | R$ 10.000 | active | `VmorrqQj05kloxkUkAtM` |

Todos têm:
- ✅ Performance Obligations criadas
- ✅ Billing Schedules gerados
- ✅ Alguns billings marcados como PAID

**Perfeito para teste!**

---

## ✅ Próximo Passo

**EXECUTE AGORA:**

1. Vá para **Accounting Reconciliation**
2. Clique em **"Calcular IFRS 15 (Gerar Ledger)"**
3. Aguarde 5-10 segundos
4. **Recarregue a página**
5. Verifique se os cards mostram valores
6. Verifique se as tabelas mostram entries

Se ainda não funcionar, envie:
- Screenshot do toast de sucesso/erro
- Logs do console após clicar no botão
- Logs do Firebase Functions

---

**Criado em:** 2025-12-18 00:45 UTC-3
