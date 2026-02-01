import { useState } from 'react';
import { processExcelFile } from '@/utils/excelProcessor';
import { ProcessedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { UploadCloud } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { upsertRecordsToDb, fetchRecordsFromDb, prepareProcessedData } from '@/utils/dbProcessor';

interface FileUploadProps {
  onFileUpload: (data: ProcessedData) => void;
}

const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const { user, profile } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Por favor, selecione um arquivo primeiro.");
      return;
    }
    if (!user) {
      toast.error("Você precisa estar logado para enviar um arquivo.");
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading("Iniciando processo...");

    try {
      // Se não houver unidade selecionada e for admin, tentamos pegar a primeira unidade disponível
      let targetUnidadeId = profile?.current_unidade_id;

      if (!targetUnidadeId && profile?.role === 'admin') {
        const { data: units } = await supabase.from('unidades').select('id').limit(1);
        if (units && units.length > 0) {
          targetUnidadeId = units[0].id;
        }
      }

      if (!targetUnidadeId) {
        toast.error("Por favor, selecione uma unidade antes de carregar a planilha.");
        setIsLoading(false);
        toast.dismiss(toastId);
        return;
      }

      toast.info("Enviando arquivo para o Motor Python (Alta Performance)...", { id: toastId });

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`http://localhost:8000/import-excel/${targetUnidadeId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erro no motor Python");
      }

      toast.success("Mágico! O motor Python iniciou o processamento em segundo plano.", {
        id: toastId,
        duration: 5000
      });

      // Recarregar os dados após alguns segundos para refletir as mudanças do motor
      setTimeout(async () => {
        const { fetchRecordsFromDb, prepareProcessedData } = await import('@/utils/dbProcessor');
        const updatedRecords = await fetchRecordsFromDb(targetUnidadeId!);
        onFileUpload(prepareProcessedData(updatedRecords));
      }, 5000);

    } catch (error) {
      console.error("Erro no motor Python:", error);
      const errorMessage = error instanceof Error ? error.message : "Falha na conexão com o motor Python";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 border-2 border-dashed rounded-lg text-center bg-card hover:border-primary transition-colors">
      <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">Carregar Planilha de Dados</h2>
      <p className="text-muted-foreground mb-6">Arraste e solte ou selecione o arquivo .xlsx para iniciar a análise</p>
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        <Input type="file" accept=".xlsx, .xls" onChange={handleFileChange} className="max-w-xs" />
        <Button onClick={handleUpload} disabled={!file || isLoading}>
          <UploadCloud className="mr-2 h-4 w-4" />
          {isLoading ? "Processando..." : "Importar e Analisar"}
        </Button>
      </div>
    </div>
  );
};

export default FileUpload;