import React, { useEffect, useState } from 'react';
import { financialApi } from '../../services/financialApi';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Transaction } from '../../types';

export const FinancialAnalysis: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterFlagged, setFilterFlagged] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    financialApi.getTransactions()
      .then((data) => { if (mounted) setTransactions(data); })
      .catch((err) => { if (mounted) setError(err instanceof Error ? err.message : 'Unable to load transactions. Verify the backend is running.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const displayed = filterFlagged ? transactions.filter((t) => t.flagged) : transactions;
  const totalAmount = transactions.reduce((acc, t) => acc + t.amount, 0);

  const columns: Column<Transaction>[] = [
    {
      key: 'id',
      header: 'Txn ID',
      sortable: true,
      width: '110px',
      render: (t) => <span className="font-mono font-medium text-[#0078D4]">{t.id.substring(0, 8).toUpperCase()}…</span>,
    },
    {
      key: 'timestamp',
      header: 'Time',
      sortable: true,
      width: '120px',
      render: (t) => (
        <span className="text-[12px] text-[#605E5C] font-mono">
          {new Date(t.timestamp).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'sender',
      header: 'Sender',
      render: (t) => <span className="font-medium text-[#242424]">{t.sender || '—'}</span>,
    },
    {
      key: 'receiver',
      header: 'Receiver',
      render: (t) => <span className="font-medium text-[#242424]">{t.receiver || '—'}</span>,
    },
    {
      key: 'amount',
      header: 'Amount (INR)',
      sortable: true,
      align: 'right',
      render: (t) => (
        <span className="font-mono font-bold text-[#242424]">
          ₹{Number(t.amount).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'method',
      header: 'Method',
      width: '110px',
      render: (t) => <span className="text-[11px] bg-[#F3F2F1] px-2 py-0.5 rounded-[4px]">{t.method || 'UPI'}</span>,
    },
  ];

  return (
    <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto text-left">
      <div>
        <h1 className="text-[22px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
          Financial Intelligence & Layering Analysis
        </h1>
        <p className="text-[13px] text-[#605E5C]">
          Transactions extracted from uploaded evidence — fund flows, UPI transfers, and financial activity.
        </p>
      </div>

      {error && (
        <div className="bg-[#FDE7E9] border border-[#E6A6AA] rounded-[4px] p-3 text-[#A4262C] text-[13px]">{error}</div>
      )}

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E1DFDD] p-4 rounded-[4px]">
          <span className="text-[11px] font-semibold text-[#605E5C] uppercase">Total Volume</span>
          <p className="text-[22px] font-bold text-[#242424] mt-1">
            {loading ? '—' : `₹${(totalAmount / 100000).toFixed(2)} L`}
          </p>
        </div>
        <div className="bg-white border border-[#E1DFDD] p-4 rounded-[4px]">
          <span className="text-[11px] font-semibold text-[#605E5C] uppercase">Total Transactions</span>
          <p className="text-[22px] font-bold text-[#242424] mt-1">{loading ? '—' : transactions.length}</p>
        </div>
        <div className="bg-white border border-[#E1DFDD] p-4 rounded-[4px] border-l-4 border-l-[#D13438]">
          <span className="text-[11px] font-semibold text-[#D13438] uppercase">Flagged</span>
          <p className="text-[22px] font-bold text-[#D13438] mt-1">
            {loading ? '—' : transactions.filter((t) => t.flagged).length}
          </p>
        </div>
      </div>

      {/* Filter control */}
      <div className="flex items-center justify-between bg-white p-3 border border-[#E1DFDD] rounded-[4px]">
        <label className="flex items-center gap-2 text-[13px] font-semibold text-[#242424] cursor-pointer">
          <input
            type="checkbox"
            checked={filterFlagged}
            onChange={(e) => setFilterFlagged(e.target.checked)}
            className="rounded-[2px] text-[#0078D4]"
          />
          <span>Show Flagged Transactions Only</span>
        </label>
        <span className="text-[12px] text-[#605E5C] font-mono">{displayed.length} Records</span>
      </div>

      {loading ? (
        <div className="bg-white border border-[#E1DFDD] rounded-[4px] p-8 text-center text-[13px] text-[#605E5C]">
          <span className="material-symbols-outlined text-[32px] text-[#C8C6C4] block mb-2">hourglass_top</span>
          Loading transactions…
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-white border border-[#E1DFDD] rounded-[4px] p-8 text-center text-[13px] text-[#605E5C]">
          <span className="material-symbols-outlined text-[32px] text-[#C8C6C4] block mb-2">receipt_long</span>
          {transactions.length === 0
            ? 'No transactions extracted yet. Upload evidence containing financial information to extract transactions.'
            : 'No flagged transactions found.'}
        </div>
      ) : (
        <DataTable columns={columns} data={displayed} keyField="id" />
      )}
    </div>
  );
};
