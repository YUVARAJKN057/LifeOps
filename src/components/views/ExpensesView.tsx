import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense, ExpenseCategory } from '../../types';
import {
  IndianRupee,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  TrendingUp,
  PieChart,
  Calendar,
  CreditCard,
  AlertCircle,
  X,
  Layers,
  Sparkles,
} from 'lucide-react';
import { WealthVault3D } from '../common/WealthVault3D';
import { Card3D } from '../common/Card3D';

export const ExpensesView: React.FC = () => {
  const {
    expenses,
    user,
    createExpense,
    updateExpense,
    deleteExpense,
    openQuickAdd,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);

  const monthlyBudget = user?.monthlyBudget || 75000;
  const totalSpent = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const budgetUtilization = Math.min(100, Math.round((totalSpent / monthlyBudget) * 100));
  const remainingBudget = Math.max(0, monthlyBudget - totalSpent);

  // Category breakdown calculation
  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, categoryFilter, searchQuery]);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;
    await updateExpense(editingExpense.id, editingExpense);
    setEditingExpense(null);
  };

  return (
    <div id="lifeops-expenses-view" className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1a1a1a] pb-6">
        <div>
          <div className="text-[#7a7a7a] text-[10px] uppercase tracking-[0.35em] font-medium mb-1">
            Capital Management &bull; ₹ INR
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-white tracking-tight">
            Treasury & Capital Outflows
          </h1>
          <p className="text-xs text-[#7a7a7a] mt-1 font-light">
            Monitor personal liquidity burn, treasury reserves, and transactional ledger in Indian Rupees (₹).
          </p>
        </div>

        <button
          id="expenses-create-btn"
          onClick={() => openQuickAdd('expense')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm bg-[#c5a059] text-black font-semibold text-xs uppercase tracking-widest shadow-[0_0_12px_rgba(197,160,89,0.25)] hover:bg-[#d8b56f] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Log Transaction</span>
        </button>
      </div>

      {/* 3D Wealth Vault Matrix & Top Financial Health Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* 3D Interactive Wealth Vault Canvas */}
        <div className="lg:col-span-4 p-6 rounded-sm bg-[#080808] border border-[#c5a059]/30 relative overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="absolute top-3 left-4 flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-widest text-[#c5a059]">
            <Sparkles className="w-3 h-3 text-[#c5a059]" />
            <span>3D Treasury Bullion Vault</span>
          </div>
          <div className="w-full h-52 flex items-center justify-center">
            <WealthVault3D size={200} savingsRate={100 - budgetUtilization} totalWealthINR={remainingBudget} />
          </div>
          <div className="text-[10px] text-[#7a7a7a] font-mono tracking-wider">
            ₹ Indian Rupee Sovereign Storage &bull; Real-time Reflection
          </div>
        </div>

        {/* Financial Health Cards */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Total Spent Card */}
          <Card3D depth={10}>
            <div className="p-6 rounded-sm bg-[#080808] border border-[#1a1a1a] space-y-2 h-full">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#7a7a7a] uppercase tracking-widest font-medium">Monthly Disbursed</span>
                <IndianRupee className="w-4 h-4 text-[#c5a059]" />
              </div>
              <div className="text-3xl font-serif text-white tracking-tight">
                ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <span className="text-[10px] text-[#555] font-mono block">Across {expenses.length} recorded entries</span>
            </div>
          </Card3D>

          {/* Budget Remaining */}
          <Card3D depth={10}>
            <div className="p-6 rounded-sm bg-[#080808] border border-[#1a1a1a] space-y-2 h-full">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#7a7a7a] uppercase tracking-widest font-medium">Available Reserve</span>
                <TrendingUp className="w-4 h-4 text-[#c5a059]" />
              </div>
              <div className={`text-3xl font-serif tracking-tight ${remainingBudget > 0 ? 'text-[#c5a059]' : 'text-rose-400'}`}>
                ₹{remainingBudget.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center justify-between text-[10px] text-[#555] font-mono">
                <span>Budget: ₹{monthlyBudget.toLocaleString('en-IN')}</span>
                <span>{budgetUtilization}% utilized</span>
              </div>
            </div>
          </Card3D>

          {/* Budget Progress Bar */}
          <Card3D depth={10} className="sm:col-span-2">
            <div className="p-6 rounded-sm bg-[#080808] border border-[#1a1a1a] flex flex-col justify-between">
              <span className="text-[10px] text-[#7a7a7a] uppercase tracking-widest font-medium">Budget Utilization Gauge</span>
              <div className="my-2">
                <div className="w-full bg-[#141414] rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      budgetUtilization > 90
                        ? 'bg-rose-500'
                        : 'bg-gradient-to-r from-[#c5a059] to-[#e5c178]'
                    }`}
                    style={{ width: `${budgetUtilization}%` }}
                  />
                </div>
              </div>
              <span className="text-[10px] text-[#7a7a7a] font-mono text-right">
                {100 - budgetUtilization}% capacity remaining
              </span>
            </div>
          </Card3D>
        </div>
      </div>

      {/* Category Breakdown Bars */}
      <div className="p-6 rounded-sm bg-[#080808] border border-[#1a1a1a]">
        <h3 className="text-xs uppercase tracking-widest text-[#7a7a7a] font-medium mb-4 flex items-center gap-2">
          <PieChart className="w-3.5 h-3.5 text-[#c5a059]" />
          <span>Category Allocation Breakdown</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(categoryTotals).map(([cat, amountVal]) => {
            const amount = Number(amountVal);
            const percent = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
            return (
              <div key={cat} className="p-3.5 rounded-sm bg-[#050505] border border-[#141414] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#d1d1d1] font-medium">{cat}</span>
                  <span className="text-[#c5a059] font-serif font-bold">₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="w-full bg-[#141414] rounded-full h-1 overflow-hidden">
                  <div
                    className="h-full bg-[#c5a059] rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="text-[9px] text-[#555] font-mono text-right">{percent}% of total</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transactions List */}
      <div className="p-6 rounded-sm bg-[#080808] border border-[#1a1a1a] space-y-4">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1a1a1a]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-[#555] absolute left-3.5 top-3" />
            <input
              id="expenses-search-input"
              type="text"
              placeholder="Search ledger by memo or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white placeholder-[#555] text-xs focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              id="expenses-category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-[#d1d1d1] text-xs focus:outline-none focus:border-[#c5a059]"
            >
              <option value="all">All Domains</option>
              <option value="Food">Food & Dining</option>
              <option value="Transport">Transport & Mobility</option>
              <option value="Education">Education & Books</option>
              <option value="Shopping">Acquisitions</option>
              <option value="Entertainment">Leisure</option>
              <option value="Bills">Fixed Utilities & Retainers</option>
              <option value="Health">Wellness</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-2">
          {filteredExpenses.length === 0 ? (
            <div className="p-12 text-center text-[#555] text-xs">
              No transactions match your search criteria.
            </div>
          ) : (
            filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                id={`expense-item-${expense.id}`}
                className="flex items-center justify-between p-4 rounded-sm bg-[#050505] border border-[#141414] hover:border-[#c5a059]/30 transition-all"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-2 rounded-sm bg-[#111] text-[#c5a059] border border-[#222] flex-shrink-0">
                    <IndianRupee className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate">
                    <div className="text-sm font-medium text-white truncate">{expense.description}</div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#7a7a7a] font-mono">
                      <span className="text-[#c5a059] uppercase tracking-wider">{expense.category}</span>
                      <span>•</span>
                      <span>{expense.date}</span>
                      {expense.paymentMethod && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{expense.paymentMethod.replace('_', ' ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-base font-serif text-white">
                    ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      id={`expense-edit-${expense.id}`}
                      onClick={() => setEditingExpense(expense)}
                      className="p-1.5 text-[#555] hover:text-[#c5a059] rounded-sm hover:bg-[#111]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`expense-delete-${expense.id}`}
                      onClick={() => setDeletingExpenseId(expense.id)}
                      className="p-1.5 text-[#555] hover:text-rose-400 rounded-sm hover:bg-[#111]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div
          id="expense-edit-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setEditingExpense(null)}
        >
          <div
            id="expense-edit-modal"
            className="w-full max-w-lg bg-[#080808] border border-[#c5a059]/30 rounded-sm p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1a1a1a] pb-3">
              <h3 className="text-lg font-serif italic text-white">Edit Ledger Entry (₹ INR)</h3>
              <button onClick={() => setEditingExpense(null)} className="text-[#7a7a7a] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Amount (₹ INR)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={editingExpense.amount}
                    onChange={(e) => setEditingExpense({ ...editingExpense, amount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Domain</label>
                  <select
                    value={editingExpense.category}
                    onChange={(e) =>
                      setEditingExpense({ ...editingExpense, category: e.target.value as ExpenseCategory })
                    }
                    className="w-full px-3 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="Food">Food & Dining</option>
                    <option value="Transport">Transport</option>
                    <option value="Education">Education</option>
                    <option value="Shopping">Acquisitions</option>
                    <option value="Entertainment">Leisure</option>
                    <option value="Bills">Fixed Utilities</option>
                    <option value="Health">Wellness</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Memo / Description</label>
                <input
                  type="text"
                  required
                  value={editingExpense.description}
                  onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Date</label>
                  <input
                    type="date"
                    value={editingExpense.date}
                    onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-[#7a7a7a] mb-1">Payment Method</label>
                  <select
                    value={editingExpense.paymentMethod || 'credit_card'}
                    onChange={(e) =>
                      setEditingExpense({ ...editingExpense, paymentMethod: e.target.value as any })
                    }
                    className="w-full px-3 py-2 rounded-sm bg-[#050505] border border-[#1a1a1a] text-white text-xs focus:outline-none focus:border-[#c5a059]"
                  >
                    <option value="credit_card">UPI / Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="cash">Cash / Petty</option>
                    <option value="transfer">Net Banking / IMPS</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1a1a1a]">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="px-4 py-2 rounded-sm text-xs font-medium text-[#7a7a7a] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-sm bg-[#c5a059] text-black text-xs uppercase tracking-widest font-semibold hover:bg-[#d8b56f]"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Expense Confirmation */}
      {deletingExpenseId && (
        <div
          id="expense-delete-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setDeletingExpenseId(null)}
        >
          <div
            id="expense-delete-modal"
            className="w-full max-w-sm bg-[#080808] border border-rose-900/40 rounded-sm p-6 text-center space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-950/40 border border-rose-800/40 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-serif italic text-white">Delete Ledger Record?</h4>
            <p className="text-xs text-[#7a7a7a]">This transaction will be expunged from the treasury balance.</p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingExpenseId(null)}
                className="px-4 py-2 rounded-sm text-xs font-medium text-[#7a7a7a] hover:text-white bg-[#111]"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteExpense(deletingExpenseId);
                  setDeletingExpenseId(null);
                }}
                className="px-5 py-2 rounded-sm bg-rose-900 hover:bg-rose-800 text-white text-xs uppercase tracking-wider font-semibold"
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
