import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Palette, Download, RotateCcw, Minimize2, Maximize2, Minus, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export interface PDFCustomizationOptions {
  fontFamily: string;
  fontSize: number;
  fontStyle: string;
  headerBackgroundColor: string;
  headerTextColor: string;
  titleBackgroundColor: string;
  titleTextColor: string;
  useLogoColor: boolean;
  logoColors: string[];
  logoUrl?: string;
  logoScale?: number; // 0.5 - 2.0
  logoWidth?: number; // Largura do logo (0.5 - 3.0)
  logoHeight?: number; // Altura do logo (0.5 - 3.0)
  logoPosition?: 'left' | 'center' | 'right'; // Posição do logo
  titleSpacing?: number; // Espaçamento do título (5 - 30)
  sectionSpacing?: number; // Espaçamento da seção (5 - 30)
  contentPaddingTop?: number; // Padding superior do conteúdo (5 - 30)
  contentPaddingBottom?: number; // Padding inferior do conteúdo (5 - 30)
  preview?: boolean;
}

interface PDFCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadOriginal: () => void;
  onDownloadCustomized: (options: PDFCustomizationOptions) => void;
  title: string;
  logoUrl?: string;
  onPreview?: (options: PDFCustomizationOptions) => Promise<string>;
  showLogoScale?: boolean;
  showLogoWidth?: boolean;
  showLogoHeight?: boolean;
  showLogoPosition?: boolean;
  showSpacingControls?: boolean;
  showTitleSpacing?: boolean;
  showSectionSpacing?: boolean;
  showContentPadding?: boolean;
}

const PDFCustomizationModal: React.FC<PDFCustomizationModalProps> = ({
  isOpen,
  onClose,
  onDownloadOriginal,
  onDownloadCustomized,
  title,
  logoUrl,
  onPreview,
  showLogoScale = false,
  showLogoWidth = false,
  showLogoHeight = false,
  showLogoPosition = false,
  showSpacingControls = false,
  showTitleSpacing = false,
  showSectionSpacing = false,
  showContentPadding = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [logoColors, setLogoColors] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [options, setOptions] = useState<PDFCustomizationOptions>({
    fontFamily: 'Arial',
    fontSize: 12,
    fontStyle: 'normal',
    headerBackgroundColor: '#22c55e',
    headerTextColor: '#ffffff',
    titleBackgroundColor: '#1f2937',
    titleTextColor: '#ffffff',
    useLogoColor: true, // Padrão: usar cores do logo
    logoColors: [],
    logoUrl: logoUrl,
    logoScale: 1,
    logoWidth: 1,
    logoHeight: 1,
    logoPosition: 'left', // Posição padrão do logo
    titleSpacing: 15,
    sectionSpacing: 12,
    contentPaddingTop: 10,
    contentPaddingBottom: 10
  });


  // Load saved parameters
  useEffect(() => {
    if (isOpen) {
      const savedParams = localStorage.getItem('pdfCustomizationOptions');
      if (savedParams) {
        try {
          const parsed = JSON.parse(savedParams);
          setOptions(prev => ({
            ...prev,
            ...parsed,
            logoUrl: logoUrl, // Always use current logoUrl
            logoColors: logoColors.length > 0 ? logoColors : parsed.logoColors || []
          }));
        } catch (error) {
          console.error('Erro ao carregar parâmetros salvos:', error);
        }
      }
    }
  }, [isOpen, logoUrl, logoColors]);

  // Extrair cores do logo de forma otimizada
  useEffect(() => {
    if (logoUrl && isOpen && logoColors.length === 0) {
      // Usar setTimeout para não bloquear a UI
      setTimeout(() => {
        extractColorsFromLogo(logoUrl);
      }, 100);
    }
  }, [logoUrl, isOpen]);

  // Aplicar cores do logo como padrão quando disponíveis
  useEffect(() => {
    if (logoColors.length > 0) {
      setOptions(prev => ({
        ...prev,
        headerBackgroundColor: logoColors[0] || '#22c55e',
        titleBackgroundColor: logoColors[1] || logoColors[0] || '#1f2937',
        logoColors: logoColors,
        logoUrl: logoUrl,
        logoScale: 1,
        logoWidth: 1,
        logoHeight: 1,
        logoPosition: 'left',
        titleSpacing: 15,
        sectionSpacing: 12,
        contentPaddingTop: 10,
        contentPaddingBottom: 10
      }));
    }
  }, [logoColors]);

  const extractColorsFromLogo = async (imageUrl: string) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const colors = extractDominantColors(imageData);
        setLogoColors(colors);
        setOptions(prev => ({ ...prev, logoColors: colors }));
      };
      
      img.src = imageUrl;
    } catch (error) {
      console.error('Erro ao extrair cores do logo:', error);
    }
  };

  const extractDominantColors = (imageData: ImageData): string[] => {
    const colorMap = new Map<string, number>();
    const data = imageData.data;
    
    // Analisar pixels do logo (pular alguns para performance)
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      // Ignorar pixels transparentes ou muito claros/escuros
      if (a < 100 || (r > 240 && g > 240 && b > 240) || (r < 15 && g < 15 && b < 15)) {
        continue;
      }
      
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
    }
    
    // Retornar as 5 cores mais dominantes
    return Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => color);
  };

  const handleColorSelect = (color: string, target: 'header' | 'title') => {
    if (target === 'header') {
      setOptions(prev => ({
        ...prev,
        headerBackgroundColor: color,
        useLogoColor: true
      }));
    } else {
      setOptions(prev => ({
        ...prev,
        titleBackgroundColor: color,
        useLogoColor: true
      }));
    }
  };

  const resetToDefault = () => {
    setOptions({
      fontFamily: 'Arial',
      fontSize: 12,
      fontStyle: 'normal',
      headerBackgroundColor: logoColors[0] || '#22c55e',
      headerTextColor: '#ffffff',
      titleBackgroundColor: logoColors[1] || logoColors[0] || '#1f2937',
      titleTextColor: '#ffffff',
      useLogoColor: true, // Padrão: usar cores do logo
      logoColors: logoColors,
      logoUrl: logoUrl,
      logoScale: 1,
      logoWidth: 1,
      logoHeight: 1,
      logoPosition: 'left',
      titleSpacing: 15,
      sectionSpacing: 12,
      contentPaddingTop: 10,
      contentPaddingBottom: 10
    });
    setPreviewUrl(null);
  };

  const saveParameters = () => {
    try {
      const paramsToSave = {
        fontFamily: options.fontFamily,
        fontSize: options.fontSize,
        fontStyle: options.fontStyle,
        headerBackgroundColor: options.headerBackgroundColor,
        headerTextColor: options.headerTextColor,
        titleBackgroundColor: options.titleBackgroundColor,
        titleTextColor: options.titleTextColor,
        logoScale: options.logoScale,
        logoWidth: options.logoWidth,
        logoHeight: options.logoHeight,
        logoPosition: options.logoPosition,
        titleSpacing: options.titleSpacing,
        sectionSpacing: options.sectionSpacing,
        contentPaddingTop: options.contentPaddingTop,
        contentPaddingBottom: options.contentPaddingBottom
      };
      localStorage.setItem('pdfCustomizationOptions', JSON.stringify(paramsToSave));
      toast.success('Parâmetros salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar parâmetros:', error);
      toast.error('Erro ao salvar parâmetros');
    }
  };

  const handleDownloadCustomized = () => {
    if (options.fontSize < 8 || options.fontSize > 24) {
      toast.error('Tamanho da fonte deve estar entre 8 e 24');
      return;
    }
    onDownloadCustomized(options);
  };

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          className={`
            ${isMaximized ? 'max-w-[95vw] w-[95vw] h-[95vh]' : 'max-w-6xl w-full'}
            ${isMinimized ? 'h-16' : 'max-h-[90vh]'}
            overflow-y-auto transition-all duration-300
          `}
        >
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Personalizar {title}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMaximized(!isMaximized)}
                className="h-8 w-8 p-0"
              >
                {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </DialogHeader>

          {!isMinimized && (
          <div className="space-y-6">
            {/* Opções de Fonte */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Configurações de Fonte</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Fonte</Label>
                  <Select
                    value={options.fontFamily}
                    onValueChange={(value) => setOptions(prev => ({ ...prev, fontFamily: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Times">Times New Roman</SelectItem>
                      <SelectItem value="Courier">Courier</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Estilo da Fonte</Label>
                  <Select
                    value={options.fontStyle}
                    onValueChange={(value) => setOptions(prev => ({ ...prev, fontStyle: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="bold">Negrito</SelectItem>
                      <SelectItem value="italic">Itálico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tamanho da Fonte: {options.fontSize}px</Label>
                  <Slider
                    value={[options.fontSize]}
                    onValueChange={([value]) => setOptions(prev => ({ ...prev, fontSize: value }))}
                    min={8}
                    max={24}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Configurações de Cor */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Cores dos Cabeçalhos das Tabelas</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cor de Fundo</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={options.headerBackgroundColor}
                      onChange={(e) => setOptions(prev => ({ 
                        ...prev, 
                        headerBackgroundColor: e.target.value,
                        useLogoColor: false 
                      }))}
                      className="w-16 h-10"
                    />
                    <Input
                      type="text"
                      value={options.headerBackgroundColor}
                      onChange={(e) => setOptions(prev => ({ 
                        ...prev, 
                        headerBackgroundColor: e.target.value,
                        useLogoColor: false 
                      }))}
                      placeholder="#22c55e"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cor do Texto</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={options.headerTextColor}
                      onChange={(e) => setOptions(prev => ({ ...prev, headerTextColor: e.target.value }))}
                      className="w-16 h-10"
                    />
                    <Input
                      type="text"
                      value={options.headerTextColor}
                      onChange={(e) => setOptions(prev => ({ ...prev, headerTextColor: e.target.value }))}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Configurações de Cor dos Títulos */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Cores dos Títulos das Seções</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cor de Fundo dos Títulos</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={options.titleBackgroundColor}
                      onChange={(e) => setOptions(prev => ({ 
                        ...prev, 
                        titleBackgroundColor: e.target.value,
                        useLogoColor: false 
                      }))}
                      className="w-16 h-10"
                    />
                    <Input
                      type="text"
                      value={options.titleBackgroundColor}
                      onChange={(e) => setOptions(prev => ({ 
                        ...prev, 
                        titleBackgroundColor: e.target.value,
                        useLogoColor: false 
                      }))}
                      placeholder="#1f2937"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cor do Texto dos Títulos</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={options.titleTextColor}
                      onChange={(e) => setOptions(prev => ({ ...prev, titleTextColor: e.target.value }))}
                      className="w-16 h-10"
                    />
                    <Input
                      type="text"
                      value={options.titleTextColor}
                      onChange={(e) => setOptions(prev => ({ ...prev, titleTextColor: e.target.value }))}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Configurações do Logo */}
            {logoUrl && (showLogoScale || showLogoWidth || showLogoHeight || showLogoPosition) && (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Configurações do Logo
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(showLogoScale || showLogoWidth) && (
                    <div className="space-y-2">
                      <Label>Largura do Logo: {options.logoWidth?.toFixed(1)}x</Label>
                      <Slider
                        value={[options.logoWidth || 1]}
                        onValueChange={([value]) => setOptions(prev => ({ ...prev, logoWidth: value }))}
                        min={0.5}
                        max={3.0}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0.5x</span>
                        <span>3.0x</span>
                      </div>
                    </div>
                  )}

                  {(showLogoScale || showLogoHeight) && (
                    <div className="space-y-2">
                      <Label>Altura do Logo: {options.logoHeight?.toFixed(1)}x</Label>
                      <Slider
                        value={[options.logoHeight || 1]}
                        onValueChange={([value]) => setOptions(prev => ({ ...prev, logoHeight: value }))}
                        min={0.5}
                        max={3.0}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0.5x</span>
                        <span>3.0x</span>
                      </div>
                    </div>
                  )}

                  {showLogoPosition && (
                    <div className="space-y-2">
                      <Label>Posição do Logo</Label>
                      <Select
                        value={options.logoPosition || 'left'}
                        onValueChange={(value: 'left' | 'center' | 'right') => 
                          setOptions(prev => ({ ...prev, logoPosition: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Esquerda</SelectItem>
                          <SelectItem value="center">Centro</SelectItem>
                          <SelectItem value="right">Direita</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Defina onde o logo será posicionado no cabeçalho do PDF
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Configurações de Espaçamento */}
            {(showSpacingControls || showTitleSpacing || showSectionSpacing || showContentPadding) && (
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Configurações de Espaçamento</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(showSpacingControls || showTitleSpacing) && (
                    <div className="space-y-2">
                      <Label>Espaçamento do Título: {options.titleSpacing}px</Label>
                      <Slider
                        value={[options.titleSpacing || 15]}
                        onValueChange={([value]) => setOptions(prev => ({ ...prev, titleSpacing: value }))}
                        min={5}
                        max={30}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>5px</span>
                        <span>30px</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Distância entre títulos e seu conteúdo
                      </p>
                    </div>
                  )}

                  {(showSpacingControls || showSectionSpacing) && (
                    <div className="space-y-2">
                      <Label>Espaçamento das Seções: {options.sectionSpacing}px</Label>
                      <Slider
                        value={[options.sectionSpacing || 12]}
                        onValueChange={([value]) => setOptions(prev => ({ ...prev, sectionSpacing: value }))}
                        min={5}
                        max={30}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>5px</span>
                        <span>30px</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Distância entre diferentes seções
                      </p>
                    </div>
                  )}

                  {(showSpacingControls || showContentPadding) && (
                    <>
                      <div className="space-y-2">
                        <Label>Padding Superior: {options.contentPaddingTop}px</Label>
                        <Slider
                          value={[options.contentPaddingTop || 10]}
                          onValueChange={([value]) => setOptions(prev => ({ ...prev, contentPaddingTop: value }))}
                          min={5}
                          max={30}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>5px</span>
                          <span>30px</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Espaço acima do conteúdo das caixas
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Padding Inferior: {options.contentPaddingBottom}px</Label>
                        <Slider
                          value={[options.contentPaddingBottom || 10]}
                          onValueChange={([value]) => setOptions(prev => ({ ...prev, contentPaddingBottom: value }))}
                          min={5}
                          max={30}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>5px</span>
                          <span>30px</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Espaço abaixo do conteúdo das caixas
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Cores do Logo */}
            {logoColors.length > 0 && (
              <div className="space-y-3">
                <Label>Cores Extraídas do Logo</Label>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Para Cabeçalhos das Tabelas:</p>
                  <div className="flex flex-wrap gap-2">
                    {logoColors.map((color, index) => (
                      <Badge
                        key={`header-${index}`}
                        variant="outline"
                        className="cursor-pointer hover:scale-105 transition-transform"
                        style={{ backgroundColor: color, color: '#ffffff' }}
                        onClick={() => handleColorSelect(color, 'header')}
                      >
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Para Títulos das Seções:</p>
                  <div className="flex flex-wrap gap-2">
                    {logoColors.map((color, index) => (
                      <Badge
                        key={`title-${index}`}
                        variant="outline"
                        className="cursor-pointer hover:scale-105 transition-transform"
                        style={{ backgroundColor: color, color: '#ffffff' }}
                        onClick={() => handleColorSelect(color, 'title')}
                      >
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Clique em uma cor para aplicá-la aos elementos correspondentes
                </p>
              </div>
            )}

            {/* Preview das Cores Selecionadas */}
            <div className="space-y-3">
              <Label>Preview dos Estilos</Label>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Cabeçalho de Tabela:</p>
                  <div
                    className="p-3 rounded text-center font-semibold"
                    style={{
                      backgroundColor: options.headerBackgroundColor,
                      color: options.headerTextColor,
                      fontFamily: options.fontFamily,
                      fontSize: `${Math.min(options.fontSize + 1, 16)}px`,
                      fontWeight: options.fontStyle.includes('bold') ? 'bold' : 'normal',
                      fontStyle: options.fontStyle.includes('italic') ? 'italic' : 'normal'
                    }}
                  >
                    Exemplo de Cabeçalho de Tabela
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Título de Seção:</p>
                  <div
                    className="p-3 rounded text-center font-semibold"
                    style={{
                      backgroundColor: options.titleBackgroundColor,
                      color: options.titleTextColor,
                      fontFamily: options.fontFamily,
                      fontSize: `${Math.min(options.fontSize + 2, 18)}px`,
                      fontWeight: options.fontStyle.includes('bold') ? 'bold' : 'normal',
                      fontStyle: options.fontStyle.includes('italic') ? 'italic' : 'normal'
                    }}
                  >
                    EXEMPLO DE TÍTULO DE SEÇÃO
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={resetToDefault}
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Restaurar Padrão
              </Button>

              <Button
                variant="outline"
                onClick={saveParameters}
                className="flex items-center gap-2"
              >
                💾 Salvar Parâmetros
              </Button>
              
              {onPreview && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    setIsGeneratingPreview(true);
                    try {
                      const preview = await onPreview({ ...options, preview: true });
                      setPreviewUrl(preview);
                    } catch (error) {
                      toast.error('Erro ao gerar pré-visualização');
                    } finally {
                      setIsGeneratingPreview(false);
                    }
                  }}
                  disabled={isGeneratingPreview}
                  className="flex items-center gap-2"
                >
                  👁️ {isGeneratingPreview ? 'Gerando...' : 'Pré-visualizar'}
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={onDownloadOriginal}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Baixar Original
              </Button>
              
              <Button
                onClick={handleDownloadCustomized}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Baixar Personalizado
              </Button>
            </div>

            {/* Pré-visualização do PDF */}
            {previewUrl && (
              <div className="space-y-3 pt-4 border-t">
                <Label>Pré-visualização do PDF</Label>
                <div className="border rounded-lg overflow-hidden" style={{ height: '500px' }}>
                  <iframe
                    src={previewUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                    title="Pré-visualização do PDF"
                  />
                </div>
              </div>
            )}
          </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PDFCustomizationModal;