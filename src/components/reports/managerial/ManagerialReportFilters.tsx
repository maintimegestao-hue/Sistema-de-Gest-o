import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, FileText, Filter } from 'lucide-react';

export interface ManagerialFilters {
  year: number;
  month: number | null; // null significa "todos os meses"
}

interface ManagerialReportFiltersProps {
  filters: ManagerialFilters;
  onFiltersChange: (filters: ManagerialFilters) => void;
  onDownloadPDF: () => void;
  onDownloadExcel: () => void;
  isLoading?: boolean;
}

const ManagerialReportFilters: React.FC<ManagerialReportFiltersProps> = ({
  filters,
  onFiltersChange,
  onDownloadPDF,
  onDownloadExcel,
  isLoading = false
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
  const months = [
    { value: null, label: 'Todos os meses' },
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  const handleYearChange = (value: string) => {
    onFiltersChange({
      ...filters,
      year: parseInt(value)
    });
  };

  const handleMonthChange = (value: string) => {
    onFiltersChange({
      ...filters,
      month: value === 'all' ? null : parseInt(value)
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Filtros do Relatório Gerencial</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 flex-1">
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Ano
              </label>
              <Select value={filters.year.toString()} onValueChange={handleYearChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Mês
              </label>
              <Select 
                value={filters.month?.toString() || 'all'} 
                onValueChange={handleMonthChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar mês" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value || 'all'} value={month.value?.toString() || 'all'}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botões de Download */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDownloadPDF}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>PDF</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onDownloadExcel}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Excel</span>
            </Button>
          </div>
        </div>
        
        {/* Período selecionado */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Período selecionado:</strong> {' '}
            {filters.month 
              ? `${months.find(m => m.value === filters.month)?.label} de ${filters.year}`
              : `Todo o ano de ${filters.year}`
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManagerialReportFilters;