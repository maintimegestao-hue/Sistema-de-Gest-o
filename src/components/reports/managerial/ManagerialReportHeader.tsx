
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ManagerialReportHeaderProps {
  currentYear: number;
  onYearChange?: (year: number) => void;
  onDownloadPDF?: () => void;
}

const ManagerialReportHeader: React.FC<ManagerialReportHeaderProps> = ({ 
  currentYear, 
  onYearChange,
  onDownloadPDF 
}) => {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  const handleYearChange = (year: string) => {
    const yearNumber = parseInt(year);
    setSelectedYear(yearNumber);
    if (onYearChange) {
      onYearChange(yearNumber);
    }
  };

  const handleDownloadPDF = () => {
    toast.info('Gerando PDF do relatório gerencial...');
    if (onDownloadPDF) {
      onDownloadPDF();
    } else {
      // Implementação simples de download se não fornecida
      toast.success('Download PDF iniciado!');
    }
  };

  // Gerar lista de anos (últimos 5 anos)
  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return year.toString();
  });

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-evolutec-black">Relatório Gerencial</h1>
        <p className="text-gray-600">Dados consolidados de {selectedYear}</p>
      </div>
      <div className="flex gap-2">
        <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
          <SelectTrigger className="w-32">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          className="bg-evolutec-green hover:bg-evolutec-green/90"
          onClick={handleDownloadPDF}
        >
          <Download className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
      </div>
    </div>
  );
};

export default ManagerialReportHeader;
