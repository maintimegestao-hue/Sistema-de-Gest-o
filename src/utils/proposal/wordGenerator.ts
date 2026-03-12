
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { ProposalData } from './types';

export const generateProposalWord = async (proposalData: ProposalData): Promise<void> => {
  const children = [];
  
  // Cabeçalho com dados da empresa
  if (proposalData.company_name) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: proposalData.company_name,
            bold: true,
            size: 24,
          }),
        ],
        alignment: 'right',
      })
    );
    
    if (proposalData.company_address) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: proposalData.company_address,
              size: 16,
            }),
          ],
          alignment: 'right',
        })
      );
    }
    
    if (proposalData.company_phone || proposalData.company_email) {
      const contactInfo = [proposalData.company_phone, proposalData.company_email].filter(Boolean).join(' | ');
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
          text: proposalData.title,
          bold: true,
          size: 32,
        }),
      ],
      heading: HeadingLevel.TITLE,
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Proposta: ${proposalData.proposal_number}`,
          bold: true,
        }),
      ],
    })
  );
  
  // Dados do cliente
  if (proposalData.clients) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "" })],
      }),
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
            text: proposalData.clients.name,
          }),
        ],
      })
    );

    if (proposalData.clients.contact_person) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Contato: ",
              bold: true,
            }),
            new TextRun({
              text: proposalData.clients.contact_person,
            }),
          ],
        })
      );
    }

    if (proposalData.clients.address) {
      const fullAddress = [
        proposalData.clients.address,
        proposalData.clients.city,
        proposalData.clients.state,
        proposalData.clients.zip_code
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

    if (proposalData.clients.phone) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Telefone: ",
              bold: true,
            }),
            new TextRun({
              text: proposalData.clients.phone,
            }),
          ],
        })
      );
    }

    if (proposalData.clients.email) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Email: ",
              bold: true,
            }),
            new TextRun({
              text: proposalData.clients.email,
            }),
          ],
        })
      );
    }
  }

  // Responsável pela execução
  if (proposalData.executor_name) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "" })],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "RESPONSÁVEL PELA EXECUÇÃO",
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
            text: proposalData.executor_name,
          }),
        ],
      })
    );

    if (proposalData.executor_title) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Cargo: ",
              bold: true,
            }),
            new TextRun({
              text: proposalData.executor_title,
            }),
          ],
        })
      );
    }
  }

  // Equipamento
  if (proposalData.equipments) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Equipamento: ",
            bold: true,
          }),
          new TextRun({
            text: proposalData.equipments.name,
          }),
        ],
      })
    );
  }

  // Escopo do trabalho
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "" })],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "ESCOPO DO TRABALHO",
          bold: true,
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: proposalData.scope_of_work,
        }),
      ],
    })
  );

  // Descrição adicional
  if (proposalData.description) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "" })],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "DESCRIÇÃO ADICIONAL",
            bold: true,
            size: 20,
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: proposalData.description,
          }),
        ],
      })
    );
  }

  // Valores
  const subtotal = proposalData.labor_cost + proposalData.materials_cost;
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "" })],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "VALORES",
          bold: true,
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Mão de obra: R$ ${proposalData.labor_cost.toFixed(2)}`,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Materiais: R$ ${proposalData.materials_cost.toFixed(2)}`,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Subtotal: R$ ${subtotal.toFixed(2)}`,
        }),
      ],
    })
  );

  if (proposalData.discount_percentage && proposalData.discount_percentage > 0) {
    const discountAmount = (subtotal * proposalData.discount_percentage) / 100;
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Desconto (${proposalData.discount_percentage}%): R$ ${discountAmount.toFixed(2)}`,
          }),
        ],
      })
    );
  }

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `TOTAL: R$ ${proposalData.total_cost.toFixed(2)}`,
          bold: true,
          size: 24,
        }),
      ],
    })
  );

  // Condições de pagamento
  if (proposalData.payment_method) {
    const paymentText = proposalData.payment_method === 'avista' ? 'À vista' : 'Faturado';
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "" })],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "CONDIÇÕES DE PAGAMENTO",
            bold: true,
            size: 20,
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: paymentText,
          }),
        ],
      })
    );
  }

  // Informações gerais
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "" })],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "INFORMAÇÕES GERAIS",
          bold: true,
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Validade da proposta: ${proposalData.validity_days} dias`,
        }),
      ],
    })
  );

  if (proposalData.estimated_duration) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Duração estimada: ${proposalData.estimated_duration} dias`,
          }),
        ],
      })
    );
  }

  if (proposalData.start_date) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Data de início: ${new Date(proposalData.start_date).toLocaleDateString('pt-BR')}`,
          }),
        ],
      })
    );
  }

  if (proposalData.end_date) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Data de término: ${new Date(proposalData.end_date).toLocaleDateString('pt-BR')}`,
          }),
        ],
      })
    );
  }

  // Termos e condições
  if (proposalData.terms_and_conditions) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "" })],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "TERMOS E CONDIÇÕES",
            bold: true,
            size: 20,
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: proposalData.terms_and_conditions,
          }),
        ],
      })
    );
  }

  // Observações
  if (proposalData.notes) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "" })],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "OBSERVAÇÕES",
            bold: true,
            size: 20,
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: proposalData.notes,
          }),
        ],
      })
    );
  }

  // Fotos anexas
  if (proposalData.photos && proposalData.photos.length > 0) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "" })],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "FOTOS ANEXADAS",
            bold: true,
            size: 20,
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Total de ${proposalData.photos.length} foto(s) anexada(s) na proposta.`,
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "Observação: Para visualizar as fotos em tamanho completo, acesse o sistema ou solicite o arquivo PDF da proposta.",
            italics: true,
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
  const fileName = `proposta_${proposalData.proposal_number.replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
  saveAs(buffer, fileName);
};
