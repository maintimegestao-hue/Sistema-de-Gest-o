import React, { useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile, useUpdateUserProfile } from "@/hooks/useUserProfile";
import { Camera, Save, Building, User, Upload, Palette } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const CompanySettings = () => {
  const { data: userProfile, isLoading } = useUserProfile();
  const updateProfile = useUpdateUserProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const profileImageRef = useRef<HTMLInputElement>(null);
  const logoImageRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    position: "",
    department: "",
    cnpj: "",
    company_name: "",
    company_address: "",
    company_cep: "",
    company_email: "",
    profile_photo_url: "",
    company_logo_url: "",
    brand_primary_color: "#22C55E",
    brand_secondary_color: "#16A34A",
    brand_accent_color: "#15803D"
  });

  // Atualizar formData quando userProfile carregar
  React.useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || "",
        phone: userProfile.phone || "",
        position: userProfile.position || "",
        department: userProfile.department || "",
        cnpj: userProfile.cnpj || "",
        company_name: userProfile.company_name || "",
        company_address: userProfile.company_address || "",
        company_cep: userProfile.company_cep || "",
        company_email: userProfile.company_email || "",
        profile_photo_url: userProfile.profile_photo_url || "",
        company_logo_url: userProfile.company_logo_url || "",
        brand_primary_color: userProfile.brand_primary_color || "#22C55E",
        brand_secondary_color: userProfile.brand_secondary_color || "#16A34A",
        brand_accent_color: userProfile.brand_accent_color || "#15803D"
      });
    }
  }, [userProfile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const uploadImage = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('maintenance-attachments')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('maintenance-attachments')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const extractColorsFromImage = async (imageUrl: string): Promise<{
    primary: string;
    secondary: string;
    accent: string;
  }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData?.data;
        
        if (!data) {
          resolve({
            primary: "#22C55E",
            secondary: "#16A34A", 
            accent: "#15803D"
          });
          return;
        }

        // Algoritmo simples para extrair cores dominantes
        const colorCount: { [key: string]: number } = {};
        
        for (let i = 0; i < data.length; i += 4 * 10) { // Amostrar a cada 10 pixels
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const alpha = data[i + 3];
          
          if (alpha < 128) continue; // Pular pixels transparentes
          
          const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          colorCount[hex] = (colorCount[hex] || 0) + 1;
        }
        
        const sortedColors = Object.entries(colorCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([color]) => color);
        
        resolve({
          primary: sortedColors[0] || "#22C55E",
          secondary: sortedColors[1] || "#16A34A",
          accent: sortedColors[2] || "#15803D"
        });
      };
      
      img.onerror = () => {
        resolve({
          primary: "#22C55E",
          secondary: "#16A34A",
          accent: "#15803D"
        });
      };
      
      img.src = imageUrl;
    });
  };

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingProfile(true);
    try {
      const imageUrl = await uploadImage(file, 'profile-photos');
      setFormData(prev => ({ ...prev, profile_photo_url: imageUrl }));
      toast.success("Foto de perfil enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
      toast.error("Erro ao enviar foto de perfil");
    } finally {
      setIsUploadingProfile(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const imageUrl = await uploadImage(file, 'company-logos');
      setFormData(prev => ({ ...prev, company_logo_url: imageUrl }));
      
      // Extrair cores do logo
      const colors = await extractColorsFromImage(imageUrl);
      setFormData(prev => ({
        ...prev,
        brand_primary_color: colors.primary,
        brand_secondary_color: colors.secondary,
        brand_accent_color: colors.accent
      }));
      
      toast.success("Logo enviado e cores extraídas com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload do logo:", error);
      toast.error("Erro ao enviar logo da empresa");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile.mutateAsync(formData);
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  const formatCNPJ = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const getUserInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações da Empresa</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as informações da sua empresa e personalize a identidade visual
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Foto de Perfil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User size={20} />
                <span>Foto de Perfil</span>
              </CardTitle>
              <CardDescription>
                Sua foto pessoal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={formData.profile_photo_url} alt={formData.full_name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {getUserInitials(formData.full_name)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => profileImageRef.current?.click()}
                  disabled={isUploadingProfile}
                  className="w-full"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {isUploadingProfile ? "Enviando..." : "Alterar Foto"}
                </Button>
                <input
                  ref={profileImageRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground text-center">
                  JPG, PNG ou GIF (máx. 5MB)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Logo da Empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building size={20} />
                <span>Logo da Empresa</span>
              </CardTitle>
              <CardDescription>
                Logotipo usado nas propostas e relatórios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center overflow-hidden">
                  {formData.company_logo_url ? (
                    <img 
                      src={formData.company_logo_url} 
                      alt="Logo da empresa" 
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <Building className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => logoImageRef.current?.click()}
                  disabled={isUploadingLogo}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploadingLogo ? "Enviando..." : "Enviar Logo"}
                </Button>
                <input
                  ref={logoImageRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground text-center">
                  PNG ou SVG preferível (máx. 5MB)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cores da Marca */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette size={20} />
                <span>Cores da Marca</span>
              </CardTitle>
              <CardDescription>
                Cores extraídas automaticamente do logo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full border border-border"
                    style={{ backgroundColor: formData.brand_primary_color }}
                  ></div>
                  <div className="flex-1">
                    <Label className="text-xs">Cor Primária</Label>
                    <Input
                      type="color"
                      value={formData.brand_primary_color}
                      onChange={(e) => handleInputChange("brand_primary_color", e.target.value)}
                      className="h-8 w-full"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full border border-border"
                    style={{ backgroundColor: formData.brand_secondary_color }}
                  ></div>
                  <div className="flex-1">
                    <Label className="text-xs">Cor Secundária</Label>
                    <Input
                      type="color"
                      value={formData.brand_secondary_color}
                      onChange={(e) => handleInputChange("brand_secondary_color", e.target.value)}
                      className="h-8 w-full"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full border border-border"
                    style={{ backgroundColor: formData.brand_accent_color }}
                  ></div>
                  <div className="flex-1">
                    <Label className="text-xs">Cor de Destaque</Label>
                    <Input
                      type="color"
                      value={formData.brand_accent_color}
                      onChange={(e) => handleInputChange("brand_accent_color", e.target.value)}
                      className="h-8 w-full"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações Pessoais e da Empresa */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Seus dados pessoais e profissionais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  placeholder="João Silva"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Cargo</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange("position", e.target.value)}
                  placeholder="Gerente de Manutenção"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  placeholder="Manutenção"
                />
              </div>
            </CardContent>
          </Card>

          {/* Informações da Empresa */}
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>
                Dados da sua empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Nome da Empresa *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange("company_name", e.target.value)}
                  placeholder="MinhaEmpresa Ltda"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => handleInputChange("cnpj", formatCNPJ(e.target.value))}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_address">Endereço da Empresa</Label>
                <Textarea
                  id="company_address"
                  value={formData.company_address}
                  onChange={(e) => handleInputChange("company_address", e.target.value)}
                  placeholder="Rua Example, 123 - Centro, São Paulo - SP"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_cep">CEP</Label>
                  <Input
                    id="company_cep"
                    value={formData.company_cep}
                    onChange={(e) => handleInputChange("company_cep", e.target.value)}
                    placeholder="00000-000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_email">E-mail da Empresa</Label>
                  <Input
                    id="company_email"
                    type="email"
                    value={formData.company_email}
                    onChange={(e) => handleInputChange("company_email", e.target.value)}
                    placeholder="contato@empresa.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving || updateProfile.isPending}
            className="min-w-[150px]"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving || updateProfile.isPending ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanySettings;