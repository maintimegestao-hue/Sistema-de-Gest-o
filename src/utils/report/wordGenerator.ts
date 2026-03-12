
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { ReportData } from './types';

export const generateReportWord = async (reportData: ReportData): Promise<void> => {
  const children = [];
  
  // Cabeçalho com dados da empresa
  if (reportData.company_name) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: reportData.company_name,
            bold: true,
            size: 24,
          }),
        ],
        alignment: 'right',
      })
    );
    
    if (reportData.company_address) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: reportData.company_address,
              size: 16,
            }),
          ],
          alignment: 'right',
        })
      );
    }
    
    if (reportData.company_phone || reportData.company_email) {
      const contactInfo = [reportData.company_phone, reportData.company_email].filter(Boolean).join(' | ');
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: contactInfo,
              size: 16,
            }),
          ],
          alignment: 'right',
        })
      );
    }
    
    // Espaço após cabeçalho
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "" })],
      })
    );
  }
  
  // Título
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: reportData.title,
          bold: true,
          size: 32,
        }),
      ],
      heading: HeadingLevel.TITLE,
    })
  );
  
  // Espaço
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "" })],
    })
  );
  
  // Data do relatório
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Data do Relatório: ",
          bold: true,
        }),
        new TextRun({
          text: new Date(reportData.report_date).toLocaleDateString('pt-BR'),
        }),
      ],
    })
  );
  
  // Data de criação
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Criado em: ",
          bold: true,
        }),
        new TextRun({
          text: new Date(reportData.created_at).toLocaleDateString('pt-BR'),
        }),
      ],
    })
  );
  
  // Espaço
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "" })],
    })
  );

  // Dados do cliente
  if (reportData.clients) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "DADOS DO CLIENTE",
            bold: true,
            size: 20,
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "Nome: ",
            bold: true,
          }),
          new TextRun({
            text: reportData.clients.name,
          }),
        ],
      })
    );

    if (reportData.clients.contact_person) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Contato: ",
              bold: true,
            }),
            new TextRun({
              text: reportData.clients.contact_person,
            }),
          ],
        })
      );
    }

    if (reportData.clients.address) {
      const fullAddress = [
        reportData.clients.address,
        reportData.clients.city,
        reportData.clients.state,
        reportData.clients.zip_code
      ].filter(Boolean).join(', ');

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Endereço: ",
              bold: true,
            }),
            new TextRun({
              text: fullAddress,
            }),
          ],
        })
      );
    }

    if (reportData.clients.phone) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Telefone: ",
              bold: true,
            }),
            new TextRun({
              text: reportData.clients.phone,
            }),
          ],
        })
      );
    }

    if (reportData.clients.email) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Email: ",
              bold: true,
            }),
            new TextRun({
              text: reportData.clients.email,
            }),
          ],
        })
      );
    }

    children.push(
      new Paragraph({
        children: [new TextRun({ text: "" })],
      })
    );
  }
  
  // Adicionar equipamento se houver
  if (reportData.equipments) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Equipamento: ",
            bold: true,
          }),
          new TextRun({
            text: reportData.equipments.name,
          }),
        ],
      })
    );
  }
  
  // Adicionar técnico se houver
  if (reportData.technicians) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "" })],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "TÉCNICO RESPONSÁVEL",
            bold: true,
            size: 20,
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "Nome: ",
            bold: true,
          }),
          new TextRun({
            text: reportData.technicians.name,
          }),
        ],
      })
    );

    if (reportData.technicians.specialization) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Especialização: ",
              bold: true,
            }),
            new TextRun({
              text: reportData.technicians.specialization,
            }),
          ],
        })
      );
    }

    if (reportData.technicians.phone) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Telefone: ",
              bold: true,
            }),
            new TextRun({
              text: reportData.technicians.phone,
            }),
          ],
        })
      );
    }

    if (reportData.technicians.email) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Email: ",
              bold: true,
            }),
            new TextRun({
              text: reportData.technicians.email,
            }),
          ],
        })
      );
    }
  }
  
  // Adicionar descrição se houver
  if (reportData.description) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "" })],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "DESCRIÇÃO DAS ATIVIDADES",
            bold: true,
            size: 20,
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: reportData.description,
          }),
        ],
      })
    );
  }

  // Adicionar URL do anexo se houver
  if (reportData.attachment_url) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "" })],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "ANEXO",
            bold: true,
            size: 20,
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: reportData.attachment_url,
          }),
        ],
      })
    );
  }

  // Adicionar informação sobre fotos se houver
  if (reportData.photos && reportData.photos.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "" })],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `FOTOS ANEXAS: ${reportData.photos.length} foto(s)`,
            bold: true,
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "(As fotos estão disponíveis no sistema)",
          }),
        ],
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });
  
  // Gerar e baixar o arquivo
  const buffer = await Packer.toBlob(doc);
  const fileName = `relatorio_${reportData.title.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
  saveAs(buffer, fileName);
};
