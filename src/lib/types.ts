// Types para o aplicativo financeiro

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  paymentMethod: 'pix' | 'credit' | 'debit' | 'cash';
  dueDate?: string;
  isPaid: boolean;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  month: string; // formato: YYYY-MM
  category: string;
  limit: number;
  spent: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
}

export const DEFAULT_CATEGORIES: Category[] = [
  // Despesas
  { id: '1', name: 'Alimentação', icon: 'UtensilsCrossed', color: '#ef4444', type: 'expense' },
  { id: '2', name: 'Transporte', icon: 'Car', color: '#f97316', type: 'expense' },
  { id: '3', name: 'Moradia', icon: 'Home', color: '#eab308', type: 'expense' },
  { id: '4', name: 'Saúde', icon: 'Heart', color: '#ec4899', type: 'expense' },
  { id: '5', name: 'Educação', icon: 'GraduationCap', color: '#8b5cf6', type: 'expense' },
  { id: '6', name: 'Lazer', icon: 'Gamepad2', color: '#06b6d4', type: 'expense' },
  { id: '7', name: 'Compras', icon: 'ShoppingBag', color: '#10b981', type: 'expense' },
  { id: '8', name: 'Contas', icon: 'FileText', color: '#6366f1', type: 'expense' },
  { id: '9', name: 'Outros', icon: 'MoreHorizontal', color: '#64748b', type: 'expense' },
  
  // Receitas
  { id: '10', name: 'Salário', icon: 'Briefcase', color: '#22c55e', type: 'income' },
  { id: '11', name: 'Freelance', icon: 'Laptop', color: '#3b82f6', type: 'income' },
  { id: '12', name: 'Investimentos', icon: 'TrendingUp', color: '#14b8a6', type: 'income' },
  { id: '13', name: 'Outros', icon: 'DollarSign', color: '#84cc16', type: 'income' },
];
