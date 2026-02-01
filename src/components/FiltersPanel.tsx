import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Filters } from "@/types";
import { SlidersHorizontal, X, RotateCcw } from "lucide-react";

interface FiltersPanelProps {
  onFilterChange: (newFilters: Partial<Filters>) => void;
  onClearAllFilters: () => void;
  courses: string[];
  statuses: string[];
  shifts: string[];
  semesters: string[];
  modalidades: string[];
  currentFilters: Filters;
}

const FilterItem = ({ label, value, onClear, children }: { label: string, value?: string, onClear: () => void, children: React.ReactNode }) => (
  <div className="relative">
    <Label>{label}</Label>
    {children}
    {value && value !== 'all' && (
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-8 top-[2.1rem] h-5 w-5 text-muted-foreground hover:text-foreground"
        onClick={onClear}
      >
        <X className="h-4 w-4" />
      </Button>
    )}
  </div>
);

const FiltersPanel = ({ onFilterChange, onClearAllFilters, courses, statuses, shifts, semesters, modalidades, currentFilters }: FiltersPanelProps) => {
  const hasActiveFilters = Object.values(currentFilters).some(value => value && value !== 'all' && value !== 'PRESENCIAL');

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Filtros</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <FilterItem label="Modalidade" value={currentFilters.modalidade} onClear={() => onFilterChange({ modalidade: 'all' })}>
          <Select onValueChange={(value) => onFilterChange({ modalidade: value })} value={currentFilters.modalidade}>
            <SelectTrigger><SelectValue placeholder="Todas as Modalidades" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Modalidades</SelectItem>
              {modalidades.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterItem>

        <FilterItem label="Curso" value={currentFilters.curso} onClear={() => onFilterChange({ curso: 'all' })}>
          <Select onValueChange={(value) => onFilterChange({ curso: value })} value={currentFilters.curso || 'all'}>
            <SelectTrigger><SelectValue placeholder="Todos os Cursos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Cursos</SelectItem>
              {courses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterItem>

        <FilterItem label="Tipo de Matrícula" value={currentFilters.tipoCaptacao} onClear={() => onFilterChange({ tipoCaptacao: 'all' })}>
          <Select onValueChange={(value) => onFilterChange({ tipoCaptacao: value as any })} value={currentFilters.tipoCaptacao || 'all'}>
            <SelectTrigger><SelectValue placeholder="Todos os Tipos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              <SelectItem value="captacao">Captação</SelectItem>
              <SelectItem value="rematricula">Rematrícula</SelectItem>
            </SelectContent>
          </Select>
        </FilterItem>

        <FilterItem label="Status" value={currentFilters.status} onClear={() => onFilterChange({ status: 'all' })}>
          <Select onValueChange={(value) => onFilterChange({ status: value })} value={currentFilters.status || 'all'}>
            <SelectTrigger><SelectValue placeholder="Todos os Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterItem>

        <FilterItem label="Turno" value={currentFilters.turno} onClear={() => onFilterChange({ turno: 'all' })}>
          <Select onValueChange={(value) => onFilterChange({ turno: value })} value={currentFilters.turno || 'all'}>
            <SelectTrigger><SelectValue placeholder="Todos os Turnos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Turnos</SelectItem>
              {shifts.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterItem>

        <FilterItem label="Semestre" value={currentFilters.semestre} onClear={() => onFilterChange({ semestre: 'all' })}>
          <Select onValueChange={(value) => onFilterChange({ semestre: value })} value={currentFilters.semestre || 'all'}>
            <SelectTrigger><SelectValue placeholder="Todos os Semestres" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Semestres</SelectItem>
              {semesters.map(s => <SelectItem key={s} value={s}>{`${s.substring(0,4)}.${s.slice(-1)}`}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterItem>

        <FilterItem label="Semestre de Referência (Evolução)" value={currentFilters.referenceSemester} onClear={() => onFilterChange({ referenceSemester: 'all' })}>
          <Select onValueChange={(value) => onFilterChange({ referenceSemester: value })} value={currentFilters.referenceSemester || 'all'}>
            <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Nenhum</SelectItem>
              {semesters.map(s => <SelectItem key={s} value={s}>{`${s.substring(0,4)}.${s.slice(-1)}`}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterItem>

        {hasActiveFilters && (
          <Button variant="outline" className="w-full" onClick={onClearAllFilters}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Limpar Todos os Filtros
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default FiltersPanel;