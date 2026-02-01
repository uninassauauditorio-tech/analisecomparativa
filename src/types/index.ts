import { LucideIcon } from "lucide-react";

export interface StudentRecord {
  CODCOLIGADA: string;
  CODFILIAL: string;
  FILIAL: string;
  SEMESTRE: string;
  CURSO: string;
  HABILITACAO: string;
  RA: string;
  ALUNO: string;
  CPF: string;
  EMAIL: string;
  CEP: string;
  RUA: string;
  NUMERO: string;
  BAIRRO: string;
  TELEFONE1: string;
  TELEFONE2: string;
  DTMATRICULA: string;
  QTDCAPTACAO: string;
  TIPOINGRESSO: string;
  TURNO: string;
  PERIODO: string;
  STATUS: string;
  CODTURMA: string;
  CODPOLO: string;
  POLO: string;
  CIDADE: string;
  MODALIDADE: string;
  UNIDADE?: string;
}

export interface ProcessedData {
  records: StudentRecord[];
  courses: string[];
  statuses: string[];
  shifts: string[];
  semesters: string[];
  modalidades: string[];
  currentSemester: string;
  filialName?: string;
}

export interface Filters {
  curso?: string;
  status?: string;
  turno?: string;
  semestre?: string;
  semesterType?: '1' | '2' | 'all';
  tipoCaptacao?: 'all' | 'captacao' | 'rematricula';
  referenceSemester?: string;
  modalidade?: string;
}

export interface CalculatedKPIData {
  totalStudents: number;
  growthRate: number;
  captacaoRate: number;
  retentionRate: number;
  captacaoCount: number;
  activeCount: number;
  evasaoCount: number;
  evasaoRate: number;
}

export type DynamicInsight = {
  icon: keyof typeof import("lucide-react");
  type: "success" | "primary" | "warning" | "danger";
  title: string;
  description: string;
};

export interface Unidade {
  id: string;
  nome: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  theme: string | null;
  role: 'admin' | 'user';
  unidades_ids?: string[]; // IDs das unidades que o usuário tem acesso
  current_unidade_id?: string | null; // Unidade atualmente selecionada
}

export interface MetaCurso {
  id?: string;
  unidade_id: string;
  semestre: string;
  curso: string;
  tipo: 'captacao' | 'rematricula';
  meta_valor: number;
}