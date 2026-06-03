import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Filters } from "@/types";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { SlidersHorizontal, RotateCcw, ChevronDown } from "lucide-react";

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
    const [statusSearch, setStatusSearch] = useState("");
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
                        <div className="flex flex-col gap-1 min-w-[160px]">
                            <Label className="text-[10px] uppercase text-[#003366] font-bold opacity-70">Status</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="h-9 justify-between text-left font-normal border-[#a3b1cc] hover:border-[#003366] transition-all w-full bg-white select-none">
                                        <span className="truncate max-w-[130px] text-gray-800 font-medium">
                                            {currentFilters.status === 'all' || !currentFilters.status 
                                                ? 'Todos os Status' 
                                                : currentFilters.status.split(',').length === 1 
                                                    ? currentFilters.status 
                                                    : `${currentFilters.status.split(',').length} selecionados`}
                                        </span>
                                        <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64 p-2 bg-white border border-[#a3b1cc] shadow-xl rounded-lg" align="start">
                                    <div className="space-y-2">
                                        {/* Campo de Pesquisa */}
                                        <div className="px-1 py-1">
                                            <input 
                                                type="text" 
                                                placeholder="Pesquisar..." 
                                                value={statusSearch}
                                                onChange={(e) => setStatusSearch(e.target.value)}
                                                className="w-full h-8 px-2 text-xs border border-[#a3b1cc] rounded focus:outline-none focus:ring-1 focus:ring-[#003366] focus:border-[#003366]"
                                            />
                                        </div>

                                        {/* Opção Todos */}
                                        <label className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-100 cursor-pointer text-sm font-medium select-none text-gray-700">
                                            <input 
                                                type="checkbox" 
                                                checked={currentFilters.status === 'all' || !currentFilters.status}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        onFilterChange({ status: 'all' });
                                                    }
                                                }}
                                                className="h-4 w-4 rounded border-[#a3b1cc] text-[#003366] focus:ring-[#003366]"
                                            />
                                            <span>(Tudo)</span>
                                        </label>
                                        <div className="h-px bg-slate-200 my-1" />

                                        {/* Lista de Status */}
                                        <div className="max-h-48 overflow-y-auto space-y-0.5 px-1">
                                            {statuses.filter(s => s.toLowerCase().includes(statusSearch.toLowerCase())).map(s => {
                                                const selectedList = (currentFilters.status && currentFilters.status !== 'all') 
                                                    ? currentFilters.status.split(',') 
                                                    : statuses; // Se 'all', todos estão marcados
                                                const isChecked = selectedList.includes(s);

                                                return (
                                                    <label key={s} className="flex items-center gap-2 px-1 py-1 rounded hover:bg-slate-100 cursor-pointer text-xs font-semibold select-none text-gray-800">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={isChecked}
                                                            onChange={(e) => {
                                                                let newList: string[];
                                                                if (e.target.checked) {
                                                                    newList = [...selectedList, s];
                                                                } else {
                                                                    newList = selectedList.filter(item => item !== s);
                                                                }

                                                                if (newList.length === 0 || newList.length === statuses.length) {
                                                                    onFilterChange({ status: 'all' });
                                                                } else {
                                                                    onFilterChange({ status: newList.join(',') });
                                                                }
                                                            }}
                                                            className="h-4 w-4 rounded border-[#a3b1cc] text-[#003366] focus:ring-[#003366]"
                                                        />
                                                        <span className="truncate">{s}</span>
                                                    </label>
                                                );
                                            })}
                                            {statuses.filter(s => s.toLowerCase().includes(statusSearch.toLowerCase())).length === 0 && (
                                                <div className="text-center text-xs text-muted-foreground py-2">
                                                    Nenhum status encontrado.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
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
