import { useState, useEffect } from "react";
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
import { Target, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MetaCurso } from "@/types";

interface GoalsDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    unidadeId: string;
    semestre: string;
    courses: string[];
    tipo: "captacao" | "rematricula";
    onSuccess: () => void;
}

const GoalsDialog = ({
    isOpen,
    onOpenChange,
    unidadeId,
    semestre,
    courses,
    tipo,
    onSuccess,
}: GoalsDialogProps) => {
    const [metas, setMetas] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && unidadeId && semestre) {
            fetchMetas();
        }
    }, [isOpen, unidadeId, semestre, tipo]);

    const fetchMetas = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from("metas_cursos")
                .select("*")
                .eq("unidade_id", unidadeId)
                .eq("semestre", semestre)
                .eq("tipo", tipo);

            if (error) throw error;

            const metaMap: Record<string, number> = {};
            data?.forEach((m: any) => {
                metaMap[m.curso] = m.meta_valor;
            });
            setMetas(metaMap);
        } catch (error) {
            console.error("Erro ao carregar metas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const upsertData = courses.map((curso) => ({
                unidade_id: unidadeId,
                semestre,
                curso,
                tipo,
                meta_valor: metas[curso] || 0,
            }));

            const { error } = await supabase.from("metas_cursos").upsert(upsertData, {
                onConflict: "unidade_id,semestre,curso,tipo",
            });

            if (error) throw error;

            toast.success(`Metas de ${tipo} salvas com sucesso!`);
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Erro ao salvar metas:", error);
            toast.error("Erro ao salvar metas.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-2xl max-h-[80vh] flex flex-col bg-white border-[#003366]/20">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-[#003366]">
                        <Target className="h-6 w-6" />
                        Metas de {tipo === "captacao" ? "Captação" : "Rematrícula"} - {semestre}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        Insira as metas manuais para cada curso abaixo.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="flex-grow overflow-y-auto py-4 pr-2 custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {courses.map((curso) => (
                            <div key={curso} className="space-y-1 p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                                <Label className="text-[10px] font-bold uppercase text-[#003366] block truncate" title={curso}>
                                    {curso}
                                </Label>
                                <Input
                                    type="number"
                                    placeholder="Meta"
                                    value={metas[curso] || ""}
                                    onChange={(e) =>
                                        setMetas((prev) => ({
                                            ...prev,
                                            [curso]: parseInt(e.target.value) || 0,
                                        }))
                                    }
                                    className="h-8 border-[#003366]/20 focus:border-[#003366] bg-white text-sm"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <AlertDialogFooter className="pt-4 border-t">
                    <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center rounded-md bg-[#003366] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#002244] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#003366] disabled:opacity-50 gap-2"
                    >
                        <Save className="h-4 w-4" />
                        {isLoading ? "Salvando..." : "Salvar Metas"}
                    </button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default GoalsDialog;
