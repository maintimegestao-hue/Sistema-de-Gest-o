import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientAuth } from '@/hooks/useClientAuth';
import { useClientEquipments } from '@/hooks/useClientEquipments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, QrCode, Camera, Keyboard } from 'lucide-react';
import ClientQRScanner from '@/components/client/ClientQRScanner';
import { toast } from 'sonner';

const ClientServiceCallQRScanner = () => {
  const { clientData } = useClientAuth();
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const { data: equipments } = useClientEquipments(clientData?.clientId);

  const handleQRCodeDetected = (qrData: string) => {
    handleEquipmentFound(qrData);
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      toast.error('Digite o código do equipamento');
      return;
    }
    handleEquipmentFound(manualCode);
  };

  const handleEquipmentFound = (qrCode: string) => {
    const code = (qrCode || '').trim();

    // Tentar extrair UUID de um link (caso o QR contenha URL)
    const uuidMatch = code.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
    const possibleId = uuidMatch ? uuidMatch[0] : null;

    // Buscar equipamento pelo QR code exato, pelo ID encontrado ou pelo próprio código
    const equipment = equipments?.find(eq => (
      (eq.qr_code && (eq.qr_code === code || eq.qr_code.includes(code))) ||
      (possibleId && eq.id === possibleId) ||
      eq.id === code
    ) && eq.client_id === clientData?.clientId);

    if (equipment) {
      toast.success(`Equipamento encontrado: ${equipment.name}`);
      navigate(`/client-service-call/form/${equipment.id}`);
    } else {
      toast.error('Equipamento não encontrado ou não pertence ao seu cliente');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/client-service-call')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 rounded-lg p-2">
                  <QrCode className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Escanear QR Code
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {clientData?.clientName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showScanner && !showManualInput ? (
          <>
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Como você gostaria de identificar o equipamento?
              </h2>
              <p className="text-muted-foreground">
                Use a câmera ou digite o código manualmente
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Escanear com câmera */}
              <Card 
                className="hover:shadow-lg transition-shadow cursor-pointer h-64" 
                onClick={() => setShowScanner(true)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 rounded-lg p-4">
                      <Camera className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Usar Câmera</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Escaneie automaticamente
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Aponte a câmera do seu dispositivo para o código QR localizado no equipamento.
                  </p>
                  <div className="flex items-center text-sm text-primary font-medium">
                    <span>Abrir câmera</span>
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </div>
                </CardContent>
              </Card>

              {/* Entrada manual */}
              <Card 
                className="hover:shadow-lg transition-shadow cursor-pointer h-64" 
                onClick={() => setShowManualInput(true)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 rounded-lg p-4">
                      <Keyboard className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Digitar Código</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Inserir manualmente
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Digite o código do equipamento encontrado na etiqueta ou placa de identificação.
                  </p>
                  <div className="flex items-center text-sm text-primary font-medium">
                    <span>Inserir código</span>
                    <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : showScanner ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Aponte a câmera para o QR Code
              </h2>
              <p className="text-muted-foreground">
                Posicione o código QR dentro da área de scan
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <ClientQRScanner
                onQRCodeDetected={handleQRCodeDetected}
                onClose={() => setShowScanner(false)}
              />
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => setShowScanner(false)}>
                Voltar
              </Button>
              <Button variant="outline" onClick={() => {
                setShowScanner(false);
                setShowManualInput(true);
              }}>
                Digitar código manualmente
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Digite o código do equipamento
              </h2>
              <p className="text-muted-foreground">
                Insira o código encontrado na etiqueta do equipamento
              </p>
            </div>

            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Código do Equipamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Ex: EQ-001-2024"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleManualSubmit();
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowManualInput(false)} className="flex-1">
                    Voltar
                  </Button>
                  <Button onClick={handleManualSubmit} className="flex-1">
                    Confirmar
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button variant="link" onClick={() => {
                setShowManualInput(false);
                setShowScanner(true);
              }}>
                Ou use a câmera para escanear
              </Button>
            </div>
          </div>
        )}

        {/* Instruções */}
        {!showScanner && !showManualInput && (
          <div className="mt-8 p-6 bg-white rounded-lg border">
            <h3 className="text-lg font-semibold mb-3">Onde encontrar o código:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Etiqueta de identificação no equipamento</li>
              <li>• Placa de dados técnicos</li>
              <li>• Painel frontal ou lateral do equipamento</li>
              <li>• Manual ou documentação do equipamento</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientServiceCallQRScanner;