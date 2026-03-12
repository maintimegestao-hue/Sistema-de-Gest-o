
import React, { useState } from 'react';
import { useRealManagerialData } from '@/hooks/useRealManagerialData';
import { downloadManagerialReportAsPDF } from '@/utils/managerialReportDownloader';
import { downloadManagerialReportProAsPDF, type ManagerialReportData } from '@/utils/managerialReportDownloaderPro';
import { exportManagerialToExcel, type ManagerialExcelData } from '@/utils/managerialExcelExporter';
import { toast } from 'sonner';
import ManagerialReportFilters, { type ManagerialFilters } from './managerial/ManagerialReportFilters';
import ManagerialIndicatorCards from './managerial/ManagerialIndicatorCards';
import ManagerialCharts from './managerial/ManagerialCharts';
import EquipmentStatsCard from './managerial/EquipmentStatsCard';
import PreventiveScheduleCard from './managerial/PreventiveScheduleCard';
import LoadingState from './managerial/LoadingState';
import ErrorState from './managerial/ErrorState';
import EmptyState from './managerial/EmptyState';

interface ManagerialReportProps {
  clientId?: string;
}

const ManagerialReport = ({ clientId }: ManagerialReportProps) => {
  const [filters, setFilters] = useState<ManagerialFilters>({
    year: new Date().getFullYear(),
    month: null // null = todos os meses
  });
  
  const { data, isLoading, error, refetch } = useRealManagerialData(filters.year, clientId);

  const handleFiltersChange = (newFilters: ManagerialFilters) => {
    setFilters(newFilters);
    refetch();
  };

  const handleDownloadPDF = async () => {
    try {
      if (!data) {
        toast.error('Não há dados para gerar o relatório');
        return;
      }

      const reportData: ManagerialReportData = {
        year: filters.year,
        month: filters.month,
        clientName: 'Cliente Selecionado', // TODO: Pegar nome do cliente
        summary: data.summary,
        maintenanceByType: data.maintenanceByType || [],
        monthlyData: data.monthlyData || [],
        equipmentStats: data.equipmentStats || [],
        preventiveSchedule: data.preventiveSchedule
      };

      toast.info('Gerando PDF do relatório gerencial...');
      await downloadManagerialReportProAsPDF(reportData);
      toast.success('Download PDF concluído!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF do relatório gerencial');
    }
  };

  const handleDownloadExcel = async () => {
    try {
      if (!data) {
        toast.error('Não há dados para gerar o relatório');
        return;
      }

      // Filtrar dados por mês se necessário
      let filteredData = data;
      if (filters.month) {
        // Aqui você pode implementar a lógica para filtrar os dados por mês
        // Por enquanto, vamos usar os dados completos
      }

      const excelData: ManagerialExcelData = {
        year: filters.year,
        month: filters.month,
        summary: filteredData.summary,
        maintenanceByType: filteredData.maintenanceByType || [],
        monthlyData: filteredData.monthlyData || [],
        equipmentStats: filteredData.equipmentStats || []
      };

      toast.info('Gerando arquivo Excel...');
      await exportManagerialToExcel(excelData);
      toast.success('Download Excel concluído!');
    } catch (error) {
      console.error('Erro ao gerar Excel:', error);
      toast.error('Erro ao gerar arquivo Excel');
    }
  };

  // Função auxiliar para obter nome do mês
  const getMonthName = (month: number): string => {
    const months = [
      '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month] || '';
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  if (!data) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      <ManagerialReportFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onDownloadPDF={handleDownloadPDF}
        onDownloadExcel={handleDownloadExcel}
        isLoading={isLoading}
      />
      <ManagerialIndicatorCards data={data} />
      <ManagerialCharts data={data} />
      <EquipmentStatsCard data={data} />
      <PreventiveScheduleCard data={data} />
    </div>
  );
};

export default ManagerialReport;
