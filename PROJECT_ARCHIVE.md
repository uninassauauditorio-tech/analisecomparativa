# Arquivo de Projeto: Olinda InsightFlow

Este documento serve como a "memória" técnica e funcional do projeto Olinda InsightFlow (UNINASSAU). Ele resume a arquitetura, as funcionalidades principais e todas as decisões técnicas tomadas até fevereiro de 2026.

## 🏗️ Arquitetura Técnica

- **Frontend:** React + Vite + TypeScript.
- **Estilização:** TailwindCSS + Shadcn UI (Visual Premium/Dark Mode).
- **Banco de Dados:** Supabase (PostgreSQL).
- **Autenticação:** Clerk (Integrado com perfis no Supabase).
- **Backend (Serverless):** Migrado de Python (FastAPI) para **SQL Puro (RPC)** e **Local Processing (JS/XLSX)**.
  - *Motivo:* Eliminar limites de tamanho da Vercel (250MB) e aumentar a velocidade de processamento.
- **Deploy:** Vercel (Zero Config).

## 📊 Funcionalidades Principais

### 1. Sistema de Importação "Limpa e Insere"
- Processamento de planilhas Excel pesadas (até 75k+ linhas) diretamente no navegador.
- Substituição total dos dados da unidade selecionada para evitar duplicidade.
- Normalização inteligente de colunas (RA, ALUNO, DTMATRICULA, etc.).

### 2. Análise Temporal (YoY - Year over Year)
- Função SQL `get_temporal_comparison_v3` calcula a produção diária comparando o dia atual com o mesmo dia nos últimos 3 anos.
- Exibição de crescimento percentual em tempo real.

### 3. Dashboard Inteligente
- **KPIs Dinâmicos:** Total de Alunos, Crescimento YoY, Captação e Evasão Total.
- **Gráficos:** Evolução Semestral, Comparativo Anual, Distribuição por Turno/Curso/Período.
- **Filtros Avançados:** Por modalidade (Presencial/EAD), Status, Curso e Turno.
- **Insights:** Geração automática de textos explicativos baseados nos dados filtrados.

### 4. Gestão de Evasão
- Cálculo abrangente que inclui: Cancelamentos, Trancamentos, Abandono/Desistência, Transferências Externas/Internas e EAD.

## 🔐 Segurança e Níveis de Acesso

- **Restrição de Unidades:**
  - **Admin:** Visualiza e filtra todas as unidades cadastradas.
  - **Usuário/Diretor:** O sistema foca automaticamente na sua unidade vinculada, restringindo os filtros de unidades apenas ao que lhe é permitido.
- **Identificação:** Todos os gráficos e tabelas incluem o nome da unidade no título para facilitar exports e prints seguros.

## 🛠️ Notas para Futuras Implementações
- **Multi-unidade:** A estrutura já suporta `unidades_ids` (array) para usuários regionais que cuidam de mais de uma filial.
- **Metas:** Existe uma estrutura pronta para vinculação de metas de captação por curso.
- **Performance:** O processamento local (Frontend) provou ser mais estável que o processamento em Python para este volume de dados na Vercel.

---
*Atualizado em: 01/02/2026*
