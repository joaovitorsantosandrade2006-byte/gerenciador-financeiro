'use client';

import { useState, useEffect } from 'react';
import { User, Transaction } from '@/lib/types';
import { getTransactions, getBudgets, getCurrentMonth, formatCurrency, setCurrentUser } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  LogOut, 
  Plus,
  BarChart3,
  Bell,
  CreditCard,
  User as UserIcon
} from 'lucide-react';
import TransactionsView from './TransactionsView';
import BudgetsView from './BudgetsView';
import ReportsView from './ReportsView';
import NotificationsView from './NotificationsView';
import PixGenerator from './PixGenerator';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);

  const loadData = () => {
    const userTransactions = getTransactions(user.id);
    setTransactions(userTransactions);

    const currentMonth = getCurrentMonth();
    const monthTransactions = userTransactions.filter(t => 
      t.date.startsWith(currentMonth)
    );

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    setTotalIncome(income);
    setTotalExpense(expense);
    setBalance(income - expense);
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  const handleLogout = () => {
    setCurrentUser(null);
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  FinanceFlow
                </h1>
                <p className="text-xs text-gray-500">Gestão Financeira</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <UserIcon className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 gap-2 bg-white p-2 rounded-xl shadow-sm">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Transações</span>
            </TabsTrigger>
            <TabsTrigger value="budgets" className="gap-2">
              <PiggyBank className="w-4 h-4" />
              <span className="hidden sm:inline">Orçamentos</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Alertas</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="pb-3">
                  <CardDescription className="text-blue-100">Saldo Atual</CardDescription>
                  <CardTitle className="text-3xl font-bold">{formatCurrency(balance)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-blue-100">
                    <Wallet className="w-4 h-4" />
                    <span className="text-sm">Este mês</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardHeader className="pb-3">
                  <CardDescription className="text-green-100">Receitas</CardDescription>
                  <CardTitle className="text-3xl font-bold">{formatCurrency(totalIncome)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-green-100">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">Este mês</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-red-500 to-red-600 text-white">
                <CardHeader className="pb-3">
                  <CardDescription className="text-red-100">Despesas</CardDescription>
                  <CardTitle className="text-3xl font-bold">{formatCurrency(totalExpense)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-red-100">
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-sm">Este mês</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader className="pb-3">
                  <CardDescription className="text-purple-100">Taxa de Economia</CardDescription>
                  <CardTitle className="text-3xl font-bold">
                    {totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0}%
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-purple-100">
                    <PiggyBank className="w-4 h-4" />
                    <span className="text-sm">Este mês</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Acesse as funcionalidades principais</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button 
                  onClick={() => setActiveTab('transactions')}
                  className="h-auto py-6 flex-col gap-2 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  <Plus className="w-6 h-6" />
                  <span>Nova Transação</span>
                </Button>
                <Button 
                  onClick={() => setActiveTab('budgets')}
                  className="h-auto py-6 flex-col gap-2 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  <PiggyBank className="w-6 h-6" />
                  <span>Criar Orçamento</span>
                </Button>
                <PixGenerator />
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
                <CardDescription>Últimas movimentações financeiras</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Nenhuma transação registrada ainda</p>
                    <Button 
                      onClick={() => setActiveTab('transactions')}
                      variant="outline"
                      className="mt-4"
                    >
                      Adicionar Primeira Transação
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div 
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            transaction.type === 'income' 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {transaction.type === 'income' ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-sm text-gray-500">{transaction.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <TransactionsView user={user} onUpdate={loadData} />
          </TabsContent>

          {/* Budgets Tab */}
          <TabsContent value="budgets">
            <BudgetsView user={user} onUpdate={loadData} />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <ReportsView user={user} />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <NotificationsView user={user} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
