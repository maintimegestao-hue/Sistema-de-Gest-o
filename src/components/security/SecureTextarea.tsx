
import React from 'react';
import { sanitizeString } from '@/lib/validation';

interface SecureTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

const SecureTextarea = ({ value, onChange, maxLength = 2000, className = '', ...props }: SecureTextareaProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const sanitizedValue = sanitizeString(e.target.value);
    const truncatedValue = sanitizedValue.substring(0, maxLength);
    onChange(truncatedValue);
  };

  return (
    <textarea
      {...props}
      value={value}
      onChange={handleChange}
      maxLength={maxLength}
      className={`font-sans whitespace-pre-wrap ${className}`}
      style={{ 
        fontFamily: 'inherit',
        lineHeight: '1.5',
        wordSpacing: 'normal',
        letterSpacing: 'normal'
      }}
    />
  );
};

export default SecureTextarea;
