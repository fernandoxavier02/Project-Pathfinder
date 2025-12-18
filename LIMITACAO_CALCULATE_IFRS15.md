# ⚠️ Limitação Conhecida: calculateIFRS15All

## 📌 Resumo

A função `calculateIFRS15All` atualmente cria **entries iniciais simplificados** baseados no `totalValue` do contrato, mas **NÃO executa o motor IFRS 15 completo**.

---

## 🔍 O Que Funciona

✅ **Entries Iniciais Criados**
- Entry de Deferred Revenue para cada contrato
- Valor baseado em `contract.totalValue`
- Ref: `V2-INITIAL-DEF-{contractId}`

✅ **Ledger V2 Baseado em Eventos**
- Entries de AR quando billing marcado como "invoiced"
- Entries de Cash quando billing marcado como "paid"
- Entries de Revenue quando PO marcada como "satisfied"

---

## ❌ O Que NÃO Funciona

A função `calculateIFRS15All` **não executa**:

❌ **Step 2: Identify Performance Obligations**
- Não cria POs automaticamente
- Não analisa `isDistinct` ou `distinctWithinContext`

❌ **Step 3: Determine Transaction Price**
- Usa `contract.totalValue` direto
- Não considera variable considerations
- Não calcula significant financing components

❌ **Step 4: Allocate Transaction Price**
- Não faz alocação por standalone selling price
- Não calcula relative standalone selling price

❌ **Step 5: Recognize Revenue**
- Não cria revenue schedules
- Não calcula percentComplete
- Não reconhece receita over-time automaticamente

---

## 🛠️ Por Que Essa Limitação?

### Problema Técnico:

`runIFRS15Engine` é uma **Cloud Function exportada** (callable):

```typescript
export const runIFRS15Engine = functions.https.onCall(async (data, context) => {
  // ...
});
```

Cloud Functions **não podem chamar outras Cloud Functions diretamente** no mesmo projeto. Precisariam usar `httpsCallable` (apenas do client) ou HTTP requests.

### Tentativa de Solução (Bloqueada):

```typescript
// ❌ ISTO NÃO FUNCIONA:
const engineResult = await runIFRS15Engine({
  contractId: contract.id,
  versionId: contract.currentVersionId,
});

// Erro: runIFRS15Engine não é uma função, é uma Cloud Function exportada
```

---

## ✅ Workaround Atual

Para obter cálculos IFRS 15 completos, use **um dos métodos abaixo**:

### Método 1: UI do Accounting Reconciliation (Recomendado)

1. Vá para **Accounting Reconciliation**
2. Clique em **"Calcular IFRS 15 (Gerar Ledger)"**
3. Isso executa `maintenanceService.fixContractVersions()` seguido do Engine

📁 **Código:** `client/src/pages/accounting-reconciliation.tsx:100-151`

```typescript
const recalcAllMutation = useMutation({
  mutationFn: async () => {
    if (!tenantId) throw new Error("No tenant ID");

    // 1. Fix contract versions
    await maintenanceService.fixContractVersions();

    // 2. Run IFRS 15 Engine para cada contrato
    const allContracts = await contractService.getAll(tenantId);
    for (const contract of allContracts) {
      await ifrs15Service.runEngine(contract.id, contract.currentVersionId);
    }
  },
});
```

### Método 2: Chamar runEngine Individualmente

Para cada contrato:

```typescript
// No frontend ou via API
await ifrs15Service.runEngine(contractId, versionId);
```

### Método 3: Script de Manutenção

Criar um script que chama `runIFRS15Engine` via HTTP para cada contrato:

```typescript
import { httpsCallable } from "firebase/functions";

const runEngine = httpsCallable(functions, "runIFRS15Engine");

for (const contract of contracts) {
  await runEngine({
    contractId: contract.id,
    versionId: contract.currentVersionId
  });
}
```

---

## 🔄 Soluções Futuras Possíveis

### Opção A: Refatorar Engine (Melhor solução)

Extrair a lógica do Engine para uma função compartilhada:

```typescript
// engine.ts
export async function calculateIFRS15(params: {
  contractId: string;
  versionId?: string;
  tenantId: string;
}): Promise<IFRS15Result> {
  // Toda a lógica de cálculo aqui
}

// Cloud Function apenas chama a função acima:
export const runIFRS15Engine = functions.https.onCall(async (data, context) => {
  return await calculateIFRS15({
    contractId: data.contractId,
    versionId: data.versionId,
    tenantId: context.auth.token.tenantId,
  });
});

// calculateIFRS15All também pode chamar:
for (const contract of contracts) {
  const result = await calculateIFRS15({
    contractId: contract.id,
    versionId: contract.currentVersionId,
    tenantId,
  });
}
```

**Vantagem:** Código reutilizável, DRY principle
**Desvantagem:** Refactoring grande (~500 linhas)

### Opção B: Usar Task Queue

Usar Cloud Tasks para chamar `runIFRS15Engine` de forma assíncrona:

```typescript
import { CloudTasksClient } from "@google-cloud/tasks";

const tasksClient = new CloudTasksClient();

for (const contract of contracts) {
  await tasksClient.createTask({
    parent: queuePath,
    task: {
      httpRequest: {
        url: `https://${region}-${projectId}.cloudfunctions.net/runIFRS15Engine`,
        body: Buffer.from(JSON.stringify({ contractId: contract.id })),
      },
    },
  });
}
```

**Vantagem:** Não requer refactoring
**Desvantagem:** Mais complexo, requer configuração de Cloud Tasks

### Opção C: Aceitar Limitação (Atual)

Manter `calculateIFRS15All` como está:
- Cria entries iniciais simples
- Usuário executa Engine completo via UI quando necessário

**Vantagem:** Solução funcional, sem complexity
**Desvantagem:** Não é "um clique" completo

---

## 📝 Recomendação Final

**Para uso imediato:**
- Use o botão "Calcular IFRS 15 (Gerar Ledger)" no Accounting Reconciliation
- Isso já está funcionando e executa o Engine completo

**Para futuro:**
- Implemente Opção A (refactoring) quando houver tempo
- Isso permitirá que `calculateIFRS15All` execute cálculos completos

---

## 🔗 Arquivos Relacionados

- `functions/src/maintenance/calculate-ifrs15-all.ts` - Versão simplificada atual
- `functions/src/ifrs15/engine.ts` - Motor IFRS 15 completo
- `client/src/pages/accounting-reconciliation.tsx` - UI com Engine completo
- `functions/src/ifrs15/initial-ledger-entries.ts` - Gerador de entries iniciais

---

**Status:** 🟡 Funcional com limitações conhecidas
**Data:** 2025-12-17
