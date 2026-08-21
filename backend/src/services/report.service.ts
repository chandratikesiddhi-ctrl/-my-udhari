import { customerRepository } from '../repositories/customer.repository';
import { transactionRepository } from '../repositories/transaction.repository';
import { storeRepository } from '../repositories/store.repository';

export class ReportService {
  async getSummaryReport() {
    const customers = await customerRepository.findAll();
    const transactions = await transactionRepository.findAll();
    const store = await storeRepository.getProfile();

    const totalOutstanding = customers.reduce((sum, c) => (c.balance > 0 ? sum + c.balance : sum), 0);
    const totalCreditGiven = transactions
      .filter((t) => t.type === 'CREDIT')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalPaymentsReceived = transactions
      .filter((t) => t.type === 'PAYMENT')
      .reduce((sum, t) => sum + t.amount, 0);

    const settledCount = customers.filter((c) => c.balance === 0).length;
    const activeDebtors = customers.filter((c) => c.balance > 0);

    // 6 Months trend calculation
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

    const monthlyBreakdown = monthsList.map((m) => {
      const txsInMonth = transactions.filter((t) => {
        if (!t.timestamp) return false;
        const txDate = new Date(t.timestamp);
        return txDate.getFullYear() === m.year && txDate.getMonth() === m.monthIndex;
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

    const sixMonthCredit = monthlyBreakdown.reduce((acc, curr) => acc + curr.credit, 0);
    const sixMonthPayment = monthlyBreakdown.reduce((acc, curr) => acc + curr.payment, 0);
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

    return {
      storeName: store.name,
      totalOutstanding,
      totalCreditGiven,
      totalPaymentsReceived,
      recoveryRate,
      activeDebtorsCount: activeDebtors.length,
      settledCount,
      monthlyBreakdown,
      agingBreakdown: {
        fresh: {
          count: agingFresh.length,
          amount: agingFresh.reduce((s, c) => s + c.balance, 0),
        },
        due: {
          count: agingDue.length,
          amount: agingDue.reduce((s, c) => s + c.balance, 0),
        },
        overdue: {
          count: agingOverdue.length,
          amount: agingOverdue.reduce((s, c) => s + c.balance, 0),
        },
      },
    };
  }

  async generateLedgerCsv(): Promise<string> {
    const customers = await customerRepository.findAll();
    const headers = ['Customer Name', 'Phone', 'Balance (INR)', 'Status', 'Last Active'];
    const rows = customers.map((c) => [
      `"${c.name}"`,
      `"${c.phone}"`,
      c.balance,
      c.balance > 0 ? 'Due' : c.balance < 0 ? 'Advance' : 'Settled',
      `"${new Date(c.lastTransactionDate).toLocaleDateString('en-IN')}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}

export const reportService = new ReportService();
