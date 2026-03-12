
import React from 'react';
import { sanitizeString } from '@/lib/validation';

interface SecureInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

const SecureInput = ({ value, onChange, maxLength = 255, ...props }: SecureInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeString(e.target.value);
    const truncatedValue = sanitizedValue.substring(0, maxLength);
    onChange(truncatedValue);
  };

  return (
    <input
      {...props}
      value={value}
      onChange={handleChange}
      maxLength={maxLength}
    />
  );
};

export default SecureInput;
