import React, { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Download 
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Customer, Transaction, StoreProfile } from '../types';
import { formatCurrency, getInitials } from '../utils/formatters';

interface ReportsScreenProps {
  store: StoreProfile;
  customers: Customer[];
  transactions: Transaction[];
  onSelectCustomer: (customerId: string) => void;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  store,
  customers,
  transactions,
  onSelectCustomer,
}) => {
  // Aggregate stats
  const totalOutstanding = customers.reduce(
    (acc, c) => (c.balance > 0 ? acc + c.balance : acc),
    0
  );

  const totalCreditGiven = transactions
    .filter((t) => t.type === 'CREDIT')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalPaymentsReceived = transactions
    .filter((t) => t.type === 'PAYMENT')
    .reduce((acc, t) => acc + t.amount, 0);

  const settledCount = customers.filter((c) => c.balance === 0).length;
  const activeDebtors = customers.filter((c) => c.balance > 0);

  // Monthly Breakdown (Last 6 Months) using Recharts
  const monthlyData = useMemo(() => {
    const referenceDate = new Date();
    const monthsList: { key: string; label: string; year: number; monthIndex: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-US', { month: 'short' });
      monthsList.push({
        key,
        label,
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
      });
    }

    return monthsList.map((m) => {
      const txsInMonth = transactions.filter((t) => {
        if (!t.timestamp) return false;
        const txDate = new Date(t.timestamp);
        return (
          txDate.getFullYear() === m.year && txDate.getMonth() === m.monthIndex
        );
      });

      const creditGiven = txsInMonth
        .filter((t) => t.type === 'CREDIT')
        .reduce((sum, t) => sum + t.amount, 0);

      const paymentReceived = txsInMonth
        .filter((t) => t.type === 'PAYMENT')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: m.label,
        key: m.key,
        credit: creditGiven,
        payment: paymentReceived,
        net: creditGiven - paymentReceived,
      };
    });
  }, [transactions]);

  // Aggregate 6-month metrics
  const sixMonthCredit = monthlyData.reduce((acc, curr) => acc + curr.credit, 0);
  const sixMonthPayment = monthlyData.reduce((acc, curr) => acc + curr.payment, 0);
  const recoveryRate = sixMonthCredit > 0 ? Math.round((sixMonthPayment / sixMonthCredit) * 100) : 100;

  // Aging breakdown
  const now = Date.now();
  const agingFresh = activeDebtors.filter((c) => {
    const days = (now - new Date(c.lastTransactionDate).getTime()) / (1000 * 60 * 60 * 24);
    return days < 8;
  });

  const agingDue = activeDebtors.filter((c) => {
    const days = (now - new Date(c.lastTransactionDate).getTime()) / (1000 * 60 * 60 * 24);
    return days >= 8 && days < 16;
  });

  const agingOverdue = activeDebtors.filter((c) => {
    const days = (now - new Date(c.lastTransactionDate).getTime()) / (1000 * 60 * 60 * 24);
    return days >= 16;
  });

  const handleExportCSV = () => {
    const headers = ['Customer Name', 'Phone', 'Balance (INR)', 'Status', 'Last Active'];
    const rows = customers.map((c) => [
      `"${c.name}"`,
      `"${c.phone}"`,
      c.balance,
      c.balance > 0 ? 'Due' : c.balance < 0 ? 'Advance' : 'Settled',
      `"${new Date(c.lastTransactionDate).toLocaleDateString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `My_Udhari_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Custom Tooltip for the Recharts Bar Chart
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const credit = payload.find((p: any) => p.dataKey === 'credit')?.value || 0;
      const payment = payload.find((p: any) => p.dataKey === 'payment')?.value || 0;
      const diff = credit - payment;

      return (
        <div className="bg-white border border-[#c6c5d4]/80 rounded-xl p-3 shadow-xl text-xs flex flex-col gap-1.5 min-w-[160px] z-50">
          <div className="flex justify-between items-center border-b border-[#eceef1] pb-1.5">
            <span className="font-bold text-[#000666]">{label}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              diff > 0 ? 'bg-red-50 text-[#ba1a1a]' : diff < 0 ? 'bg-emerald-50 text-[#006b5f]' : 'bg-gray-100 text-[#454652]'
            }`}>
              {diff > 0 ? `+₹${formatCurrency(diff)} Due` : diff < 0 ? `₹${formatCurrency(Math.abs(diff))} Surplus` : 'Settled'}
            </span>
          </div>
          <div className="flex justify-between items-center text-[#ba1a1a] font-semibold pt-0.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#ba1a1a]" />
              <span>Credit Given:</span>
            </span>
            <span className="font-bold">₹ {formatCurrency(credit)}</span>
          </div>
          <div className="flex justify-between items-center text-[#006b5f] font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#006b5f]" />
              <span>Received:</span>
            </span>
            <span className="font-bold">₹ {formatCurrency(payment)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <main className="flex-1 px-4 py-4 flex flex-col gap-4 pb-28 max-w-md mx-auto w-full">
      {/* Top Header */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-xl font-bold text-[#000666] tracking-tight">Business Reports</h2>
          <p className="text-xs text-[#767683]">Credit recovery & ledger analytics</p>
        </div>
        <button
          id="btn-export-csv-reports"
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#c6c5d4]/60 text-xs font-bold text-[#000666] shadow-sm hover:bg-[#eceef1] active:scale-95 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Overview Cards 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Outstanding */}
        <div className="bg-[#1a237e] text-white rounded-2xl p-4 shadow-sm flex flex-col">
          <span className="text-[11px] font-medium text-[#bdc2ff] uppercase tracking-wider">
            Total Outstanding
          </span>
          <div className="text-2xl font-bold font-display mt-1">
            ₹ {formatCurrency(totalOutstanding)}
          </div>
          <span className="text-[10px] text-[#8df5e4] mt-2">
            {activeDebtors.length} Customers pending
          </span>
        </div>

        {/* Total Payments Collected */}
        <div className="bg-[#006b5f] text-white rounded-2xl p-4 shadow-sm flex flex-col">
          <span className="text-[11px] font-medium text-[#8df5e4] uppercase tracking-wider">
            Total Collected
          </span>
          <div className="text-2xl font-bold font-display mt-1">
            ₹ {formatCurrency(totalPaymentsReceived)}
          </div>
          <span className="text-[10px] text-white/80 mt-2">
            {settledCount} Accounts fully settled
          </span>
        </div>

        {/* Total Credit Given */}
        <div className="bg-white rounded-2xl p-3.5 border border-[#c6c5d4]/50 shadow-sm flex flex-col">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#ba1a1a]">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Total Credit Given</span>
          </div>
          <p className="text-lg font-bold text-[#191c1e] font-display mt-1">
            ₹ {formatCurrency(totalCreditGiven)}
          </p>
        </div>

        {/* Customer Count */}
        <div className="bg-white rounded-2xl p-3.5 border border-[#c6c5d4]/50 shadow-sm flex flex-col">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#006b5f]">
            <Users className="w-3.5 h-3.5" />
            <span>Customer Base</span>
          </div>
          <p className="text-lg font-bold text-[#191c1e] font-display mt-1">
            {customers.length} registered
          </p>
        </div>
      </div>

      {/* 6-Month Credit vs. Collection Summary Chart (Recharts) */}
      <section className="bg-white rounded-2xl p-4 border border-[#c6c5d4]/50 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#eceef1]">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#000666]" />
            <div>
              <h3 className="text-sm font-bold text-[#191c1e]">6-Month Credit vs. Payments</h3>
              <p className="text-[11px] text-[#767683]">Monthly given credit vs. cash/UPI collected</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-[#006b5f] bg-[#e7f7f4] border border-[#70d8c8]/60 px-2 py-0.5 rounded-full">
            {recoveryRate}% Recovery
          </span>
        </div>

        {/* 6-Month Quick KPI Badges */}
        <div className="grid grid-cols-2 gap-2 bg-[#f7f9fc] p-2.5 rounded-xl border border-[#c6c5d4]/40">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#767683] font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
              6-Mo Credit Given
            </span>
            <span className="text-sm font-bold text-[#ba1a1a] font-display mt-0.5">
              ₹ {formatCurrency(sixMonthCredit)}
            </span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-[#767683] font-semibold flex items-center justify-end gap-1">
              <span className="w-2 h-2 rounded-full bg-[#006b5f]" />
              6-Mo Collected
            </span>
            <span className="text-sm font-bold text-[#006b5f] font-display mt-0.5">
              ₹ {formatCurrency(sixMonthPayment)}
            </span>
          </div>
        </div>

        {/* Recharts BarChart Canvas */}
        <div className="w-full h-56 pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 8, right: 4, left: -18, bottom: 0 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eceef1" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#454652', fontWeight: 600 }}
                axisLine={{ stroke: '#c6c5d4' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#767683' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) =>
                  val >= 1000 ? `₹${(val / 1000).toFixed(val % 1000 !== 0 ? 1 : 0)}k` : `₹${val}`
                }
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '8px', fontSize: '11px', fontWeight: 600 }}
                formatter={(value) => (
                  <span className="text-[11px] font-semibold text-[#454652] ml-0.5">
                    {value === 'credit' ? 'Credit Given' : 'Payments Received'}
                  </span>
                )}
              />
              <Bar
                name="credit"
                dataKey="credit"
                fill="#ba1a1a"
                radius={[4, 4, 0, 0]}
                maxBarSize={22}
              />
              <Bar
                name="payment"
                dataKey="payment"
                fill="#006b5f"
                radius={[4, 4, 0, 0]}
                maxBarSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 8-Day Aging Analysis Section */}
      <section className="bg-white rounded-2xl p-4 border border-[#c6c5d4]/50 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#191c1e]">Credit Aging (8-Day Cycles)</h3>
          <span className="text-[10px] text-[#767683] bg-[#eceef1] px-2 py-0.5 rounded-full">
            Follow-Up Health
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          {/* 0-7 Days */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex flex-col">
            <span className="text-[10px] font-bold text-emerald-800">0 - 7 Days</span>
            <span className="text-base font-bold text-emerald-900 mt-0.5">
              {agingFresh.length}
            </span>
            <span className="text-[10px] text-emerald-700 mt-0.5">
              ₹{formatCurrency(agingFresh.reduce((a, b) => a + b.balance, 0))}
            </span>
          </div>

          {/* 8-15 Days (Action Required) */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex flex-col">
            <span className="text-[10px] font-bold text-amber-800">8 - 15 Days</span>
            <span className="text-base font-bold text-amber-900 mt-0.5">
              {agingDue.length}
            </span>
            <span className="text-[10px] text-amber-700 mt-0.5">
              ₹{formatCurrency(agingDue.reduce((a, b) => a + b.balance, 0))}
            </span>
          </div>

          {/* 16+ Days */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 flex flex-col">
            <span className="text-[10px] font-bold text-red-800">16+ Days</span>
            <span className="text-base font-bold text-red-900 mt-0.5">
              {agingOverdue.length}
            </span>
            <span className="text-[10px] text-red-700 mt-0.5">
              ₹{formatCurrency(agingOverdue.reduce((a, b) => a + b.balance, 0))}
            </span>
          </div>
        </div>
      </section>

      {/* Top Outstanding Customers */}
      <section className="flex flex-col gap-2">
        <h3 className="text-sm font-bold text-[#191c1e] px-1">Top Outstanding Balances</h3>
        <div className="bg-white rounded-2xl border border-[#c6c5d4]/40 overflow-hidden shadow-sm divide-y divide-[#eceef1]">
          {activeDebtors.slice(0, 5).map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectCustomer(c.id)}
              className="flex items-center justify-between p-3 hover:bg-[#f7f9fc] active:bg-[#eceef1] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#e0e3e6] flex items-center justify-center font-bold text-xs text-[#191c1e]">
                  {getInitials(c.name)}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#191c1e]">{c.name}</p>
                  <p className="text-[11px] text-[#767683]">{c.phone}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold text-[#ba1a1a]">₹ {formatCurrency(c.balance)}</p>
                <p className="text-[10px] text-[#767683]">Due</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};
