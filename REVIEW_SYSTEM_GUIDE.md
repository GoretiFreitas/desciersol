# 🎓 Sistema de Revisão e Badges SBT - Guia Completo

## ✅ **Sistema Implementado!**

O DeSci Reviews agora possui um sistema completo de peer review com badges SBT para revisores!

---

## 🎯 **Funcionalidades**

### **1. Review de Papers**
- ⭐ Rating de 1-5 estrelas
- 📝 Comentário detalhado (mín. 50 caracteres)
- 💪 Strengths (opcional)
- ⚠️ Weaknesses (opcional)
- ✅ Recomendação: Accept, Minor Revision, Major Revision, Reject

### **2. Sistema de Badges (5 Níveis)**
- 🥉 **Level 1 - Novice Reviewer:** 1-5 reviews
- 🥈 **Level 2 - Contributor:** 6-15 reviews
- 🥇 **Level 3 - Expert Reviewer:** 16-30 reviews
- ⭐ **Level 4 - Master Reviewer:** 31-50 reviews
- 👑 **Level 5 - Legend:** 51+ reviews

### **3. Reviewer Dashboard**
- 📊 Estatísticas de reviews
- 🏆 Badge atual e progressão
- 📜 Histórico de reviews
- 🎁 Claim de badges quando elegível

---

## 🚀 **Como Usar**

### **Passo 1: Mintar um Paper (se ainda não fez)**

1. Ir para: http://localhost:3000/research/submit
2. Upload PDF e preencher metadados
3. Mintar como NFT
4. Aguardar confirmação

### **Passo 2: Browse e Review**

1. **Ir para:** http://localhost:3000/research/browse
2. **Ver papers** com review count e rating médio
3. **Clicar** em "View Details" em qualquer paper
4. **Na página de detalhes:**
   - Ver PDF, metadata, tags
   - Ver reviews existentes
   - Clicar em "Write a Review"

### **Passo 3: Submeter Review**

1. **Rating:** Clicar nas estrelas (1-5)
2. **Recommendation:** Selecionar uma opção
3. **Comment:** Escrever pelo menos 50 caracteres
4. **Strengths/Weaknesses:** Opcional mas recomendado
5. **Clicar:** "Submit Review"
6. **Aguardar:** Confirmação (~1 segundo)

### **Passo 4: Ver Seu Dashboard**

1. **Ir para:** http://localhost:3000/reviewer/dashboard
2. **Ver:**
   - Total de reviews
   - Badge atual
   - Progressão para próximo nível
   - Histórico de reviews

### **Passo 5: Claim Badge**

1. **Submeter reviews** (mínimo 1 para primeiro badge)
2. **Ir para Dashboard**
3. **Ver notificação:** "New Badge Available!"
4. **Clicar:** "Claim Badge"
5. **Badge emitido!** (simulado por enquanto)

---

## 📊 **Estrutura do Sistema**

### **Backend (APIs)**

| Endpoint | Método | Função |
|----------|--------|--------|
| `/api/review/submit` | POST | Submeter review |
| `/api/review/[paperId]` | GET | Buscar reviews de um paper |
| `/api/reviewer/[wallet]` | GET | Stats do revisor |
| `/api/badge/issue` | POST | Emitir badge SBT |

### **Frontend (Páginas)**

| Rota | Descrição |
|------|-----------|
| `/research/browse` | Lista de papers com review stats |
| `/research/paper/[address]` | Detalhes do paper + reviews |
| `/reviewer/dashboard` | Dashboard do revisor |

### **Componentes**

- **ReviewForm** - Formulário de review
- **ReviewCard** - Exibição de review individual
- **BadgeDisplay** - Mostrar badge do revisor
- **PaperCard** - Card com review count/rating

---

## 🧪 **Fluxo de Teste Completo**

### **Teste 1: Primeira Review**

1. Conectar wallet
2. Browse papers
3. Abrir paper detail
4. Submeter review
5. Ver review aparecer na lista
6. Ir para Dashboard
7. Ver: 1 review, elegível para Level 1
8. Claim badge
9. Ver badge no dashboard

### **Teste 2: Multiple Reviews**

1. Usar mesma wallet ou outra
2. Revisar 5 papers diferentes
3. Verificar progressão no dashboard
4. Claim badge Level 1 (1-5 reviews)
5. Revisar mais 1 paper
6. Ver elegibilidade para Level 2

### **Teste 3: Badge Display**

1. Revisor com badge submete review
2. Ver badge aparecendo no ReviewCard
3. Badge mostra nível e cor correta

---

## 💾 **Storage (Testnet)**

### **Arquivo: `frontend/data/reviews.json`**

Estrutura:
```json
{
  "reviews": [
    {
      "id": "review_xxx",
      "paperId": "NFT_address",
      "paperTitle": "Paper Title",
      "reviewerWallet": "wallet_address",
      "rating": 5,
      "comment": "Great paper!",
      "recommendation": "accept",
      "timestamp": 1234567890
    }
  ],
  "reviewerStats": {
    "wallet_address": {
      "wallet": "wallet_address",
      "totalReviews": 1,
      "badgeLevel": 1,
      "specialties": [],
      "joinedAt": 1234567890
    }
  }
}
```

**Nota:** Este arquivo é local (git-ignored). Em produção, usar database real.

---

## 🔧 **Validações**

### **Review Validation**
- ✅ Rating: 1-5 (obrigatório)
- ✅ Comment: mínimo 50 caracteres, máximo 2000
- ✅ Recommendation: accept, minor-revision, major-revision, reject
- ✅ Não pode revisar o mesmo paper duas vezes

### **Badge Validation**
- ✅ Badge só é emitido quando atingir o nível
- ✅ Não pode claim mesmo badge duas vezes
- ✅ Level calculado automaticamente

---

## 🎨 **UI Features**

### **Paper Card (Browse)**
- Review count badge (ex: "3 reviews")
- Rating médio com estrela (ex: "4.5 ⭐")
- Link "View Details" para página completa

### **Paper Detail Page**
- Metadata completa do paper
- Link para PDF no Arweave
- Link para Solana Explorer
- Lista de todas as reviews
- Review form (se conectado)
- Stats: total reviews, rating médio

### **Review Card**
- Reviewer wallet (truncado)
- Badge do revisor (se tiver)
- Rating visual (estrelas)
- Recommendation badge colorido
- Comment completo
- Strengths/Weaknesses (se fornecido)
- Timestamp

### **Reviewer Dashboard**
- Total de reviews
- Badge atual com visual
- Próximo badge e progresso
- Progression bar visual
- Histórico de reviews (últimas 5)
- Botão "Claim Badge" (quando elegível)

---

## 🔜 **Migração para Produção**

### **Em Produção, Substituir:**

1. **Storage:** `reviews.json` → Database (Supabase/MongoDB)
2. **Badge Mint:** Simulado → Token-2022 SBT real
3. **Validation:** Client-side → Server-side mais robusto
4. **Rate Limiting:** Memory → Redis/Vercel KV

### **Manter:**
- ✅ UI/UX completo
- ✅ Hooks e componentes
- ✅ Fluxo de usuário
- ✅ APIs (atualizar storage backend)

---

## 📝 **Exemplo de Uso**

### **Revisor Típico:**

```
Day 1: Review 5 papers → Claim Badge Level 1 (Novice) 🥉
Week 1: 10 reviews total → Claim Badge Level 2 (Contributor) 🥈
Month 1: 20 reviews total → Claim Badge Level 3 (Expert) 🥇
Month 3: 40 reviews total → Claim Badge Level 4 (Master) ⭐
Year 1: 60+ reviews → Claim Badge Level 5 (Legend) 👑
```

### **Paper Author:**

```
1. Submit paper as NFT
2. Share with community
3. Receive reviews from community
4. See ratings and recommendations
5. Improve based on feedback
6. Update paper (new version/NFT)
```

---

## 🐛 **Troubleshooting**

### **Review não aparece**
- Recarregar página (Cmd+R)
- Verificar console para erros
- Verificar se `reviews.json` existe

### **Badge não pode claim**
- Verificar total de reviews no dashboard
- Verificar se já tem o badge deste nível
- Ver console para erros

### **Dashboard não carrega**
- Verificar se wallet está conectada
- Recarregar página
- Ver console (F12) para erros

---

## 🎉 **Teste Agora!**

**O sistema está completo e funcionando!**

1. ✅ **Servidor rodando:** http://localhost:3000
2. ✅ **Review system:** Pronto
3. ✅ **Badge system:** Funcionando
4. ✅ **Dashboard:** Ativo

**Acesse e teste:**
- Browse: http://localhost:3000/research/browse
- Dashboard: http://localhost:3000/reviewer/dashboard
- Qualquer paper detail: Click em "View Details"

---

**Desenvolvido com ❤️ para a comunidade científica DeSci!** 🔬🚀
