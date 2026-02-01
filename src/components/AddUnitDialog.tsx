import { useState } from 'react';
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

interface AddUnitDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

const AddUnitDialog = ({ isOpen, onOpenChange, onSuccess }: AddUnitDialogProps) => {
    const [nome, setNome] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleAdd = async () => {
        if (!nome.trim()) {
            toast.error("Por favor, digite o nome da unidade.");
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase
                .from('unidades')
                .insert({ nome: nome.trim().toUpperCase() });

            if (error) throw error;

            toast.success("Unidade cadastrada com sucesso!");
            setNome("");
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Erro ao cadastrar unidade:", error);
            toast.error("Erro ao cadastrar: " + (error instanceof Error ? error.message : "Erro desconhecido"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-md bg-white border-[#003366]/20">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-[#003366]">
                        <Building2 className="h-6 w-6" />
                        Cadastrar Nova Unidade
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Digite o nome da nova unidade/filial (Ex: UNINASSAU PAULISTA).
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-[#003366]">Nome da Unidade</Label>
                        <Input
                            placeholder="Ex: UNINASSAU RECIFE"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            className="border-[#003366]/20 focus:border-[#003366]"
                        />
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleAdd}
                        disabled={isLoading || !nome.trim()}
                        className="bg-[#003366] hover:bg-[#002244]"
                    >
                        {isLoading ? "Salvando..." : "Cadastrar Unidade"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default AddUnitDialog;
