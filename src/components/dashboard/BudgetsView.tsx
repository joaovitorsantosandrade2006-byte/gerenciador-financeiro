'use client';

import { useState, useEffect } from 'react';
import { User, Budget, DEFAULT_CATEGORIES } from '@/lib/types';
import { getBudgets, saveBudget, deleteBudget, getTransactions, generateId, formatCurrency, getCurrentMonth } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface BudgetsViewProps {
  user: User;
  onUpdate: () => void;
}

export default function BudgetsView({ user, onUpdate }: BudgetsViewProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
  });

  const loadBudgets = () => {
    const userBudgets = getBudgets(user.id, selectedMonth);
    
    // Calculate spent for each budget
    const transactions = getTransactions(user.id);
    const monthTransactions = transactions.filter(t => 
      t.date.startsWith(selectedMonth) && t.type === 'expense'
    );

    const budgetsWithSpent = userBudgets.map(budget => {
      const spent = monthTransactions
        .filter(t => t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return { ...budget, spent };
    });

    setBudgets(budgetsWithSpent);
  };

  useEffect(() => {
    loadBudgets();
  }, [user.id, selectedMonth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category || !formData.limit) {
      toast.error('Preencha todos os campos');
      return;
    }

    const existingBudget = budgets.find(b => b.category === formData.category);
    if (existingBudget) {
      toast.error('Já existe um orçamento para esta categoria neste mês');
      return;
    }

    const budget: Budget = {
      id: generateId(),
      userId: user.id,
      month: selectedMonth,
      category: formData.category,
      limit: parseFloat(formData.limit),
      spent: 0,
      createdAt: new Date().toISOString(),
    };

    saveBudget(budget);
    loadBudgets();
    onUpdate();
    setIsDialogOpen(false);
    setFormData({ category: '', limit: '' });
    toast.success('Orçamento criado com sucesso!');
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir este orçamento?')) {
      deleteBudget(id);
      loadBudgets();
      onUpdate();
      toast.success('Orçamento excluído com sucesso!');
    }
  };

  const expenseCategories = DEFAULT_CATEGORIES.filter(c => c.type === 'expense');
  const availableCategories = expenseCategories.filter(
    cat => !budgets.some(b => b.category === cat.name)
  );

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Orçamentos Mensais</CardTitle>
              <CardDescription>Defina limites de gastos por categoria</CardDescription>
            </div>
            <div className="flex gap-3">
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-auto"
              />
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                    <Plus className="w-4 h-4" />
                    Novo Orçamento
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Orçamento</DialogTitle>
                    <DialogDescription>Defina um limite de gastos para uma categoria</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria *</Label>
                      <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="limit">Limite Mensal (R$) *</Label>
                      <Input
                        id="limit"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={formData.limit}
                        onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                        required
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                        Cancelar
                      </Button>
                      <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                        Criar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary */}
          {budgets.length > 0 && (
            <div className="p-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Resumo do Mês</h3>
                <span className={`text-sm font-medium ${
                  totalPercentage > 90 ? 'text-red-600' : totalPercentage > 70 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {totalPercentage.toFixed(1)}% utilizado
                </span>
              </div>
              <Progress value={totalPercentage} className="h-3" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Gasto: {formatCurrency(totalSpent)}</span>
                <span className="text-gray-600">Limite: {formatCurrency(totalBudget)}</span>
              </div>
            </div>
          )}

          {/* Budgets List */}
          {budgets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhum orçamento definido para este mês</p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                variant="outline"
                className="mt-4"
              >
                Criar Primeiro Orçamento
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {budgets.map((budget) => {
                const percentage = (budget.spent / budget.limit) * 100;
                const isOverBudget = percentage > 100;
                const isWarning = percentage > 80 && !isOverBudget;
                const isGood = percentage <= 80;

                return (
                  <Card key={budget.id} className={`border-2 ${
                    isOverBudget ? 'border-red-200 bg-red-50' : 
                    isWarning ? 'border-yellow-200 bg-yellow-50' : 
                    'border-green-200 bg-green-50'
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{budget.category}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(budget.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Gasto</span>
                          <span className={`font-bold ${
                            isOverBudget ? 'text-red-600' : 
                            isWarning ? 'text-yellow-600' : 
                            'text-green-600'
                          }`}>
                            {formatCurrency(budget.spent)}
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(percentage, 100)} 
                          className={`h-2 ${
                            isOverBudget ? 'bg-red-200' : 
                            isWarning ? 'bg-yellow-200' : 
                            'bg-green-200'
                          }`}
                        />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Limite</span>
                          <span className="font-medium text-gray-900">{formatCurrency(budget.limit)}</span>
                        </div>
                      </div>

                      <div className={`flex items-center gap-2 p-3 rounded-lg ${
                        isOverBudget ? 'bg-red-100' : 
                        isWarning ? 'bg-yellow-100' : 
                        'bg-green-100'
                      }`}>
                        {isOverBudget ? (
                          <>
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium text-red-700">
                              Orçamento excedido em {formatCurrency(budget.spent - budget.limit)}
                            </span>
                          </>
                        ) : isWarning ? (
                          <>
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-700">
                              {percentage.toFixed(1)}% do orçamento utilizado
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700">
                              Restam {formatCurrency(budget.limit - budget.spent)}
                            </span>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
