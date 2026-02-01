import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Unidade, Profile } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Building2, Users, Plus, ShieldCheck, Check, X, Trash2 } from "lucide-react";

const Admin = () => {
    const { profile, assignUnidade, unassignUnidade } = useAuth();
    const [unidades, setUnidades] = useState<Unidade[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [newUnidadeNome, setNewUnidadeNome] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [unidadesRes, profilesRes, mappingsRes] = await Promise.all([
                supabase.from("unidades").select("*").order("nome"),
                supabase.from("profiles").select("*").order("first_name"),
                supabase.from("user_unidades").select("*")
            ]);

            if (unidadesRes.error) throw unidadesRes.error;
            if (profilesRes.error) throw profilesRes.error;

            const mappings = mappingsRes.data || [];

            const enrichedProfiles = (profilesRes.data || []).map(p => ({
                ...p,
                unidades_ids: mappings.filter(m => m.profile_id === p.id).map(m => m.unidade_id)
            }));

            setUnidades(unidadesRes.data || []);
            setProfiles(enrichedProfiles as Profile[]);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            toast.error("Erro ao carregar dados do painel admin.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateUnidade = async () => {
        if (!newUnidadeNome) return;
        try {
            const { error } = await supabase.from("unidades").insert([{ nome: newUnidadeNome }]);
            if (error) throw error;
            toast.success("Unidade criada com sucesso!");
            setNewUnidadeNome("");
            fetchData();
        } catch (error) {
            console.error("Erro ao criar unidade:", error);
            toast.error("Falha ao criar unidade.");
        }
    };

    const toggleUnidade = async (userId: string, unidadeId: string, isAssigned: boolean) => {
        try {
            if (isAssigned) {
                await unassignUnidade(userId, unidadeId);
                toast.success("Acesso removido.");
            } else {
                await assignUnidade(userId, unidadeId);
                toast.success("Acesso concedido!");
            }
            fetchData();
        } catch (error) {
            // Erro já tratado no context
        }
    };

    const handleFileUpdate = async (file: File) => {
        const targetUnidadeId = profile?.current_unidade_id || (unidades.length > 0 ? unidades[0].id : null);

        if (!targetUnidadeId) {
            toast.error("Crie ou selecione uma unidade antes de importar dados.");
            return;
        }

        setIsUpdating(true);
        const toastId = toast.loading("Conectando ao Motor Python...");

        try {
            toast.info("Enviando arquivo para o Backend (Alta Performance)...", { id: toastId });

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

            toast.success("Arquivo recebido! O motor Python iniciou o processamento em segundo plano.", {
                id: toastId,
                duration: 5000
            });

            fetchData();
        } catch (error) {
            console.error("Erro no upload admin:", error);
            const msg = error instanceof Error ? error.message : "Falha na conexão com o motor Python";
            toast.error(msg, { id: toastId });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteUnidade = async (id: string, nome: string) => {
        if (!window.confirm(`Tem certeza que deseja excluir a unidade "${nome}"? Todos os alunos vinculados a ela também serão apagados.`)) {
            return;
        }

        try {
            const { error } = await supabase.from("unidades").delete().eq("id", id);
            if (error) throw error;
            toast.success("Unidade excluída com sucesso!");
            fetchData();
        } catch (error) {
            console.error("Erro ao excluir unidade:", error);
            toast.error("Falha ao excluir unidade.");
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header
                isDataLoaded={false}
                onFileUpdate={handleFileUpdate}
                isUpdating={isUpdating}
            />

            <main className="flex-grow container mx-auto px-6 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                        Painel de Administração
                    </h2>
                    <p className="text-muted-foreground">
                        Gerencie unidades e atribua múltiplos acessos para cada usuário.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Gestão de Unidades */}
                    <Card className="border-border/50 shadow-sm lg:col-span-1">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <CardTitle>Unidades</CardTitle>
                            </div>
                            <CardDescription>Adicione novas unidades acadêmicas.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-2 mb-6">
                                <Input
                                    placeholder="Nome da Unidade"
                                    value={newUnidadeNome}
                                    onChange={(e) => setNewUnidadeNome(e.target.value)}
                                />
                                <Button onClick={handleCreateUnidade} className="w-full">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Criar Unidade
                                </Button>
                            </div>

                            <div className="space-y-2">
                                {unidades.map((unid) => (
                                    <div key={unid.id} className="flex items-center justify-between p-3 rounded-md bg-muted/50 border border-border/50 text-sm group">
                                        <span className="font-medium">{unid.nome}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleDeleteUnidade(unid.id, unid.nome)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Gestão de Matriz de Acesso */}
                    <Card className="border-border/50 shadow-sm lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Users className="h-5 w-5" />
                                </div>
                                <CardTitle>Matriz de Acesso</CardTitle>
                            </div>
                            <CardDescription>Gerencie as unidades que cada usuário pode acessar.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <div className="min-w-full inline-block align-middle">
                                    <div className="border rounded-lg overflow-hidden border-border/50">
                                        <table className="min-w-full divide-y divide-border/50">
                                            <thead className="bg-muted/50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Usuário</th>
                                                    {unidades.map(u => (
                                                        <th key={u.id} className="px-4 py-3 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                                                            {u.nome}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="bg-card divide-y divide-border/50">
                                                {profiles.map((p) => (
                                                    <tr key={p.id}>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <div className="text-sm font-medium">{p.first_name || "Sem Nome"}</div>
                                                            <div className="text-[10px] text-muted-foreground">{p.id.substring(0, 8)}...</div>
                                                        </td>
                                                        {unidades.map(u => {
                                                            const hasAccess = p.unidades_ids?.includes(u.id);
                                                            return (
                                                                <td key={u.id} className="px-4 py-3 text-center">
                                                                    <button
                                                                        onClick={() => toggleUnidade(p.id, u.id, !!hasAccess)}
                                                                        className={`p-2 rounded-full transition-all ${hasAccess
                                                                            ? "bg-success/10 text-success hover:bg-success/20"
                                                                            : "bg-muted text-muted-foreground hover:bg-muted-foreground/10"
                                                                            }`}
                                                                    >
                                                                        {hasAccess ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                                                    </button>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Admin;
