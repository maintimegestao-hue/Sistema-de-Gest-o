import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import SignatureCanvas from 'react-signature-canvas';
import { supabase } from '@/integrations/supabase/client';
import { Wrench, CheckCircle, AlertCircle } from 'lucide-react';
import { checklists } from '@/components/maintenance/MaintenanceChecklists';

const PublicMaintenance = () => {
  const { equipmentId } = useParams<{ equipmentId: string }>();
  const navigate = useNavigate();
  const signatureRef = useRef<SignatureCanvas>(null);

  const [equipment, setEquipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [maintenanceType, setMaintenanceType] = useState('preventive');
  const [periodicity, setPeriodicity] = useState('monthly');
  const [checklist, setChecklist] = useState<{[key: string]: boolean}>({});
  const [observations, setObservations] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [digitalSignature, setDigitalSignature] = useState('');

  useEffect(() => {
    if (equipmentId) {
      loadEquipment();
      checkTodaysSubmission();
    }
  }, [equipmentId]);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('equipments')
        .select('*')
        .eq('id', equipmentId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Equipamento não encontrado');

      setEquipment(data);
    } catch (err: any) {
      setError('Equipamento não encontrado ou link inválido');
      console.error('Error loading equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkTodaysSubmission = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('maintenance_orders')
        .select('id')
        .eq('equipment_id', equipmentId)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)
        .eq('status', 'completed');

      if (data && data.length > 0) {
        setSubmitted(true);
        setError('Já foi registrada uma manutenção para este equipamento hoje.');
      }
    } catch (err) {
      console.error('Error checking submissions:', err);
    }
  };

  const getCurrentChecklist = () => {
    if (maintenanceType === 'preventive' && periodicity) {
      return checklists[periodicity as keyof typeof checklists] || [];
    }
    if (maintenanceType === 'corrective') {
      return checklists.corrective;
    }
    if (maintenanceType === 'predictive') {
      return checklists.predictive;
    }
    return [];
  };

  const handleChecklistChange = (item: string, checked: boolean) => {
    setChecklist(prev => ({
      ...prev,
      [item]: checked
    }));
  };

  const handleSaveSignature = () => {
    if (signatureRef.current && !signatureRef.current.isEmpty()) {
      const signatureData = signatureRef.current.toDataURL();
      setDigitalSignature(signatureData);
    }
  };

  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setDigitalSignature('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!technicianName.trim() || !digitalSignature || observations.trim().length < 3) {
      setError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const currentChecklist = getCurrentChecklist();
    const checkedItems = currentChecklist.filter(item => checklist[item]);
    
    if (currentChecklist.length > 0 && checkedItems.length === 0) {
      setError('Por favor, marque pelo menos um item do checklist');
      return;
    }

    try {
      setSubmitting(true);
      
      const now = new Date();
      const description = `${maintenanceType === 'preventive' ? 'Manutenção Preventiva' : 
                          maintenanceType === 'corrective' ? 'Manutenção Corretiva' : 
                          'Manutenção Preditiva'}${periodicity ? ` - ${periodicity}` : ''}

📅 Executada em: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}h
👤 Técnico: ${technicianName}
✍️ Acesso via QR Code - Técnico Externo
🎯 Acesso direto sem login

🔧 Itens realizados:
${checkedItems.map(item => `• ${item}`).join('\n')}

📝 Observações: ${observations}

🏷️ Equipamento: ${equipment.name}
📍 Local: ${equipment.installation_location || 'Não informado'}`;

      // For public maintenance, we don't have a user_id, so we'll use the equipment's user_id
      const { data, error } = await supabase
        .from('maintenance_orders')
        .insert({
          equipment_id: equipmentId,
          description,
          maintenance_type: maintenanceType as 'preventive' | 'corrective' | 'predictive',
          priority: 'medium',
          status: 'completed',
          scheduled_date: new Date().toISOString().split('T')[0],
          user_id: equipment.user_id
        })
        .select()
        .single();

      if (error) throw error;

      setSubmitted(true);
      setError('');
      
    } catch (err: any) {
      console.error('Error submitting maintenance:', err);
      setError('Erro ao registrar manutenção. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando equipamento...</p>
        </div>
      </div>
    );
  }

  if (error && !equipment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Equipamento não encontrado</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">✅ Manutenção registrada com sucesso!</h2>
          <p className="text-gray-600 mb-4">Obrigado pelo serviço realizado.</p>
          <div className="text-sm text-gray-500">
            <p>Equipamento: {equipment?.name}</p>
            <p>Data: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>
    );
  }

  const currentChecklist = getCurrentChecklist();
  const isFormValid = technicianName.trim() && digitalSignature && observations.trim().length >= 3 &&
                     (currentChecklist.length === 0 || currentChecklist.some(item => checklist[item]));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6">
            <div className="flex items-center space-x-3">
              <Wrench className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Checklist de Manutenção</h1>
                <p className="text-blue-100">Acesso via QR Code</p>
              </div>
            </div>
          </div>

          {/* Equipment Info */}
          <div className="p-6 bg-blue-50 border-b">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{equipment.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Local:</span> {equipment.installation_location || 'Não informado'}
              </div>
              <div>
                <span className="font-medium">Status:</span> {equipment.status}
              </div>
              {equipment.serial_number && (
                <div>
                  <span className="font-medium">Série:</span> {equipment.serial_number}
                </div>
              )}
              {equipment.model && (
                <div>
                  <span className="font-medium">Modelo:</span> {equipment.model}
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Maintenance Type */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Tipo de Manutenção *</Label>
              <div className="space-y-2">
                {[
                  { value: 'preventive', label: 'Preventiva' },
                  { value: 'corrective', label: 'Corretiva' },
                  { value: 'predictive', label: 'Preditiva' }
                ].map((type) => (
                  <label key={type.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="maintenanceType"
                      value={type.value}
                      checked={maintenanceType === type.value}
                      onChange={(e) => setMaintenanceType(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Periodicity for Preventive */}
            {maintenanceType === 'preventive' && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Periodicidade</Label>
                <select
                  value={periodicity}
                  onChange={(e) => setPeriodicity(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="monthly">Mensal</option>
                  <option value="bimonthly">Bimestral</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="semestral">Semestral</option>
                  <option value="annual">Anual</option>
                </select>
              </div>
            )}

            {/* Checklist */}
            {currentChecklist.length > 0 && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Checklist de Verificação *</Label>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  {currentChecklist.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Checkbox
                        id={`item-${index}`}
                        checked={checklist[item] || false}
                        onCheckedChange={(checked) => handleChecklistChange(item, checked as boolean)}
                      />
                      <Label 
                        htmlFor={`item-${index}`}
                        className="text-sm leading-relaxed cursor-pointer"
                      >
                        {item}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technician Name */}
            <div className="space-y-2">
              <Label htmlFor="technicianName" className="text-base font-semibold">
                Nome do Técnico *
              </Label>
              <Input
                id="technicianName"
                type="text"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                placeholder="Digite seu nome completo"
                className="text-base p-3"
                required
              />
            </div>

            {/* Observations */}
            <div className="space-y-2">
              <Label htmlFor="observations" className="text-base font-semibold">
                Observações * (mínimo 3 caracteres)
              </Label>
              <Textarea
                id="observations"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Descreva os procedimentos realizados, condições encontradas, etc."
                className="text-base p-3 min-h-24"
                required
              />
              <p className="text-sm text-gray-500">{observations.length} caracteres</p>
            </div>

            {/* Digital Signature */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Assinatura Digital *</Label>
              <div className="border-2 border-gray-300 rounded-lg p-4">
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    width: 400,
                    height: 150,
                    className: 'signature-canvas w-full border rounded'
                  }}
                />
                <div className="flex space-x-2 mt-3">
                  <Button
                    type="button"
                    onClick={handleSaveSignature}
                    variant="outline"
                    size="sm"
                  >
                    Salvar Assinatura
                  </Button>
                  <Button
                    type="button"
                    onClick={handleClearSignature}
                    variant="outline"
                    size="sm"
                  >
                    Limpar
                  </Button>
                </div>
                {digitalSignature && (
                  <p className="text-sm text-green-600 mt-2">✅ Assinatura salva</p>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isFormValid || submitting}
              className={`w-full text-lg py-3 ${isFormValid ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              {submitting ? 'Registrando...' : 'Finalizar Manutenção'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicMaintenance;
