# Plano para Remoção do Card de "Pagamento"

## Análise das Referências Encontradas

Encontrei as seguintes referências ao termo "Pagamento" no código:

### 1. `/src/screens/NewQRCode/index.tsx`
- **Linha 90**: Definição do tipo no array de tipos de QR Code
- **Linha 133**: Estado `paymentData` para dados de pagamento
- **Linha 156-158**: Lógica de geração de conteúdo para QR de pagamento
- **Linha 172**: Validação que exclui payment da validação de conteúdo
- **Linha 188-189**: Validação específica para chave de pagamento
- **Linha 250**: Reset dos dados de pagamento
- **Linha 366-411**: Interface completa para entrada de dados de pagamento
- **Linha 369**: Título "Dados de Pagamento"

### 2. `/src/screens/MyQRCodes/index.tsx`
- **Linha 87**: Definição do tipo no mapeamento de tipos

### 3. `/src/services/database.ts`
- **Linha 108**: Tipo 'payment' na interface QRCodeData

## Tarefas para Remoção

### ✅ Tarefa 1: Analisar estrutura atual do código
- [x] Identificar todas as referências ao "Pagamento"
- [x] Mapear dependências e impactos

### ⏳ Tarefa 2: Remover tipo payment do array de tipos em NewQRCode
- [ ] Remover entrada `{ id: 'payment', label: 'Pagamento', icon: '💳' }` do array QR_TYPES

### ⏳ Tarefa 3: Remover estado e lógica de pagamento em NewQRCode
- [ ] Remover estado `paymentData` e função `setPaymentData`
- [ ] Remover case 'payment' da função `generateQRContent`
- [ ] Remover validação específica de payment da função `handleGenerate`
- [ ] Remover reset de paymentData da função `resetForm`
- [ ] Remover interface de entrada de dados de pagamento (case 'payment' no renderForm)

### ⏳ Tarefa 4: Remover tipo payment do mapeamento em MyQRCodes
- [ ] Remover entrada `'payment': { label: 'Pagamento', icon: '💳' }` do objeto typeLabels

### ⏳ Tarefa 5: Atualizar interface de tipos no database.ts
- [ ] Remover 'payment' da union type em qr_type

### ⏳ Tarefa 6: Teste da funcionalidade
- [ ] Verificar se a remoção não quebrou outras funcionalidades
- [ ] Confirmar que não há mais referências ao tipo payment

## Observações Importantes

- As mudanças são relativamente simples e isoladas
- Não há dependências complexas entre os componentes
- A remoção não deve afetar outros tipos de QR Code
- Todas as referências estão bem localizadas nos arquivos identificados

## Revisão
(Seção a ser preenchida após a conclusão das tarefas)