'use client';

import { useState, useEffect } from 'react';
import { User, Transaction, Budget } from '@/lib/types';
import { getTransactions, getBudgets, formatCurrency, getCurrentMonth } from '@/lib/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, CheckCircle2, Calendar, TrendingUp } from 'lucide-react';

interface NotificationsViewProps {
  user: User;
}

interface Notification {
  id: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  title: string;
  message: string;
  date: string;
  icon: React.ReactNode;
}

export default function NotificationsView({ user }: NotificationsViewProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const generateNotifications = () => {
      const notifs: Notification[] = [];
      const currentMonth = getCurrentMonth();
      const today = new Date();
      const transactions = getTransactions(user.id);
      const budgets = getBudgets(user.id, currentMonth);

      // Check for overdue bills
      const overdueBills = transactions.filter(t => 
        t.type === 'expense' && 
        !t.isPaid && 
        t.dueDate && 
        new Date(t.dueDate) < today
      );

      overdueBills.forEach(bill => {
        notifs.push({
          id: `overdue-${bill.id}`,
          type: 'danger',
          title: 'Conta Vencida',
          message: `${bill.description} - ${formatCurrency(bill.amount)} venceu em ${new Date(bill.dueDate!).toLocaleDateString('pt-BR')}`,
          date: bill.dueDate!,
          icon: <AlertTriangle className="w-5 h-5" />,
        });
      });

      // Check for bills due in the next 7 days
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);

      const upcomingBills = transactions.filter(t => 
        t.type === 'expense' && 
        !t.isPaid && 
        t.dueDate && 
        new Date(t.dueDate) >= today &&
        new Date(t.dueDate) <= sevenDaysFromNow
      );

      upcomingBills.forEach(bill => {
        notifs.push({
          id: `upcoming-${bill.id}`,
          type: 'warning',
          title: 'Conta Próxima do Vencimento',
          message: `${bill.description} - ${formatCurrency(bill.amount)} vence em ${new Date(bill.dueDate!).toLocaleDateString('pt-BR')}`,
          date: bill.dueDate!,
          icon: <Calendar className="w-5 h-5" />,
        });
      });

      // Check for budget alerts
      const monthTransactions = transactions.filter(t => 
        t.date.startsWith(currentMonth) && t.type === 'expense'
      );

      budgets.forEach(budget => {
        const spent = monthTransactions
          .filter(t => t.category === budget.category)
          .reduce((sum, t) => sum + t.amount, 0);

        const percentage = (spent / budget.limit) * 100;

        if (percentage > 100) {
          notifs.push({
            id: `budget-exceeded-${budget.id}`,
            type: 'danger',
            title: 'Orçamento Excedido',
            message: `Categoria "${budget.category}" ultrapassou o limite em ${formatCurrency(spent - budget.limit)}`,
            date: new Date().toISOString(),
            icon: <AlertTriangle className="w-5 h-5" />,
          });
        } else if (percentage > 80) {
          notifs.push({
            id: `budget-warning-${budget.id}`,
            type: 'warning',
            title: 'Atenção ao Orçamento',
            message: `Categoria "${budget.category}" está em ${percentage.toFixed(0)}% do limite (${formatCurrency(spent)} de ${formatCurrency(budget.limit)})`,
            date: new Date().toISOString(),
            icon: <TrendingUp className="w-5 h-5" />,
          });
        }
      });

      // Check for positive balance
      const monthIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const monthExpense = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const balance = monthIncome - monthExpense;

      if (balance > 0 && monthExpense > 0) {
        const savingsRate = (balance / monthIncome) * 100;
        if (savingsRate > 20) {
          notifs.push({
            id: 'positive-balance',
            type: 'success',
            title: 'Parabéns! Ótima Economia',
            message: `Você economizou ${savingsRate.toFixed(0)}% da sua renda este mês (${formatCurrency(balance)})`,
            date: new Date().toISOString(),
            icon: <CheckCircle2 className="w-5 h-5" />,
          });
        }
      }

      // Sort by date (most recent first)
      notifs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setNotifications(notifs);
    };

    generateNotifications();
  }, [user.id]);

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'danger':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getIconStyle = (type: string) => {
    switch (type) {
      case 'danger':
        return 'bg-red-100 text-red-600';
      case 'warning':
        return 'bg-yellow-100 text-yellow-600';
      case 'success':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'danger':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'success':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notificações e Alertas
              </CardTitle>
              <CardDescription>Acompanhe vencimentos e alertas de orçamento</CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {notifications.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tudo em dia!</h3>
              <p className="text-gray-600">Você não tem notificações pendentes no momento</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 ${getNotificationStyle(notification.type)} transition-all hover:shadow-md`}
                >
                  <div className={`p-3 rounded-lg ${getIconStyle(notification.type)}`}>
                    {notification.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                      <Badge variant={getBadgeVariant(notification.type)} className="shrink-0">
                        {notification.type === 'danger' ? 'Urgente' :
                         notification.type === 'warning' ? 'Atenção' :
                         notification.type === 'success' ? 'Sucesso' : 'Info'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(notification.date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-green-50">
        <CardHeader>
          <CardTitle className="text-lg">💡 Dicas Financeiras</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
            <p className="text-sm text-gray-700">Configure alertas para contas recorrentes e evite atrasos</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
            <p className="text-sm text-gray-700">Mantenha uma reserva de emergência de 3-6 meses de despesas</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-purple-600 mt-2"></div>
            <p className="text-sm text-gray-700">Revise seus orçamentos mensalmente e ajuste conforme necessário</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
