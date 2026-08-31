import React, { useState } from 'react';
import { modelApi, FinancialPredictParams, FinancialPredictResponse } from '../../services/modelApi';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { RiskBadge } from '../../components/ui/Badge';

export const FinancialModelPage: React.FC = () => {
  const [params, setParams] = useState<FinancialPredictParams>({
    type: 'TRANSFER',
    amount: 180000,
    oldbalanceOrg: 180000,
    newbalanceOrig: 0,
    oldbalanceDest: 0,
    newbalanceDest: 0,
    step: 14,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FinancialPredictResponse | null>(null);

  const presets = [
    {
      label: '🚨 Account Draining (Full Transfer)',
      data: {
        type: 'TRANSFER',
        amount: 250000,
        oldbalanceOrg: 250000,
        newbalanceOrig: 0,
        oldbalanceDest: 0,
        newbalanceDest: 0,
        step: 18,
      },
    },
    {
      label: '🚨 Money Mule Cash-Out',
      data: {
        type: 'CASH_OUT',
        amount: 450000,
        oldbalanceOrg: 450000,
        newbalanceOrig: 0,
        oldbalanceDest: 50000,
        newbalanceDest: 500000,
        step: 42,
      },
    },
    {
      label: '✅ Regular Merchant Payment',
      data: {
        type: 'PAYMENT',
        amount: 1500,
        oldbalanceOrg: 25000,
        newbalanceOrig: 23500,
        oldbalanceDest: 120000,
        newbalanceDest: 121500,
        step: 8,
      },
    },
    {
      label: '✅ Standard ATM Cash Out',
      data: {
        type: 'CASH_OUT',
        amount: 10000,
        oldbalanceOrg: 50000,
        newbalanceOrig: 40000,
        oldbalanceDest: 0,
        newbalanceDest: 0,
        step: 5,
      },
    },
  ];

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await modelApi.predictFinancial(params);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Financial model evaluation failed.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto text-left max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1DFDD] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-[4px] bg-[#EFF6FC] text-[#0078D4] uppercase tracking-wider">
              AI Model 2
            </span>
            <span className="text-[11px] text-[#605E5C] font-mono">financial_model.pkl (Random Forest)</span>
          </div>
          <h1 className="text-[24px] font-bold text-[#242424] font-['Libre_Franklin',sans-serif]">
            Financial Fraud & Money Laundering Classifier
          </h1>
          <p className="text-[13px] text-[#605E5C]">
            Trained on financial transaction vectors (PaySim dataset) to identify account drainage, mule routing, and balance manipulation.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white p-3 border border-[#E1DFDD] rounded-[6px] shadow-xs">
          <div className="text-right">
            <span className="text-[11px] text-[#605E5C] block">Model Type</span>
            <span className="font-bold text-[16px] text-[#0078D4]">Random Forest</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-[#FDE7E9] border border-[#E6A6AA] rounded-[4px] p-4 text-[#A4262C] text-[13px] flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Transaction Simulator Form */}
      <div className="bg-white border border-[#E1DFDD] rounded-[8px] p-5 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-[#242424]">Transaction Feature Inputs</h2>
          <span className="text-[12px] text-[#605E5C]">Simulate individual transaction vector</span>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-[#F3F2F1]">
          <span className="text-[11px] text-[#605E5C] font-semibold">Scenario Presets:</span>
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setParams(preset.data)}
              className="text-[11px] px-2.5 py-1 bg-[#F3F2F1] hover:bg-[#E1DFDD] text-[#242424] rounded-[4px] font-medium transition-colors cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Type */}
          <div>
            <label className="text-[12px] font-semibold text-[#242424] block mb-1">Transaction Type</label>
            <select
              value={params.type}
              onChange={(e) => setParams({ ...params, type: e.target.value })}
              className="w-full h-9 px-3 border border-[#E1DFDD] rounded-[4px] text-[13px] bg-white focus:border-[#0078D4] focus:outline-none"
            >
              <option value="TRANSFER">TRANSFER</option>
              <option value="CASH_OUT">CASH_OUT</option>
              <option value="PAYMENT">PAYMENT</option>
              <option value="DEBIT">DEBIT</option>
              <option value="CASH_IN">CASH_IN</option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="text-[12px] font-semibold text-[#242424] block mb-1">Amount (INR ₹)</label>
            <Input
              type="number"
              value={params.amount}
              onChange={(e) => setParams({ ...params, amount: Number(e.target.value) })}
            />
          </div>

          {/* Sender Old Balance */}
          <div>
            <label className="text-[12px] font-semibold text-[#242424] block mb-1">Sender Old Balance (₹)</label>
            <Input
              type="number"
              value={params.oldbalanceOrg}
              onChange={(e) => setParams({ ...params, oldbalanceOrg: Number(e.target.value) })}
            />
          </div>

          {/* Sender New Balance */}
          <div>
            <label className="text-[12px] font-semibold text-[#242424] block mb-1">Sender New Balance (₹)</label>
            <Input
              type="number"
              value={params.newbalanceOrig}
              onChange={(e) => setParams({ ...params, newbalanceOrig: Number(e.target.value) })}
            />
          </div>

          {/* Receiver Old Balance */}
          <div>
            <label className="text-[12px] font-semibold text-[#242424] block mb-1">Receiver Old Balance (₹)</label>
            <Input
              type="number"
              value={params.oldbalanceDest}
              onChange={(e) => setParams({ ...params, oldbalanceDest: Number(e.target.value) })}
            />
          </div>

          {/* Receiver New Balance */}
          <div>
            <label className="text-[12px] font-semibold text-[#242424] block mb-1">Receiver New Balance (₹)</label>
            <Input
              type="number"
              value={params.newbalanceDest}
              onChange={(e) => setParams({ ...params, newbalanceDest: Number(e.target.value) })}
            />
          </div>

          {/* Step / Hour */}
          <div>
            <label className="text-[12px] font-semibold text-[#242424] block mb-1">Time Step (Hour)</label>
            <Input
              type="number"
              value={params.step}
              onChange={(e) => setParams({ ...params, step: Number(e.target.value) })}
            />
          </div>

          {/* Submit */}
          <div className="flex items-end">
            <Button
              variant="primary"
              onClick={handlePredict}
              disabled={loading}
              className="w-full h-9"
            >
              {loading ? 'Evaluating Model...' : 'Run Fraud Analysis'}
            </Button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <div
            className={`border rounded-[8px] p-6 shadow-xs ${
              result.is_fraud
                ? 'bg-[#FFF4F4] border-[#FDE7E9]'
                : 'bg-[#F4FFF4] border-[#DFF6DD]'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-[28px] font-bold ${
                    result.is_fraud ? 'bg-[#D13438] text-white' : 'bg-[#107C10] text-white'
                  }`}
                >
                  {result.is_fraud ? '!' : '✓'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[20px] font-bold text-[#242424]">
                      {result.is_fraud ? 'SUSPICIOUS FRAUD DETECTED' : 'NORMAL FINANCIAL TRANSACTION'}
                    </h3>
                    <RiskBadge risk={result.risk_level} size="md" />
                  </div>
                  <p className="text-[13px] text-[#605E5C] mt-1">
                    {result.is_fraud
                      ? 'High probability of money mule cash-out or account takeover drainage.'
                      : 'Transaction matches normal consumer or business payment parameters.'}
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 border border-[#E1DFDD] rounded-[6px] flex items-center gap-6 min-w-[240px] justify-between">
                <div>
                  <span className="text-[11px] text-[#605E5C] uppercase font-bold block">Fraud Risk</span>
                  <span
                    className={`text-[26px] font-bold font-mono ${
                      result.risk_score >= 60 ? 'text-[#D13438]' : result.risk_score >= 30 ? 'text-[#CA5010]' : 'text-[#107C10]'
                    }`}
                  >
                    {result.risk_score}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-[#605E5C] uppercase font-bold block">Probability</span>
                  <span className="text-[14px] font-mono text-[#242424]">
                    {(result.fraud_probability * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Reasons */}
            {result.reasons && result.reasons.length > 0 && (
              <div className="mt-5 pt-4 border-t border-[rgba(0,0,0,0.08)]">
                <span className="text-[12px] font-bold text-[#242424] block mb-2">Model Decision Explanations:</span>
                <div className="flex flex-col gap-1.5">
                  {result.reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[12px] text-[#444]">
                      <span className="text-[#0078D4] font-bold">•</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
