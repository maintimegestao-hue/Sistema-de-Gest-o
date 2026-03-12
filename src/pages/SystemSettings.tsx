
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { Palette, Type, Globe, Bell } from "lucide-react";
import { useSystemSettings, useUpdateSystemSettings } from "@/hooks/useSystemSettings";

type SystemSettingsType = {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: string;
  language: string;
  darkMode: boolean;
  notifications: boolean;
  autoBackup: boolean;
  maintenanceReminders: boolean;
  companyName: string;
  systemTitle: string;
  timeZone: string;
  dateFormat: string;
  currency: string;
};

const SystemSettings = () => {
  const { data: savedSettings, isLoading } = useSystemSettings();
  const updateSettings = useUpdateSystemSettings();
  
  const [settings, setSettings] = useState<SystemSettingsType>({
    primaryColor: "#28a745",
    secondaryColor: "#f5f5f5",
    fontFamily: "Inter",
    fontSize: "medium",
    language: "pt-BR",
    darkMode: false,
    notifications: true,
    autoBackup: true,
    maintenanceReminders: true,
    companyName: "Evolutec Systems",
    systemTitle: "Sistema de Manutenção",
    timeZone: "America/Sao_Paulo",
    dateFormat: "DD/MM/YYYY",
    currency: "BRL"
  });

  // Update local settings when saved settings are loaded
  useEffect(() => {
    if (savedSettings && typeof savedSettings === 'object' && savedSettings !== null) {
      setSettings(savedSettings as SystemSettingsType);
    }
  }, [savedSettings]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const updateSetting = (key: keyof SystemSettingsType, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleRestoreDefaults = () => {
    setSettings({
      primaryColor: "#28a745",
      secondaryColor: "#f5f5f5",
      fontFamily: "Inter",
      fontSize: "medium",
      language: "pt-BR",
      darkMode: false,
      notifications: true,
      autoBackup: true,
      maintenanceReminders: true,
      companyName: "Evolutec Systems",
      systemTitle: "Sistema de Manutenção",
      timeZone: "America/Sao_Paulo",
      dateFormat: "DD/MM/YYYY",
      currency: "BRL"
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-evolutec-green mx-auto mb-2"></div>
            <p className="text-evolutec-text">Carregando configurações...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-evolutec-black">Configurações do Sistema</h1>
          <p className="text-evolutec-text mt-2">
            Personalize a aparência e funcionalidades do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Aparência */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-evolutec-green" />
                Aparência
              </CardTitle>
              <CardDescription>
                Personalize cores, fontes e tema do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Cor Primária</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => updateSetting('primaryColor', e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={settings.primaryColor}
                    onChange={(e) => updateSetting('primaryColor', e.target.value)}
                    placeholder="#28a745"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={settings.secondaryColor}
                    onChange={(e) => updateSetting('secondaryColor', e.target.value)}
                    placeholder="#f5f5f5"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontFamily">Família da Fonte</Label>
                <Select value={settings.fontFamily} onValueChange={(value) => updateSetting('fontFamily', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Lato">Lato</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fontSize">Tamanho da Fonte</Label>
                <Select value={settings.fontSize} onValueChange={(value) => updateSetting('fontSize', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Pequena</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="large">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="darkMode">Modo Escuro</Label>
                <Switch
                  id="darkMode"
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => updateSetting('darkMode', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configurações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-evolutec-green" />
                Configurações Gerais
              </CardTitle>
              <CardDescription>
                Idioma, fuso horário e formato de dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Idioma</Label>
                <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (United States)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeZone">Fuso Horário</Label>
                <Select value={settings.timeZone} onValueChange={(value) => updateSetting('timeZone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/Sao_Paulo">América/São Paulo</SelectItem>
                    <SelectItem value="America/New_York">América/Nova York</SelectItem>
                    <SelectItem value="Europe/London">Europa/Londres</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFormat">Formato de Data</Label>
                <Select value={settings.dateFormat} onValueChange={(value) => updateSetting('dateFormat', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/AAAA</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/AAAA</SelectItem>
                    <SelectItem value="YYYY-MM-DD">AAAA-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Moeda</Label>
                <Select value={settings.currency} onValueChange={(value) => updateSetting('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                    <SelectItem value="USD">Dólar Americano ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5 text-evolutec-green" />
                Informações da Empresa
              </CardTitle>
              <CardDescription>
                Configure os dados da sua empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input
                  id="companyName"
                  value={settings.companyName}
                  onChange={(e) => updateSetting('companyName', e.target.value)}
                  placeholder="Nome da sua empresa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemTitle">Título do Sistema</Label>
                <Input
                  id="systemTitle"
                  value={settings.systemTitle}
                  onChange={(e) => updateSetting('systemTitle', e.target.value)}
                  placeholder="Título que aparece no sistema"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notificações e Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-evolutec-green" />
                Notificações e Sistema
              </CardTitle>
              <CardDescription>
                Configure alertas e funcionalidades do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Notificações</Label>
                  <p className="text-sm text-evolutec-text">Receber notificações do sistema</p>
                </div>
                <Switch
                  id="notifications"
                  checked={settings.notifications}
                  onCheckedChange={(checked) => updateSetting('notifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoBackup">Backup Automático</Label>
                  <p className="text-sm text-evolutec-text">Realizar backup automático dos dados</p>
                </div>
                <Switch
                  id="autoBackup"
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => updateSetting('autoBackup', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenanceReminders">Lembretes de Manutenção</Label>
                  <p className="text-sm text-evolutec-text">Enviar lembretes automáticos</p>
                </div>
                <Switch
                  id="maintenanceReminders"
                  checked={settings.maintenanceReminders}
                  onCheckedChange={(checked) => updateSetting('maintenanceReminders', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={handleRestoreDefaults}>
            Restaurar Padrões
          </Button>
          <Button 
            onClick={handleSave} 
            className="evolutec-btn"
            disabled={updateSettings.isPending}
          >
            {updateSettings.isPending ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SystemSettings;
