
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, MessageSquare } from 'lucide-react';
import ImageUpload from '@/components/ui/image-upload';

interface ChecklistItem {
  item: string;
  status: 'conforme' | 'nao_conforme' | '';
  comment: string;
  photo: File | null;
}

interface ChecklistSectionProps {
  items: string[];
  checklist: {[key: string]: ChecklistItem};
  onItemChange: (item: string, data: ChecklistItem) => void;
}

const ChecklistSection = ({ items, checklist, onItemChange }: ChecklistSectionProps) => {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  if (items.length === 0) return null;

  const getItemData = (item: string): ChecklistItem => {
    return checklist[item] || {
      item,
      status: '',
      comment: '',
      photo: null
    };
  };

  const updateItemData = (item: string, field: keyof ChecklistItem, value: any) => {
    const currentData = getItemData(item);
    const updatedData = { ...currentData, [field]: value };
    onItemChange(item, updatedData);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-evolutec-black mb-3">
        Checklist de Manutenção
      </label>
      <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
        {items.map((item, index) => {
          const itemData = getItemData(item);
          const isExpanded = expandedItem === item;
          
          return (
            <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
              <div className="space-y-3">
                {/* Item principal e status */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <label className="text-sm text-evolutec-text font-medium block">
                      {item}
                    </label>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Select
                      value={itemData.status}
                      onValueChange={(value: 'conforme' | 'nao_conforme') => 
                        updateItemData(item, 'status', value)
                      }
                    >
                      <SelectTrigger className="w-full sm:w-36">
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="conforme">✓ Conforme</SelectItem>
                        <SelectItem value="nao_conforme">✗ Não Conforme</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedItem(isExpanded ? null : item)}
                      className="flex items-center gap-1 w-full sm:w-auto justify-center"
                    >
                      <MessageSquare className="w-3 h-3" />
                      {itemData.comment || itemData.photo ? '●' : ''}
                      <span className="sm:hidden ml-1">Comentário/Foto</span>
                    </Button>
                  </div>
                </div>

                {/* Seção expandida para comentário e foto */}
                {isExpanded && (
                  <div className="pl-4 space-y-3 border-l-2 border-gray-200">
                    <div>
                      <Label className="text-xs font-medium text-gray-600">
                        Comentário
                      </Label>
                      <Textarea
                        placeholder="Adicione um comentário sobre este item..."
                        value={itemData.comment}
                        onChange={(e) => updateItemData(item, 'comment', e.target.value)}
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        Foto
                      </Label>
                      <div className="mt-1">
                        <ImageUpload
                          label={itemData.photo ? "Alterar Foto" : "Adicionar Foto"}
                          value={itemData.photo}
                          onChange={(file) => updateItemData(item, 'photo', file)}
                        />
                        {itemData.photo && (
                          <div className="mt-2">
                            <img
                              src={URL.createObjectURL(itemData.photo)}
                              alt="Foto do item"
                              className="w-20 h-20 object-cover rounded border"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChecklistSection;
