
export const getPeriodicityLabel = (periodicity: string) => {
  switch (periodicity) {
    case 'monthly': return 'M';
    case 'bimonthly': return 'B';
    case 'quarterly': return 'T';
    case 'semestral': return 'S';
    case 'annual': return 'A';
    default: return '-';
  }
};

export const getPeriodicityDisplayName = (periodicity: string) => {
  const periodicityLabels = {
    'monthly': 'Mensal',
    'bimonthly': 'Bimestral',
    'quarterly': 'Trimestral',
    'semestral': 'Semestral',
    'annual': 'Anual'
  };
  return periodicityLabels[periodicity as keyof typeof periodicityLabels] || '';
};
