import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Clock, Calendar } from 'lucide-react';

interface DateTimeFieldsProps {
  startDateTime: string;
  endDateTime: string;
  onStartDateTimeChange: (value: string) => void;
  onEndDateTimeChange: (value: string) => void;
}

const DateTimeFields: React.FC<DateTimeFieldsProps> = ({
  startDateTime,
  endDateTime,
  onStartDateTimeChange,
  onEndDateTimeChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Horários da Manutenção
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-datetime" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data e Hora de Início *
            </Label>
            <Input
              id="start-datetime"
              type="datetime-local"
              value={startDateTime}
              onChange={(e) => onStartDateTimeChange(e.target.value)}
              required
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="end-datetime" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data e Hora de Término *
            </Label>
            <Input
              id="end-datetime"
              type="datetime-local"
              value={endDateTime}
              onChange={(e) => onEndDateTimeChange(e.target.value)}
              required
              min={startDateTime}
              className="w-full"
            />
          </div>
        </div>
        
        {startDateTime && endDateTime && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Duração:</strong> {
                (() => {
                  const start = new Date(startDateTime);
                  const end = new Date(endDateTime);
                  const diffMs = end.getTime() - start.getTime();
                  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                  
                  if (diffMs < 0) return 'Data de término deve ser posterior à data de início';
                  
                  return `${diffHours}h ${diffMinutes}min`;
                })()
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DateTimeFields;