import { useState, useRef, useEffect } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UploadCloud, AlertTriangle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Unidade } from "@/types";
import { toast } from 'sonner';

interface ImportDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (unidadeId: string) => void;
}

const ImportDialog = ({ isOpen, onOpenChange, onSuccess }: ImportDialogProps) => {
    const [unidades, setUnidades] = useState<Unidade[]>([]);
    const [selectedUnidadeId, setSelectedUnidadeId] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchUnidades = async () => {
            const { data } = await supabase.from('unidades').select('*').order('nome');
            if (data) setUnidades(data);
        };
        if (isOpen) fetchUnidades();
    }, [isOpen]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
        }
    };

    const handleImport = async () => {
        if (!selectedUnidadeId) {
            toast.error("Por favor, selecione a unidade de destino.");
            return;
        }
        if (!file) {
            toast.error("Por favor, selecione um arquivo Excel.");
            return;
        }

        setIsUploading(true);
        const toastId = toast.loading("Processando planilha localmente...");

        try {
            const XLSX = await import('xlsx');
            const { deleteRecordsForUnidade } = await import('@/utils/dbProcessor');

            // 1. Ler o arquivo
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { cellDates: true });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

            if (jsonData.length === 0) {
                throw new Error("A planilha está vazia.");
            }

            toast.loading(`Limpando base antiga (${jsonData.length} linhas detectadas)...`, { id: toastId });

            // 2. Limpar base antiga da unidade (Modo Espelho)
            await deleteRecordsForUnidade(selectedUnidadeId);

            toast.loading("Preparando registros para envio...", { id: toastId });

            // 3. Mapear e Limpar dados
            const BATCH_SIZE = 1000;
            const records = jsonData.map(row => {
                const clean = (val: any) => {
                    if (val === null || val === undefined) return "";
                    return String(val).trim();
                };

                // Normalização de data (DD/MM/YYYY)
                let dt_formatted = "";
                const dt_raw = row['DTMATRICULA'] || row['dtmatricula'];
                if (dt_raw instanceof Date) {
                    dt_formatted = dt_raw.toLocaleDateString('pt-BR');
                } else if (dt_raw) {
                    // Tenta parsear string se não for objeto Date
                    try {
                        const d = new Date(dt_raw);
                        if (!isNaN(d.getTime())) dt_formatted = d.toLocaleDateString('pt-BR');
                    } catch (e) { }
                }

                return {
                    unidade_id: selectedUnidadeId,
                    ra: clean(row['RA'] || row['ra']),
                    semestre: clean(row['SEMESTRE'] || row['semestre']),
                    aluno: clean(row['ALUNO'] || row['aluno']),
                    curso: clean(row['CURSO'] || row['curso']),
                    status: clean(row['STATUS'] || row['status']),
                    modalidade: clean(row['MODALIDADE'] || row['modalidade'] || 'PRESENCIAL'),
                    codcoligada: clean(row['CODCOLIGADA'] || row['codcoligada']),
                    cp_filial: clean(row['CODFILIAL'] || row['codfilial']),
                    filial: clean(row['FILIAL'] || row['filial']),
                    habilitacao: clean(row['HABILITACAO'] || row['habilitacao']),
                    cpf: clean(row['CPF'] || row['cpf']),
                    email: clean(row['EMAIL'] || row['email']),
                    cep: clean(row['CEP'] || row['cep']),
                    rua: clean(row['RUA'] || row['rua']),
                    numero: clean(row['NUMERO'] || row['numero']),
                    bairro: clean(row['BAIRRO'] || row['bairro']),
                    telefone1: clean(row['TELEFONE1'] || row['telefone1']),
                    telefone2: clean(row['TELEFONE2'] || row['telefone2']),
                    dtmatricula: dt_formatted,
                    qtdcaptacao: clean(row['QTDCAPTACAO'] || row['qtdcaptacao']),
                    tipoingresso: clean(row['TIPOINGRESSO'] || row['tipoingresso']),
                    turno: clean(row['TURNO'] || row['turno']),
                    periodo: clean(row['PERIODO'] || row['periodo']),
                    codturma: clean(row['CODTURMA'] || row['codturma']),
                    codpolo: clean(row['CODPOLO'] || row['codpolo']),
                    polo: clean(row['POLO'] || row['polo']),
                    cidade: clean(row['CIDADE'] || row['cidade']),
                };
            }).filter(r => r.ra && r.semestre); // Garante que tem RA e Semestre

            // 4. Enviar em Lotes
            for (let i = 0; i < records.length; i += BATCH_SIZE) {
                const batch = records.slice(i, i + BATCH_SIZE);
                toast.loading(`Enviando: ${i} de ${records.length} registros...`, { id: toastId });

                const { error } = await supabase.from('alunos_registros').insert(batch);
                if (error) throw error;
            }

            toast.success(`Sucesso! ${records.length} registros importados.`, { id: toastId });
            onSuccess(selectedUnidadeId);
            onOpenChange(false);
            setFile(null);
            setSelectedUnidadeId("");
        } catch (error) {
            console.error("Erro na importação local:", error);
            toast.error("Falha na importação: " + (error instanceof Error ? error.message : "Erro desconhecido"), { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md bg-[#f8faff] border-[#003366]/20">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-[#003366]">
                        <UploadCloud className="h-6 w-6" />
                        Importação Inteligente
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-sm">
                        Selecione a unidade de destino. <span className="font-bold text-red-600">Atenção:</span> os dados antigos desta unidade serão apagados para dar lugar aos novos.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-[#003366]">1. Unidade de Destino (Obrigatório)</Label>
                        <Select value={selectedUnidadeId} onValueChange={setSelectedUnidadeId}>
                            <SelectTrigger className="border-[#003366]/20 bg-white">
                                <SelectValue placeholder="Selecione a unidade..." />
                            </SelectTrigger>
                            <SelectContent>
                                {unidades.map(u => (
                                    <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-[#003366]">2. Arquivo Excel (.xlsx)</Label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${file ? 'border-green-500 bg-green-50' : 'border-[#003366]/20 hover:border-[#003366]/50 bg-white'}`}
                        >
                            {file ? (
                                <div className="flex flex-col items-center gap-2">
                                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                                    <span className="text-sm font-medium text-green-700">{file.name}</span>
                                    <span className="text-[10px] text-green-600">Clique para alterar</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <UploadCloud className="h-8 w-8 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Clique para selecionar a planilha</span>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".xlsx, .xls"
                            />
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3 text-amber-700">
                        <AlertTriangle className="h-5 w-5 shrink-0" />
                        <p className="text-[11px] leading-tight font-medium">
                            O fluxo "Limpa e Insere" será executado. Todos os registros anteriores da unidade selecionada serão substituídos.
                        </p>
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isUploading}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleImport}
                        disabled={!selectedUnidadeId || !file || isUploading}
                        className="bg-[#003366] hover:bg-[#002244]"
                    >
                        {isUploading ? "Processando..." : "Iniciar Importação"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ImportDialog;
