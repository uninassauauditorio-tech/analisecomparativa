import { BarChart3, UploadCloud, LogOut, Building2, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import Navigation from "./Navigation";
import { Link } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Unidade } from "@/types";
import ImportDialog from "./ImportDialog";
import AddUnitDialog from "./AddUnitDialog";

interface HeaderProps {
  isDataLoaded: boolean;
  filialName?: string;
  onFileUpdate: (file: File) => Promise<void>;
  isUpdating: boolean;
}

const Header = ({ isDataLoaded, filialName = "UNINASSAU", onFileUpdate, isUpdating }: HeaderProps) => {
  const { clearAnalyticData, refreshData } = useData();
  const { user, profile, setCurrentUnidade, signOut, isProfileLoading } = useAuth();
  const [userUnidades, setUserUnidades] = useState<Unidade[]>([]);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);

  const fetchUnidades = useCallback(async () => {
    if (!profile) return;

    let query = supabase.from('unidades').select('*').order('nome');

    // Se não for admin, filtra apenas a unidade vinculada ao perfil
    if (profile.role !== 'admin' && profile.unidade_id) {
      query = query.eq('id', profile.unidade_id);
    }

    const { data } = await query;
    if (data) setUserUnidades(data);
  }, [profile]);

  useEffect(() => {
    fetchUnidades();
  }, [fetchUnidades]);

  const handleImportSuccess = (unidadeId: string) => {
    setCurrentUnidade(unidadeId);
    clearAnalyticData();
    setTimeout(() => refreshData(unidadeId), 5000);
  };

  const handleSignOut = async () => {
    clearAnalyticData();
    await signOut();
  };

  return (
    <header className="bg-background/80 backdrop-blur-sm shadow-md sticky top-0 z-50 border-b border-border/50">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <img src="/logo.png" alt="Logo UNINASSAU" className="h-10 w-auto object-contain" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#003366]">
              Análise Comparativa
            </h1>
          </Link>

          {!isProfileLoading && profile && (
            <div className="flex items-center gap-2 border-l border-border/50 pl-6 ml-2">
              <Building2 className="h-4 w-4 text-primary" />
              <Select
                value={profile.current_unidade_id || ""}
                onValueChange={(val) => {
                  setCurrentUnidade(val);
                  clearAnalyticData();
                }}
              >
                <SelectTrigger className="h-8 min-w-[150px] bg-transparent border-none shadow-none font-bold text-[#003366] focus:ring-0 hover:bg-primary/5 rounded-md transition-colors">
                  <SelectValue placeholder="Selecionar Unidade" />
                </SelectTrigger>
                <SelectContent>
                  {userUnidades.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {profile.role === 'admin' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full hover:bg-primary/10 text-primary"
                  onClick={() => setIsAddUnitOpen(true)}
                  title="Cadastrar Nova Unidade"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}

              <AddUnitDialog
                isOpen={isAddUnitOpen}
                onOpenChange={setIsAddUnitOpen}
                onSuccess={fetchUnidades}
              />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <>
              <Button
                variant="secondary"
                onClick={() => setIsImportOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <UploadCloud className="mr-2 h-4 w-4" />
                Importar Planilha
              </Button>
              <ImportDialog
                isOpen={isImportOpen}
                onOpenChange={setIsImportOpen}
                onSuccess={handleImportSuccess}
              />
            </>
          )}
          <ThemeSwitcher />
          {user && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" title="Sair">
                  <LogOut className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Encerrar Sessão</AlertDialogTitle>
                  <AlertDialogDescription>
                    Você tem certeza que deseja sair? Seus dados de análise atuais serão limpos da tela.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
      {isDataLoaded && <Navigation />}
    </header>
  );
};

export default Header;