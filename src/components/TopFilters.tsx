import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Filters } from "@/types";
import { SlidersHorizontal, RotateCcw } from "lucide-react";

interface TopFiltersProps {
    onFilterChange: (newFilters: Partial<Filters>) => void;
    onClearAllFilters: () => void;
    courses: string[];
    statuses: string[];
    shifts: string[];
    semesters: string[];
    modalidades: string[];
    currentFilters: Filters;
}

const TopFilters = ({
    onFilterChange,
    onClearAllFilters,
    courses,
    statuses,
    shifts,
    semesters,
    modalidades,
    currentFilters
}: TopFiltersProps) => {
    const hasActiveFilters = Object.values(currentFilters).some(value => value && value !== 'all' && value !== 'PRESENCIAL' && value !== 'MATRICULADO');

    return (
        <Card className="shadow-md border-[#a3b1cc] border-b-4 rounded-none mb-4 sticky top-0 z-50 bg-[#f8faff]/95 backdrop-blur-md">
            <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-6">
                    {/* Header de Filtros */}
                    <div className="flex items-center gap-2 pr-6 border-r-2 border-[#a3b1cc]/30">
                        <div className="bg-[#003366] p-2 rounded-lg shadow-inner">
                            <SlidersHorizontal className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-[#003366]/50 uppercase tracking-tighter leading-none">Painel de</span>
                            <span className="text-sm font-black text-[#003366] uppercase tracking-normal">Filtros</span>
                        </div>
                    </div>

                    {/* Grid de Controles */}
                    <div className="flex flex-wrap items-center gap-4 flex-grow">
                        {/* Modalidade */}
                        <div className="flex flex-col gap-1 min-w-[140px]">
                            <Label className="text-[10px] uppercase text-[#003366] font-bold opacity-70">Modalidade</Label>
                            <Select onValueChange={(value) => onFilterChange({ modalidade: value })} value={currentFilters.modalidade}>
                                <SelectTrigger className="h-9 transition-all hover:border-[#003366] border-[#a3b1cc]">
                                    <SelectValue placeholder="Modalidade" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas</SelectItem>
                                    {modalidades.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Tipo */}
                        <div className="flex flex-col gap-1 min-w-[140px]">
                            <Label className="text-[10px] uppercase text-[#003366] font-bold opacity-70">Tipo</Label>
                            <Select onValueChange={(value) => onFilterChange({ tipoCaptacao: value as any })} value={currentFilters.tipoCaptacao || 'all'}>
                                <SelectTrigger className="h-9 transition-all hover:border-[#003366] border-[#a3b1cc]">
                                    <SelectValue placeholder="Tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="captacao">Captação</SelectItem>
                                    <SelectItem value="rematricula">Rematrícula</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Curso */}
                        <div className="flex flex-col gap-1 min-w-[200px] max-w-[300px]">
                            <Label className="text-[10px] uppercase text-[#003366] font-bold opacity-70">Curso</Label>
                            <Select onValueChange={(value) => onFilterChange({ curso: value })} value={currentFilters.curso || 'all'}>
                                <SelectTrigger className="h-9 transition-all hover:border-[#003366] border-[#a3b1cc]">
                                    <SelectValue className="truncate" placeholder="Todos os Cursos" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    <SelectItem value="all">Todos os Cursos</SelectItem>
                                    {courses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status */}
                        <div className="flex flex-col gap-1 min-w-[140px]">
                            <Label className="text-[10px] uppercase text-[#003366] font-bold opacity-70">Status</Label>
                            <Select onValueChange={(value) => onFilterChange({ status: value })} value={currentFilters.status || 'all'}>
                                <SelectTrigger className="h-9 transition-all hover:border-[#003366] border-[#a3b1cc]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Status</SelectItem>
                                    {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Turno */}
                        <div className="flex flex-col gap-1 min-w-[120px]">
                            <Label className="text-[10px] uppercase text-[#003366] font-bold opacity-70">Turno</Label>
                            <Select onValueChange={(value) => onFilterChange({ turno: value })} value={currentFilters.turno || 'all'}>
                                <SelectTrigger className="h-9 transition-all hover:border-[#003366] border-[#a3b1cc]">
                                    <SelectValue placeholder="Turno" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    {shifts.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Histórico */}
                        <div className="flex flex-col gap-1 min-w-[140px]">
                            <Label className="text-[10px] uppercase text-[#b38600] font-black">Histórico YoY</Label>
                            <Select onValueChange={(value) => onFilterChange({ referenceSemester: value })} value={currentFilters.referenceSemester || 'all'}>
                                <SelectTrigger className="h-9 border-[#ffcc00] bg-[#fffdf0] text-[#b38600] font-bold hover:bg-[#fff9e6]">
                                    <SelectValue placeholder="Simular" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Nenhum</SelectItem>
                                    {semesters.map(s => <SelectItem key={s} value={s} className="font-medium">{`${s.substring(0, 4)}.${s.slice(-1)}`}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Botão de Limpeza */}
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 border-[#a3b1cc] text-[#003366] hover:bg-white hover:text-red-600 hover:border-red-600 transition-all font-bold"
                            onClick={onClearAllFilters}
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Resetar
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default TopFilters;
