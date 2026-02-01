import os
import io
import pandas as pd
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import httpx
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

import logging

# Configura logging para console (Vercel logs)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

app = FastAPI(title="Motor de Processamento Olinda InsightFlow", root_path="/api")

# Exporta o app para a Vercel
main = app

# Configuração de CORS para permitir que o frontend acesso este servidor
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Em produção, especifique o domínio do seu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "online", "message": "Motor Python rodando com sucesso."}

@app.post("/api/import-excel/{unidade_id}")
async def import_excel(unidade_id: str, file: UploadFile = File(...), background_tasks: BackgroundTasks = BackgroundTasks()):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Por favor, envie um arquivo Excel válido (.xlsx ou .xls).")
    
    contents = await file.read()
    logging.info(f"Arquivo '{file.filename}' recebido para a unidade {unidade_id}. Iniciando background task.")
    background_tasks.add_task(process_heavy_excel, contents, unidade_id)
    
    return {
        "status": "success", 
        "message": f"Arquivo '{file.filename}' recebido. A base de dados será atualizada para a unidade {unidade_id}."
    }

async def process_heavy_excel(file_contents: bytes, unidade_id: str):
    try:
        # 1. Carregamento com Pandas
        df = pd.read_excel(io.BytesIO(file_contents), engine='openpyxl')
        df.columns = [c.upper().strip() for c in df.columns]
        
        total_rows_excel = len(df)
        logging.info(f"Lido Excel: {total_rows_excel} linhas detectadas.")

        # 2. Configurações de API Supabase
        headers = {
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "Content-Type": "application/json"
        }
        
        # 3. Tratamento de Datas (Normalização Global)
        if 'DTMATRICULA' in df.columns:
            # Converte a coluna para datetime, tratando erros e forçando o formato
            # Se for número de série do Excel, o Pandas geralmente já resolve no read_excel
            df['DTMATRICULA_CLEAN'] = pd.to_datetime(df['DTMATRICULA'], errors='coerce', dayfirst=True)
            # Remove horas (normaliza para 00:00:00)
            df['DTMATRICULA_CLEAN'] = df['DTMATRICULA_CLEAN'].dt.normalize()

        # 4. MODO ESPELHO: Deletamos a base antiga da unidade e inserimos a nova exatamente como veio
        delete_url = f"{SUPABASE_URL}/rest/v1/alunos_registros?unidade_id=eq.{unidade_id}"
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            # Limpeza
            del_resp = await client.delete(delete_url, headers=headers)
            logging.info(f"Limpeza de base antiga ({unidade_id}): {del_resp.status_code}")

            # Preparação de registros
            records = []
            for _, row in df.iterrows():
                def clean(val):
                    if pd.isna(val): return ""
                    return str(val).strip()

                ra = clean(row.get('RA', ''))
                semestre = clean(row.get('SEMESTRE', ''))
                
                if not ra or not semestre:
                    continue

                # Formata a data para DD/MM/YYYY (sem horas) para o DB
                dt_formatted = ""
                if 'DTMATRICULA_CLEAN' in df.columns and pd.notna(row['DTMATRICULA_CLEAN']):
                    dt_formatted = row['DTMATRICULA_CLEAN'].strftime('%d/%m/%Y')
                elif pd.notna(row.get('DTMATRICULA')): # Fallback manual se a conversão em lote falhou por algum motivo
                    try:
                        dt_raw = row.get('DTMATRICULA')
                        dt_dt = pd.to_datetime(dt_raw, errors='coerce', dayfirst=True)
                        if pd.notna(dt_dt):
                            dt_formatted = dt_dt.strftime('%d/%m/%Y')
                    except:
                        pass

                record = {
                    "unidade_id": unidade_id,
                    "ra": ra,
                    "semestre": semestre,
                    "aluno": clean(row.get('ALUNO', '')),
                    "curso": clean(row.get('CURSO', '')),
                    "status": clean(row.get('STATUS', '')),
                    "modalidade": clean(row.get('MODALIDADE', 'PRESENCIAL')),
                    "codcoligada": clean(row.get('CODCOLIGADA', '')),
                    "cp_filial": clean(row.get('CODFILIAL', '')),
                    "filial": clean(row.get('FILIAL', '')),
                    "habilitacao": clean(row.get('HABILITACAO', '')),
                    "cpf": clean(row.get('CPF', '')),
                    "email": clean(row.get('EMAIL', '')),
                    "cep": clean(row.get('CEP', '')),
                    "rua": clean(row.get('RUA', '')),
                    "numero": clean(row.get('NUMERO', '')),
                    "bairro": clean(row.get('BAIRRO', '')),
                    "telefone1": clean(row.get('TELEFONE1', '')),
                    "telefone2": clean(row.get('TELEFONE2', '')),
                    "dtmatricula": dt_formatted,
                    "qtdcaptacao": clean(row.get('QTDCAPTACAO', '')),
                    "tipoingresso": clean(row.get('TIPOINGRESSO', '')),
                    "turno": clean(row.get('TURNO', '')),
                    "periodo": clean(row.get('PERIODO', '')),
                    "codturma": clean(row.get('CODTURMA', '')),
                    "codpolo": clean(row.get('CODPOLO', '')),
                    "polo": clean(row.get('POLO', '')),
                    "cidade": clean(row.get('CIDADE', '')),
                }
                records.append(record)

            # Inserção em lotes
            api_url = f"{SUPABASE_URL}/rest/v1/alunos_registros"
            batch_size = 500
            for i in range(0, len(records), batch_size):
                batch = records[i:i + batch_size]
                response = await client.post(api_url, json=batch, headers=headers)
                
                if response.status_code >= 400:
                    logging.error(f"Erro no envio de lote: {response.text}")
                else:
                    logging.info(f"Progresso: {i + len(batch)} de {len(records)} inseridos.")

        logging.info(f"IMPORTAÇÃO CONCLUÍDA: {len(records)} registros espelhados com sucesso.")

    except Exception as e:
        logging.error(f"FALHA NO MOTOR PYTHON: {str(e)}", exc_info=True)

@app.get("/api/temporal-comparison/{unidade_id}")
async def get_temporal_comparison_python(
    unidade_id: str, 
    semester: str,
    ref_date: str, 
    tipo_captacao: str = "all",
    curso: Optional[str] = "all",
    status: Optional[str] = "all",
    turno: Optional[str] = "all",
    modalidade: Optional[str] = "all"
):
    try:
        # 1. Configurações
        headers = {
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"
        }
        
        sem_suffix = semester[-1]
        base_year = int(semester[:4])
        target_semesters = [f"{base_year - i}{sem_suffix}" for i in range(4)]
        sem_list = f"({','.join(target_semesters)})"
        
        # 2. Busca paginada (Supabase limita 1000 por padrão)
        all_data = []
        offset = 0
        batch_limit = 1000
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            while True:
                # 2.1 Construção dos Parâmetros com Filtros no Coração do Banco (Supabase)
                # Passamos como dicionário para o httpx fazer o encode correto (espaços, caracteres especiais)
                params_map = {
                    "unidade_id": f"eq.{unidade_id}",
                    "semestre": f"in.{sem_list}",
                    "select": "ra,semestre,dtmatricula,qtdcaptacao,curso,status,turno,modalidade"
                }

                if tipo_captacao == 'captacao':
                    params_map["qtdcaptacao"] = "eq.CAPTAÇÃO"
                elif tipo_captacao == 'rematricula':
                    # Usamos eq.REMATRÍCULA para ser explícito com o dado do banco
                    params_map["qtdcaptacao"] = "eq.REMATRÍCULA"

                if curso and curso != 'all':
                    params_map["curso"] = f"eq.{curso}"
                
                if status and status != 'all':
                    params_map["status"] = f"eq.{status}"
                    
                if turno and turno != 'all':
                    params_map["turno"] = f"eq.{turno}"
                    
                if modalidade and modalidade != 'all':
                    params_map["modalidade"] = f"eq.{modalidade}"

                api_url = f"{SUPABASE_URL}/rest/v1/alunos_registros"
                
                # Usando Range header para paginação
                headers_paged = {**headers, "Range": f"{offset}-{offset + batch_limit - 1}"}
                
                resp = await client.get(api_url, headers=headers_paged, params=params_map)
                if resp.status_code != 200 and resp.status_code != 206:
                    logging.error(f"Erro Supabase ({resp.status_code}): {resp.text}")
                    break
                
                batch_data = resp.json()
                if not batch_data:
                    break
                    
                all_data.extend(batch_data)
                if len(batch_data) < batch_limit:
                    break
                offset += batch_limit

        logging.info(f"Dados recuperados do Supabase: {len(all_data)} registros para análise.")
        
        if not all_data:
            return []

        df = pd.DataFrame(all_data)
        # Garante que semestre é string para não dar erro no match do dicionário
        df['semestre'] = df['semestre'].astype(str)
        
        logging.info(f"DataFrame inicial: {len(df)} linhas")
        logging.info(f"Semestres únicos: {df['semestre'].unique()}")
        logging.info(f"Primeiras 3 datas: {df['dtmatricula'].head(3).tolist()}")
        
        # 3. Normalização de Datas - VETORIZADA e Robusta
        # As datas vêm do banco em formato ISO (YYYY-MM-DD HH:MM:SS), não usar dayfirst
        df['dt_parsed'] = pd.to_datetime(df['dtmatricula'], errors='coerce')
        
        logging.info(f"Após parse de datas: {df['dt_parsed'].notna().sum()} datas válidas de {len(df)}")
        logging.info(f"Primeiras 3 datas parseadas: {df['dt_parsed'].head(3).tolist()}")
        
        df = df.dropna(subset=['dt_parsed'])
        df['dt_parsed'] = df['dt_parsed'].dt.normalize()

        # 4. Cálculo de Produção agrupada
        df['dt_key'] = df['dt_parsed'].dt.strftime('%Y-%m-%d')
        
        logging.info(f"Primeiras 5 dt_key: {df['dt_key'].head(5).tolist()}")
        
        # Agrupamos por semestre e data
        production_stats = df.groupby(['semestre', 'dt_key'])['ra'].nunique().reset_index()
        production_stats.columns = ['semestre', 'dt_key', 'count']
        
        logging.info(f"Production stats gerado: {len(production_stats)} combinações")
        # Mostrar as combinações de 2025.1
        stats_2025 = production_stats[production_stats['semestre'] == '20251']
        logging.info(f"Stats 20251: {len(stats_2025)} entradas")
        if len(stats_2025) > 0:
            logging.info(f"Primeiras 5 entradas 20251: {stats_2025.head(5).to_dict('records')}")
        
        # Mapa: (semestre, "YYYY-MM-DD") -> contagem
        stats_map = { (row.semestre, row.dt_key): row['count'] for _, row in production_stats.iterrows() }
        
        # DEBUG: Mostrar as chaves disponíveis
        logging.info(f"Stats map criado com {len(stats_map)} entradas")
        if stats_map:
            sample_keys = list(stats_map.keys())[:5]
            logging.info(f"Exemplos de chaves no mapa: {sample_keys}")

        # 5. Lógica de Safra e Construção da Resposta
        ref_dt = pd.to_datetime(ref_date).normalize()
        results = []
        
        # Para os últimos 15 dias
        dates_to_compare = [ref_dt - pd.Timedelta(days=i) for i in range(14, -1, -1)]
        
        weekdays_pt = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']
        
        for dt in dates_to_compare:
            day_str = dt.strftime('%d/%m')
            wd = weekdays_pt[dt.weekday()]
            
            for sem in target_semesters:
                year_diff = base_year - int(sem[:4])
                # Calculamos a data equivalente no passado
                cutoff_dt = dt - pd.DateOffset(years=year_diff)
                cutoff_str = cutoff_dt.strftime('%Y-%m-%d')
                
                # DEBUG: Log da primeira busca para ver o que está acontecendo
                if len(results) < 3:
                    logging.info(f"Buscando: sem={sem} (type={type(sem)}), cutoff={cutoff_str} - Encontrado: {stats_map.get((sem, cutoff_str), 0)}")
                
                # Busca segura no mapa
                count = stats_map.get((sem, cutoff_str), 0)
                
                results.append({
                    "ref_day_month": day_str,
                    "weekday_name": wd,
                    "semester_id": sem,
                    "student_count": int(count),
                    "sort_date": dt.strftime('%Y-%m-%d')
                })

        return results

    except Exception as e:
        logging.error(f"Erro no cálculo Python: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
