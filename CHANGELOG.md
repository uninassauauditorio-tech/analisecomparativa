# 📓 Cadastro de Mudanças e Evolução do Sistema - Olinda InsightFlow

Este documento registra as principais atualizações, correções e novas funcionalidades implementadas no sistema para garantir a transparência e facilitar manutenções futuras.

---

## 🚀 Versão Atual: Sistema de Acesso Universal e Gestão de Unidades

### 1. Autenticação e Segurança (Migração Clerk)
- **Migração Clerk Auth:** Substituído o Supabase Auth pelo Clerk para uma autenticação mais robusta e moderna.
- **Sincronização Inteligente (Upsert):** Implementado o `AuthContext.tsx` que sincroniza automaticamente os dados do Clerk (Nome, Email, ID) com a tabela `profiles` do Supabase no momento do login.
- **Remoção de RLS Restritivo:** As políticas de Row Level Security (RLS) foram ajustadas (e em alguns casos desativadas) para permitir que o Dashboard carregue dados via Clerk sem erros de permissão.

### 2. Acesso Universal e Navegação
- **Fim das Restrições:** Removida a lógica de "Acesso Restrito". Agora todos os usuários logados têm acesso visual a todas as unidades cadastradas.
- **Dashboard Direto:** Eliminada a tela de "Boas-vindas". O sistema agora entra diretamente no Dashboard da unidade padrão.
- **Unidade Padrão Fixada:** Configurado o sistema para iniciar automaticamente na unidade **"UNINASSAU OLINDA"** (ID: `2caba488-fb2f-430c-a774-c016afff04f2`), onde residem os mais de 75.000 registros históricos.

### 3. Gestão de Unidades (Nova Funcionalidade)
- **Cadastro de Unidades:** Adicionado o componente `AddUnitDialog.tsx` e um botão de **"+"** no Header. 
- **Flexibilidade:** Agora o administrador pode cadastrar novas filiais/unidades (ex: Paulista, Recife) diretamente pela interface, preparando o sistema para novos dados.

### 4. Fluxo de Importação "Limpa e Insere" (Modo Espelho)
- **Importação Centralizada:** Novo modal de importação que exige a seleção da **Unidade de Destino** antes do upload.
- **Motor Python (Backend):** Atualizado o endpoint `/import-excel/{unidade_id}` para realizar a limpeza total dos dados da unidade antes de inserir os novos. Isso garante que a base de dados no Dashboard seja um espelho exato da última planilha enviada.
- **Processamento em Lote:** Otimização no backend para lidar com arquivos pesados sem travar a interface.

### 5. Interface e Experiência do Usuário (UI/UX)
- **Estado Visual "Sem Dados":** Implementada uma tela informativa para unidades recém-criadas que ainda não possuem registros, convidando o usuário a realizar a primeira importação.
- **Seletor de Unidades Global:** O dropdown no Header agora lista dinamicamente todas as unidades do banco de dados em ordem alfabética.
- **Sincronização Visual:** Adicionados loaders (LoadingSpinner) para feedbacks claros durante a sincronização de perfis e carregamento de gráficos.

---

## 🛠️ Detalhes Técnicos dos Arquivos Modificados
- `AuthContext.tsx`: Núcleo da lógica de login, sincronização de perfil e definição de unidade padrão.
- `Header.tsx`: Inclusão dos controles de unidade (Seletor, Cadastro e Importação).
- `Index.tsx`: Lógica de renderização imediata do Dashboard e filtros globais.
- `main.py` (Backend): Lógica de "Limpa e Insere" por Unidade ID.
- `AddUnitDialog.tsx`: Modal para inserção de novas unidades no banco.
- `ImportDialog.tsx`: Modal para upload forçado por unidade.

---

**Última atualização:** 01 de Fevereiro de 2026
**Responsável:** Antigravity AI (Pair Programming com o Usuário)
