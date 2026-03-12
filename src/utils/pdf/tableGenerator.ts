
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDFTable = (
  doc: jsPDF,
  tableRows: string[][],
  cellStyles: any,
  startY: number
) => {
  const tableHeaders = [
    'Equipamento',
    'Local/Cliente',
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  autoTable(doc, {
    head: [tableHeaders],
    body: tableRows,
    startY: startY,
    theme: 'grid',
    headStyles: {
      fillColor: [34, 197, 94], // verde evolutec
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 10,
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: {
      fontSize: 8,
      halign: 'center',
      valign: 'middle',
      cellPadding: 2
    },
    columnStyles: {
      0: { 
        cellWidth: 45, 
        halign: 'left',
        fontSize: 7,
        cellPadding: 3
      },
      1: { 
        cellWidth: 40, 
        halign: 'left',
        fontSize: 7,
        cellPadding: 3
      },
      // Colunas dos meses
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 15, halign: 'center' },
      6: { cellWidth: 15, halign: 'center' },
      7: { cellWidth: 15, halign: 'center' },
      8: { cellWidth: 15, halign: 'center' },
      9: { cellWidth: 15, halign: 'center' },
      10: { cellWidth: 15, halign: 'center' },
      11: { cellWidth: 15, halign: 'center' },
      12: { cellWidth: 15, halign: 'center' },
      13: { cellWidth: 15, halign: 'center' }
    },
    margin: { left: 10, right: 10 },
    tableWidth: 'auto',
    styles: {
      cellPadding: 2,
      lineColor: [128, 128, 128],
      lineWidth: 0.5,
      fontSize: 8
    },
    didParseCell: function(data) {
      // Aplicar cores de fundo baseadas no status
      if (data.row.index < tableRows.length && cellStyles[data.row.index] && cellStyles[data.row.index][data.column.index]) {
        data.cell.styles.fillColor = cellStyles[data.row.index][data.column.index].fillColor;
      }
      
      // Destacar células dos meses com fonte em negrito
      if (data.column.index >= 2 && data.cell.text && data.cell.text[0] && data.cell.text[0].trim() !== '') {
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });
};
