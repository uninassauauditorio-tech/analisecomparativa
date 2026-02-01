import { createContext, useContext, useState, ReactNode } from 'react';
import { ProcessedData } from '@/types';
import { fetchRecordsFromDb, prepareProcessedData } from '@/utils/dbProcessor';
import { toast } from 'sonner';

interface DataContextType {
  processedData: ProcessedData | null;
  isAnalyticLoading: boolean;
  setProcessedData: (data: ProcessedData | null) => void;
  setIsAnalyticLoading: (isLoading: boolean) => void;
  clearAnalyticData: () => void;
  refreshData: (unidadeId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [isAnalyticLoading, setIsAnalyticLoading] = useState(false); // Inicia como falso

  const clearAnalyticData = () => {
    setProcessedData(null);
  };

  const refreshData = async (unidadeId: string) => {
    if (!unidadeId) return;

    setIsAnalyticLoading(true);
    try {
      const records = await fetchRecordsFromDb(unidadeId);
      if (records.length > 0) {
        setProcessedData(prepareProcessedData(records));
      } else {
        setProcessedData(null);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Não foi possível carregar os dados das matrículas.");
    } finally {
      setIsAnalyticLoading(false);
    }
  };

  const value = {
    processedData,
    isAnalyticLoading,
    setProcessedData,
    setIsAnalyticLoading,
    clearAnalyticData,
    refreshData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};