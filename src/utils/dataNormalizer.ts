import { StudentRecord } from "@/types";

// Mapeamento de possíveis nomes de cabeçalho para o nome padrão do sistema
const headerMappings: { [key: string]: keyof StudentRecord } = {
  'codcoligada': 'CODCOLIGADA',
  'codfilial': 'CODFILIAL',
  'filial': 'FILIAL',
  'semestre': 'SEMESTRE',
  'curso': 'CURSO',
  'habilitacao': 'HABILITACAO',
  'ra': 'RA',
  'aluno': 'ALUNO',
  'cpf': 'CPF',
  'email': 'EMAIL',
  'cep': 'CEP',
  'rua': 'RUA',
  'numero': 'NUMERO',
  'bairro': 'BAIRRO',
  'telefone1': 'TELEFONE1',
  'telefone2': 'TELEFONE2',
  'dtmatricula': 'DTMATRICULA',
  'qtdcaptacao': 'QTDCAPTACAO',
  'tipoingresso': 'TIPOINGRESSO',
  'turno': 'TURNO',
  'periodo': 'PERIODO',
  'status': 'STATUS',
  'codturma': 'CODTURMA',
  'codpolo': 'CODPOLO',
  'polo': 'POLO',
  'cidade': 'CIDADE',
  'modalidade': 'MODALIDADE',
  'unidade': 'UNIDADE',
};

// Função para normalizar os dados brutos da planilha
export const normalizeData = (rawData: any[]): StudentRecord[] => {
  return rawData.map(rawRecord => {
    const normalizedRecord: Partial<StudentRecord> = {};

    for (const rawKey in rawRecord) {
      if (Object.prototype.hasOwnProperty.call(rawRecord, rawKey)) {
        // Converte a chave para minúsculas e sem espaços para uma correspondência mais flexível
        const cleanKey = rawKey.toLowerCase().trim();

        // Encontra a chave padrão correspondente no nosso mapeamento
        const standardKey = headerMappings[cleanKey];

        if (standardKey) {
          normalizedRecord[standardKey] = rawRecord[rawKey];
        }
      }
    }

    return normalizedRecord as StudentRecord;
  });
};