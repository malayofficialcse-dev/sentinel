import React, { useState } from 'react';
import { mockTransactions } from '../../data/mockData';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Transaction } from '../../types';

export const FinancialAnalysis: React.FC = () => {
  const [filterFlagged, setFilterFlagged] = useState(false);

  const transactions = filterFlagged
    ? mockTransactions.filter((t) => t.flagged)
    : mockTransactions;

  const totalAmount = mockTransactions.reduce((acc, t) => acc + t.amount, 0);

  const columns: Column<Transaction>[] = [
    {
      key: 'id',
      header: 'Txn ID',
      sortable: true,
      width: '110px',
      render: (t) => <span className="font-mono font-medium text-[#0078D4]">{t.id}</span>,
    },
    {
      key: 'timestamp',
      header: 'Time',
      sortable: true,
      width: '120px',
      render: (t) => (
        <span className="text-[12px] text-[#605E5C] font-mono">
          {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      key: 'sender',
      header: 'Sender',
      render: (t) => <span className="font-medium text-[#242424]">{t.sender}</span>,
    },
    {
      key: 'receiver',
      header: 'Receiver',
      render: (t) => <span className="font-medium text-[#242424]">{t.receiver}</span>,
    },
    {
      key: 'amount',
      header: 'Amount (INR)',
      sortable: true,
      align: 'right',
      render: (t) => (
        <span className="font-mono font-bold text-[#242424]">
          ₹{t.amount.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'method',
      header: 'Method',
      width: '110px',
      render: (t) => <span className="text-[11px] bg-[#F3F2F1] px-2 py-0.5 rounded-[4px]">{t.method}</span>,
    },
    {
      key: 'riskScore',
      header: 'Risk',
      sortable: true,
      width: '100px',
      render: (t) => (
        <span
          className={`text-[11px] font-bold px-1.5 py-0.5 rounded-[4px] ${
            t.riskScore >= 80 ? 'bg-[#FDE7E9] text-[#D13438]' : 'bg-[#F1FAF1] text-[#107C10]'
          }`}
        >
          {t.riskScore}%
        </span>
      ),
    },
  ];

  return (
    <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto text-left">
      <div>
        <h1 className="text-[22px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
          Financial Intelligence & Layering Analysis
        </h1>
        <p className="text-[13px] text-[#605E5C]">
          Track fund velocity, rapid UPI redistribution, money mule hops, and crypto off-ramping.
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E1DFDD] p-4 rounded-[4px]">
          <span className="text-[11px] font-semibold text-[#605E5C] uppercase">Total Volume</span>
          <p className="text-[22px] font-bold text-[#242424] mt-1">₹{(totalAmount / 100000).toFixed(1)} Lakhs</p>
        </div>
        <div className="bg-white border border-[#E1DFDD] p-4 rounded-[4px]">
          <span className="text-[11px] font-semibold text-[#605E5C] uppercase">Total Transactions</span>
          <p className="text-[22px] font-bold text-[#242424] mt-1">{mockTransactions.length}</p>
        </div>
        <div className="bg-white border border-[#E1DFDD] p-4 rounded-[4px] border-l-4 border-l-[#D13438]">
          <span className="text-[11px] font-semibold text-[#D13438] uppercase">Suspicious Flagged</span>
          <p className="text-[22px] font-bold text-[#D13438] mt-1">
            {mockTransactions.filter((t) => t.flagged).length}
          </p>
        </div>
        <div className="bg-white border border-[#E1DFDD] p-4 rounded-[4px]">
          <span className="text-[11px] font-semibold text-[#605E5C] uppercase">High Risk Mules</span>
          <p className="text-[22px] font-bold text-[#CA5010] mt-1">5 Accounts</p>
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
        <span className="text-[12px] text-[#605E5C] font-mono">{transactions.length} Records</span>
      </div>

      <DataTable columns={columns} data={transactions} keyField="id" />
    </div>
  );
};
