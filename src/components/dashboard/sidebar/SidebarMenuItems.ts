
import { 
  LayoutDashboard, 
  Wrench, 
  Calendar, 
  FileText, 
  Users, 
  Building2, 
  BarChart3, 
  FileCheck, 
  UserCheck,
  Package,
  Settings,
  Truck,
  PackageSearch,
  History,
  Building,
  Phone
} from 'lucide-react';

export interface MenuItem {
  icon: any;
  label: string;
  path: string;
  adminOnly?: boolean;
}

export const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: 'Início',
    path: '/'
  },
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    path: '/dashboard'
  },
  {
    icon: Wrench,
    label: 'Equipamentos',
    path: '/equipments'
  },
  {
    icon: Settings,
    label: 'Manutenção',
    path: '/maintenance'
  },
  {
    icon: Calendar,
    label: 'Agenda Preventiva',
    path: '/preventive-schedule'
  },
  {
    icon: History,
    label: 'Histórico de Manutenção',
    path: '/maintenance-history'
  },
  {
    icon: Package,
    label: 'Materiais',
    path: '/materials'
  },
  {
    icon: PackageSearch,
    label: 'Serviços',
    path: '/services'
  },
  {
    icon: Truck,
    label: 'Fornecedores',
    path: '/suppliers'
  },
  {
    icon: Phone,
    label: 'Chamados',
    path: '/service-calls'
  },
  {
    icon: FileText,
    label: 'Relatórios',
    path: '/reports'
  },
  {
    icon: UserCheck,
    label: 'Técnicos',
    path: '/technicians'
  },
  {
    icon: Building2,
    label: 'Clientes',
    path: '/clients'
  },
  {
    icon: BarChart3,
    label: 'Comparação de Clientes',
    path: '/client-comparison'
  },
  {
    icon: FileCheck,
    label: 'Propostas de Serviço',
    path: '/service-proposals'
  },
  {
    icon: BarChart3,
    label: 'Funil de Propostas SC',
    path: '/proposal-pipeline'
  },
  {
    icon: Users,
    label: 'Técnicos de Campo',
    path: '/field-technicians',
    adminOnly: true
  },
  {
    icon: Building,
    label: 'Configurações da Empresa',
    path: '/company-settings'
  },
  {
    icon: Settings,
    label: 'Gerenciar Acessos de Clientes',
    path: '/client-access-management',
    adminOnly: true
  }
];
