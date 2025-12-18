# Status da Extensão Stripe no Firebase

## ✅ Extensão Instalada e Ativa

**Data da Verificação**: 2025-12-17  
**Projeto**: `ifrs15-revenue-manager`

---

## 📋 Informações da Extensão

| Propriedade | Valor |
|-------------|-------|
| **Nome** | Run Payments with Stripe |
| **Publisher** | Stripe |
| **Instance ID** | `firestore-stripe-payments` |
| **Estado** | ✅ **ACTIVE** |
| **Versão** | `0.3.4` |
| **Última Atualização** | 2025-12-17 14:14:04 |

---

## 🔧 Cloud Functions Criadas pela Extensão

A extensão cria automaticamente as seguintes Cloud Functions:

### 1. **createCustomer**
- **Tipo**: Trigger (Firebase Auth - user.create)
- **Função**: Cria um objeto customer no Stripe quando um novo usuário se registra
- **Condição**: Se "Sync new users" estiver habilitado

### 2. **createCheckoutSession**
- **Tipo**: Callable Function
- **Função**: Cria uma sessão de checkout do Stripe para coletar dados de pagamento
- **Uso**: Chamada do frontend para iniciar processo de pagamento

### 3. **createPortalLink**
- **Tipo**: Callable Function
- **Função**: Cria links para o portal do cliente Stripe
- **Uso**: Permite que usuários gerenciem pagamentos e assinaturas

### 4. **handleWebhookEvents**
- **Tipo**: HTTP Function (webhook endpoint)
- **Função**: Processa eventos do Stripe para manter status de assinaturas sincronizados
- **Ações**: Atualiza custom claims do Firebase Auth e dados no Firestore

### 5. **onUserDeleted**
- **Tipo**: Trigger (Firebase Auth - user.delete)
- **Função**: Deleta o customer no Stripe e cancela todas as assinaturas quando usuário é deletado

### 6. **onCustomerDataDeleted**
- **Tipo**: Trigger (Firestore - document.delete)
- **Função**: Deleta o customer no Stripe quando o documento do customer é deletado no Firestore

---

## 📊 Configuração Atual (Estimada)

Com base na documentação da extensão, a configuração provavelmente inclui:

### Parâmetros de Configuração:

1. **Cloud Functions deployment location**
   - Provavelmente: `us-central1` (mesma região das outras functions)

2. **Products and pricing plans collection**
   - Caminho no Firestore onde planos de preço são armazenados
   - Provavelmente: `subscriptionPlans` ou similar

3. **Customer details and subscriptions collection**
   - Caminho no Firestore onde dados de customers são armazenados
   - Provavelmente: `tenants` (já que o projeto usa multi-tenancy)

4. **Stripe configuration collection**
   - Caminho para configurações do Stripe
   - Provavelmente: `stripeConfig` ou similar

5. **Sync new users to Stripe customers**
   - Opção: `Sync` ou `Do not sync`
   - Determina se cria customer automaticamente no registro

6. **Automatically delete Stripe customer objects**
   - Opção: `Auto delete` ou `Do not delete`
   - Determina se deleta customer quando usuário é removido

7. **Stripe API key with restricted access**
   - ✅ Configurado com chave de produção: `sk_live_51SbrHy...`
   - Deve ter permissões:
     - Write: Customers, Checkout Sessions, Customer portal
     - Read: Subscriptions, Prices

8. **Stripe webhook secret**
   - ⚠️ **VERIFICAR**: Deve estar configurado após instalação
   - Secret do webhook registrado no Stripe Dashboard
   - Formato: `whsec_...`

9. **Minimum instances for createCheckoutSession**
   - Valor sugerido: `0` ou `1`
   - Reduz cold starts (pode gerar custos)

---

## 🔗 Integração com o Código Existente

### ✅ Compatibilidade

O projeto **JÁ possui** implementação própria de Stripe em:
- `functions/src/stripe/checkout.ts` - Funções de checkout
- `functions/src/stripe/webhooks.ts` - Webhook handler customizado

### ⚠️ Possível Conflito

A extensão cria suas próprias functions que podem **sobrepor** ou **duplicar** funcionalidades:

| Função Custom | Função da Extensão | Status |
|--------------|-------------------|--------|
| `createCheckoutSession` | `createCheckoutSession` | ⚠️ **CONFLITO** |
| `createPortalSession` | `createPortalLink` | ⚠️ **DUPLICADO** |
| `stripeWebhook` | `handleWebhookEvents` | ⚠️ **DUPLICADO** |

### 🔄 Recomendações

#### Opção 1: Usar Apenas a Extensão (Recomendado)
- ✅ Remove código customizado de Stripe
- ✅ Usa SDK oficial da extensão: `@stripe/firestore-stripe-payments`
- ✅ Mantém sincronização automática com Firestore
- ✅ Custom claims automáticos no Firebase Auth

#### Opção 2: Manter Código Customizado
- ⚠️ Renomear functions customizadas para evitar conflito
- ⚠️ Desabilitar functions duplicadas da extensão (se possível)
- ⚠️ Manter sincronização manual entre Stripe e Firestore

---

## 🔍 Verificações Necessárias

### 1. Verificar Configuração Completa

Execute no terminal:
```bash
cd "c:\Projetos\IFRS 15\Project-Pathfinder\Projeto IFRS 15"
firebase ext:configure firestore-stripe-payments
```

Isso mostrará os parâmetros configurados e permitirá ajustes.

### 2. Verificar Webhook Secret

```bash
# Verificar se está configurado
firebase functions:config:get

# Ou verificar secrets
firebase functions:secrets:access STRIPE_WEBHOOK_SECRET
```

### 3. Verificar Webhook no Stripe Dashboard

1. Acesse: https://dashboard.stripe.com/webhooks
2. Verifique se há webhook configurado para:
   - **URL**: `https://us-central1-ifrs15-revenue-manager.cloudfunctions.net/ext-firestore-stripe-payments-handleWebhookEvents`
   - **Eventos**: Todos os eventos de subscription e checkout

### 4. Verificar Collections no Firestore

Verifique se as collections estão configuradas corretamente:
- Products/pricing plans collection
- Customers collection
- Stripe configuration collection

---

## 📦 SDK do Cliente

A extensão recomenda usar o SDK oficial:

```bash
npm install @stripe/firestore-stripe-payments
```

**Uso no código**:
```typescript
import { getStripePayments } from '@stripe/firestore-stripe-payments';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const payments = getStripePayments(getAuth(), getFirestore());
```

---

## 🔐 Permissões IAM

A extensão requer:
- ✅ `firebaseauth.admin` - Para definir custom claims
- ✅ `datastore.user` - Para ler/escrever no Firestore

Essas permissões são **automaticamente concedidas** durante a instalação.

---

## 💰 Custos

A extensão usa:
- **Cloud Firestore** - Armazenamento de dados
- **Cloud Functions** - Execução das functions
- **Cloud Secret Manager** - Armazenamento seguro de chaves
- **Firebase Authentication** - Custom claims
- **Eventarc** (se eventos habilitados) - Eventos customizados

**Stripe**:
- Taxas de transação do Stripe (2.9% + R$0,40 por transação no Brasil)
- Taxas de assinatura (se usar subscriptions)

---

## ✅ Checklist de Verificação

- [x] Extensão instalada e ativa
- [ ] Configuração verificada (`firebase ext:configure`)
- [ ] Webhook secret configurado
- [ ] Webhook registrado no Stripe Dashboard
- [ ] Collections do Firestore verificadas
- [ ] Conflitos com código customizado resolvidos
- [ ] SDK do cliente instalado (se necessário)
- [ ] Testes realizados (checkout, portal, webhooks)

---

## 📞 Próximos Passos

1. **Verificar configuração completa**:
   ```bash
   firebase ext:configure firestore-stripe-payments
   ```

2. **Configurar webhook no Stripe** (se ainda não feito):
   - URL: `https://us-central1-ifrs15-revenue-manager.cloudfunctions.net/ext-firestore-stripe-payments-handleWebhookEvents`
   - Copiar Signing Secret
   - Configurar: `firebase ext:configure firestore-stripe-payments`

3. **Decidir sobre código customizado**:
   - Remover código duplicado OU
   - Renomear functions para evitar conflito

4. **Instalar SDK do cliente** (opcional):
   ```bash
   npm install @stripe/firestore-stripe-payments
   ```

5. **Testar integração**:
   - Criar checkout session
   - Processar pagamento
   - Verificar sincronização no Firestore
   - Verificar custom claims no Firebase Auth

---

## 📚 Documentação

- **Extensão**: https://github.com/stripe/stripe-firebase-extensions/tree/next/firestore-stripe-payments
- **SDK Cliente**: https://github.com/stripe/stripe-firebase-extensions/blob/next/firestore-stripe-web-sdk/README.md
- **Stripe Dashboard**: https://dashboard.stripe.com
- **Firebase Console**: https://console.firebase.google.com/project/ifrs15-revenue-manager/extensions

---

**Última atualização**: 2025-12-17
